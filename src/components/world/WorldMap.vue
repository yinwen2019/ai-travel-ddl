<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { CityData, CityKey, LatLngBounds } from '@/types/worldView'
import type { ConferenceGlobe } from '@/types/globe'
import WorldLegend from './WorldLegend.vue'
import WorldCityPanel from './WorldCityPanel.vue'
import { GLOBE_LANDMARKS } from '@/data/globeLandmarks'
import { useTheme } from '@/composables/useTheme'
import { GLOBE_THEMES } from '@/utils/globeTheme'
import { loadGlobeGeometry } from '@/utils/loadGlobeGeometry'
import '@/styles/globe.css'

const props = defineProps<{
  cityIndex: Map<CityKey, CityData>
  highlightedCity: CityKey | null
  pinnedCity: CityKey | null
}>()
const emit = defineEmits<{
  pin: [cityKey: CityKey]
  'map-error': []
  hover: [cityKey: CityKey | null]
}>()
const { theme } = useTheme()
const shell = ref<HTMLElement | null>(null)
const host = ref<HTMLElement | null>(null)
const loading = ref(true)
const failed = ref(false)
const reducedMotion = ref(false)
const playing = ref(true)
const fullscreen = ref(false)
const landmarks = ref(true)
const hoverCity = ref<CityData | null>(null)
const cityPanel = ref<InstanceType<typeof WorldCityPanel> | null>(null)
const cityPicker = ref<HTMLSelectElement | null>(null)
let globe: ConferenceGlobe | null = null
let observer: ResizeObserver | null = null
let intersection: IntersectionObserver | null = null
let abort: AbortController | null = null
let disposed = false
let motionQuery: MediaQueryList | null = null
let visible = true
let previousFocus: HTMLElement | null = null
let savedOverflow = ''
const cities = computed(() =>
  [...props.cityIndex.values()].sort((a, b) => a.city.localeCompare(b.city)),
)
const selectedCity = computed(() =>
  props.pinnedCity ? (props.cityIndex.get(props.pinnedCity) ?? null) : null,
)
const previewCity = computed(() => (!selectedCity.value ? hoverCity.value : null))
const selectedLandmark = computed(() =>
  GLOBE_LANDMARKS.find((item) => item.cityKey === props.pinnedCity),
)
const miniaturePreviews = computed(() =>
  GLOBE_LANDMARKS.filter((item) => item.previewLabel && props.cityIndex.has(item.cityKey)),
)
function previewMiniature(key: CityKey) {
  landmarks.value = true
  const city = props.cityIndex.get(key)
  if (key === props.pinnedCity && city) globe?.flyToCity(city)
  else selectCity(key)
}
function syncMotion() {
  globe?.setMotion(playing.value && !reducedMotion.value)
}
function setVisibility() {
  globe?.setVisible(visible && !document.hidden)
}
function onMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  globe?.setReducedMotion(event.matches)
  syncMotion()
}
function selectCity(key: CityKey) {
  emit('pin', key)
}
function closePanel() {
  if (props.pinnedCity) emit('pin', props.pinnedCity)
}
function onPicker(event: Event) {
  const key = (event.target as HTMLSelectElement).value
  if (key) selectCity(key)
}
function setFullscreen(value: boolean) {
  if (fullscreen.value === value) return
  fullscreen.value = value
  if (value) {
    savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else document.body.style.overflow = savedOverflow
  nextTick(() => shell.value?.querySelector<HTMLButtonElement>('[data-fullscreen]')?.focus())
}
function handleKeys(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (selectedCity.value) closePanel()
    else if (fullscreen.value) setFullscreen(false)
  }
  // 页面全屏时只在场景控件中循环焦点，避免跳到背后的年表。
  if (event.key === 'Tab' && fullscreen.value && shell.value) {
    const elements = [
      ...shell.value.querySelectorAll<HTMLElement>(
        'button:not(:disabled), select, a[href], [tabindex="0"]',
      ),
    ].filter((element) => element.offsetParent !== null)
    const first = elements[0]
    const last = elements[elements.length - 1]
    if (
      event.shiftKey &&
      (document.activeElement === first || !shell.value.contains(document.activeElement))
    ) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }
}
async function init() {
  if (!host.value) return
  abort?.abort()
  abort = new AbortController()
  const current = abort
  globe?.destroy()
  globe = null
  loading.value = true
  failed.value = false
  try {
    const [{ createConferenceGlobe }, geometry] = await Promise.all([
      import('@/utils/createConferenceGlobe'),
      loadGlobeGeometry(current.signal),
    ])
    if (disposed || current.signal.aborted || !host.value) return
    const instance = await createConferenceGlobe(
      host.value,
      {
        theme: theme.value,
        reducedMotion: reducedMotion.value,
        cities: cities.value,
        onHover(city) {
          hoverCity.value = city
          emit('hover', city?.cityKey ?? null)
        },
        onSelect(city) {
          selectCity(city.cityKey)
        },
        onError() {
          failed.value = true
          globe?.setVisible(false)
          emit('map-error')
        },
      },
      current.signal,
      geometry,
    )
    if (disposed || current.signal.aborted) {
      instance.destroy()
      return
    }
    globe = instance
    globe.setTheme(theme.value)
    globe.setReducedMotion(reducedMotion.value)
    globe.setActive(props.highlightedCity, props.pinnedCity)
    globe.setLandmarks(landmarks.value)
    if (selectedCity.value) globe.flyToCity(selectedCity.value)
    await globe.ready()
    if (disposed || current.signal.aborted) return
    syncMotion()
    setVisibility()
    loading.value = false
  } catch (error) {
    if (current.signal.aborted || disposed) return
    console.warn('[WorldGlobe] 场景无法加载', error)
    globe?.destroy()
    globe = null
    failed.value = true
    loading.value = false
    emit('map-error')
  }
}
function flyToBounds(bounds: LatLngBounds) {
  globe?.flyToBounds(bounds)
  shell.value?.scrollIntoView({
    behavior: reducedMotion.value ? 'instant' : 'smooth',
    block: 'center',
  })
}
watch(
  () => props.highlightedCity,
  () => globe?.setActive(props.highlightedCity, props.pinnedCity),
)
watch(
  () => props.pinnedCity,
  (key) => {
    globe?.setActive(props.highlightedCity, key)
    const city = key ? props.cityIndex.get(key) : null
    if (city) {
      const active = document.activeElement
      if (active instanceof HTMLElement && !active.closest('.globe-city-detail'))
        previousFocus = active
      globe?.flyToCity(city)
      shell.value?.scrollIntoView({
        behavior: reducedMotion.value ? 'instant' : 'smooth',
        block: 'center',
      })
      nextTick(() => cityPanel.value?.focus())
    } else {
      nextTick(() => {
        const canRestore =
          previousFocus?.isConnected && (!fullscreen.value || shell.value?.contains(previousFocus))
        const target = canRestore ? previousFocus : cityPicker.value
        target?.focus({ preventScroll: true })
      })
    }
  },
)
watch(cities, () => globe?.setCities(cities.value))
watch(theme, (value) => globe?.setTheme(value))
watch(playing, syncMotion)
watch(landmarks, (value) => globe?.setLandmarks(value))
onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', onMotionChange)
  document.addEventListener('visibilitychange', setVisibility)
  document.addEventListener('keydown', handleKeys)
  observer = new ResizeObserver(([entry]) => {
    if (entry.contentRect.width && entry.contentRect.height)
      globe?.resize(entry.contentRect.width, entry.contentRect.height)
  })
  if (host.value) observer.observe(host.value)
  intersection = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting
      setVisibility()
    },
    { threshold: 0.05 },
  )
  if (shell.value) intersection.observe(shell.value)
  init()
})
onBeforeUnmount(() => {
  disposed = true
  abort?.abort()
  observer?.disconnect()
  intersection?.disconnect()
  motionQuery?.removeEventListener('change', onMotionChange)
  document.removeEventListener('visibilitychange', setVisibility)
  document.removeEventListener('keydown', handleKeys)
  if (fullscreen.value) document.body.style.overflow = savedOverflow
  globe?.destroy()
})
defineExpose({ flyToBounds })
</script>

<template>
  <section
    ref="shell"
    class="globe-shell"
    :data-theme="theme"
    :style="GLOBE_THEMES[theme].css"
    :class="{ 'is-fullscreen': fullscreen, 'is-loading': loading }"
    aria-label="三维世界会议地图"
    :role="fullscreen ? 'dialog' : 'region'"
    :aria-modal="fullscreen || undefined"
    :aria-busy="loading"
  >
    <div
      ref="host"
      class="globe-canvas"
      @pointerenter="globe?.setPaused(true)"
      @pointerleave="globe?.setPaused(false)"
    ></div>
    <div v-if="loading && !failed" class="globe-loading" role="status">
      <span class="globe-loading-indicator" aria-hidden="true"></span
      ><span>正在展开研究的世界…</span>
    </div>
    <div v-if="failed" class="globe-failure" role="status">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18" />
      </svg>
      <h2>暂时无法展开 3D 地球</h2>
      <p>请重试，或继续使用下方年表查看会议。</p>
      <button class="globe-button" @click="init">重新加载</button>
      <button
        v-if="fullscreen"
        class="globe-button"
        aria-label="退出全屏地图"
        @click="setFullscreen(false)"
      >
        退出全屏
      </button>
    </div>
    <template v-if="!failed">
      <div class="globe-intro">
        <h2>研究的足迹</h2>
        <p>{{ cityIndex.size }} 座城市，连接每一次相遇。</p>
      </div>
      <div class="globe-miniature-previews" aria-label="探索城市微缩景观">
        <span>城市微缩景观</span>
        <div>
          <button
            v-for="item in miniaturePreviews"
            :key="item.cityKey"
            :aria-label="`探索${item.previewLabel}微缩景观`"
            :aria-pressed="pinnedCity === item.cityKey"
            :disabled="loading"
            @click="previewMiniature(item.cityKey)"
          >
            {{ item.previewLabel }}
          </button>
        </div>
      </div>
      <div class="globe-topbar">
        <label class="globe-city-picker"
          ><svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4.5 4.5" /></svg
          ><span class="sr-only">定位举办城市</span
          ><select
            ref="cityPicker"
            :value="pinnedCity || ''"
            :disabled="loading"
            @change="onPicker"
          >
            <option value="">定位城市</option>
            <option v-for="city in cities" :key="city.cityKey" :value="city.cityKey">
              {{ city.city }} · {{ city.totalCount }} 场
            </option>
          </select></label
        >
        <button
          class="globe-icon-button"
          data-fullscreen
          :aria-label="fullscreen ? '退出全屏地图' : '全屏查看地图'"
          :aria-pressed="fullscreen"
          @click="setFullscreen(!fullscreen)"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path v-if="!fullscreen" d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
            <path v-else d="M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5" />
          </svg>
        </button>
      </div>
      <div v-if="previewCity && !loading" class="globe-hover-card" aria-live="off">
        <strong>{{ previewCity.city }}</strong
        ><span>{{ previewCity.country }} · 共 {{ previewCity.totalCount }} 场</span
        ><span>点击查看会议</span>
      </div>
      <div v-if="selectedCity" class="globe-city-detail">
        <WorldCityPanel ref="cityPanel" :city="selectedCity" @close="closePanel" />
        <p v-if="selectedLandmark && landmarks" class="globe-landmark-note">
          <strong>{{ selectedLandmark.name }}</strong>
          <span v-if="selectedLandmark.features">{{ selectedLandmark.features }}</span>
          <span>城市意象组合，非真实布局或会议场馆。</span>
        </p>
      </div>
      <div class="globe-tools" aria-label="地球显示控制">
        <button
          class="globe-icon-button"
          :aria-label="playing && !reducedMotion ? '暂停地球动画' : '播放地球动画'"
          :aria-pressed="playing && !reducedMotion"
          :disabled="loading || reducedMotion"
          :title="reducedMotion ? '已遵循系统减少动态效果设置' : ''"
          @click="playing = !playing"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <path v-if="playing && !reducedMotion" d="M8 5v14M16 5v14" />
            <path v-else d="m8 5 11 7-11 7Z" />
          </svg>
        </button>
        <span class="globe-tool-divider"></span>
        <button
          class="globe-icon-button"
          aria-label="放大地球"
          :disabled="loading"
          @click="globe?.zoom(0.55)"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button
          class="globe-icon-button"
          aria-label="缩小地球"
          :disabled="loading"
          @click="globe?.zoom(1 / 0.55)"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
          </svg>
        </button>
        <button
          class="globe-icon-button"
          aria-label="恢复全球视角"
          :disabled="loading"
          @click="globe?.reset()"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path d="M4 10a8 8 0 1 1 1.5 7M4 4v6h6" />
          </svg>
        </button>
        <span class="globe-tool-divider"></span>
        <button
          class="globe-icon-button"
          aria-label="显示卡通地标"
          :aria-pressed="landmarks"
          :disabled="loading"
          @click="landmarks = !landmarks"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path d="M3 21h18M7 21V9l5-6 5 6v12M7 13h10M12 3v18" />
          </svg>
        </button>
      </div>
      <aside class="globe-legend-panel" aria-label="地图图例">
        <WorldLegend />
      </aside>
      <p class="globe-hint">拖动旋转<span> · 双指或滚轮缩放</span></p>
    </template>
  </section>
</template>
