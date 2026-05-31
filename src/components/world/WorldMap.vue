<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GeoJsonObject } from 'geojson'
import type { CityData, CityKey, ConferenceRef, LatLngBounds } from '@/types/worldView'
import { CATEGORY_COLORS, CATEGORY_CONFIG } from '@/constants'
import worldLandUrl from '@/assets/maps/world-land.geojson?url'
import WorldLegend from './WorldLegend.vue'

// ============================================================
// Props & Emits
// ============================================================

const props = defineProps<{
  cityIndex: Map<CityKey, CityData>
  highlightedCity: CityKey | null
  pinnedCity: CityKey | null
}>()

const emit = defineEmits<{
  pin: [cityKey: CityKey]
  'map-error': []
}>()

// ============================================================
// 响应式状态
// ============================================================

const mapContainer = ref<HTMLDivElement | null>(null)
const mapLoadFailed = ref(false)

let map: L.Map | null = null
let baseMapLayer: L.GeoJSON | null = null
const markers = new Map<CityKey, L.CircleMarker>()
let darkObserver: MutationObserver | null = null
const worldBounds = L.latLngBounds([-85, -180], [85, 180])

// ============================================================
// 颜色读取（从 CSS 变量动态获取，自动适配深色模式）
// ============================================================

function getCssColor(varName: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim()
  return value || '#9ca3af'
}

function getDotColor(city: CityData): string {
  if (city.dotColor === 'history') return getCssColor('--world-dot-history')
  return CATEGORY_COLORS[city.dotColor]
}

function getDotBorderColor(): string {
  return getCssColor('--world-dot-border')
}

function getBaseMapStyle(): L.PathOptions {
  return {
    fillColor: getCssColor('--world-map-land'),
    color: getCssColor('--world-map-border'),
    weight: 0.8,
    fillOpacity: 1,
    opacity: 1,
  }
}

// ============================================================
// 光点大小映射
// ============================================================

function tierToRadius(tier: number): number {
  const map: Record<number, number> = { 1: 8, 2: 12, 3: 16, 4: 20, 5: 25 }
  return map[tier] || 8
}

// ============================================================
// Tooltip HTML 构建
// ============================================================

type TooltipDeadlineKind = 'Abstract' | 'Submission'

interface TooltipDeadline {
  kind: TooltipDeadlineKind
  date: string
}

function getTodayUtcTime(): number {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return today.getTime()
}

function getDateTime(dateStr: string | null): number | null {
  if (!dateStr) return null
  const date = new Date(`${dateStr}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return null
  return date.getTime()
}

function getTooltipDeadline(ref: ConferenceRef): string {
  const todayTime = getTodayUtcTime()
  const deadlines: TooltipDeadline[] = [
    ...(ref.abstractDdl ?? []).map((ddl) => ({
      kind: 'Abstract' as const,
      date: ddl.date,
    })),
    ...(ref.paperDdl ?? []).map((ddl) => ({
      kind: 'Submission' as const,
      date: ddl.date,
    })),
  ]

  const nextDeadline = deadlines
    .filter((ddl) => {
      const dateTime = getDateTime(ddl.date)
      return dateTime != null && dateTime >= todayTime
    })
    .sort((a, b) => {
      const aTime = getDateTime(a.date) ?? Number.POSITIVE_INFINITY
      const bTime = getDateTime(b.date) ?? Number.POSITIVE_INFINITY
      return aTime - bTime
    })[0]

  if (nextDeadline) {
    return `<br/><span class="text-xs" style="color: var(--color-urgent)">${nextDeadline.kind}: ${nextDeadline.date}</span>`
  }

  const startTime = getDateTime(ref.startDate)
  const endTime = getDateTime(ref.endDate)
  if (
    ref.startDate &&
    (startTime == null || startTime >= todayTime || (endTime != null && endTime >= todayTime))
  ) {
    return `<br/><span class="text-xs" style="color: var(--color-travel)">Travel: ${ref.startDate}</span>`
  }

  return ''
}

function buildTooltipContent(city: CityData): string {
  const confs = [...city.conferences].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'upcoming' ? -1 : 1
    return b.year - a.year
  })

  const lines = confs.map((ref) => {
    const catLabel = CATEGORY_CONFIG[ref.category]?.short || ref.category
    const typeLabel = ref.type === 'upcoming' ? 'upcoming' : 'history'
    let line = `<span class="text-xs text-gray-400">[${catLabel}]</span> <strong>${ref.conferenceName}</strong> — ${ref.year} <em>(${typeLabel})</em>`

    // DDL 信息（仅 upcoming）
    if (ref.type === 'upcoming') {
      line += getTooltipDeadline(ref)
    }

    return `<div style="margin-bottom:2px;line-height:1.4">${line}</div>`
  })

  return `
    <div style="font-weight:700;margin-bottom:4px;font-size:0.9rem">${city.city}, ${city.country}</div>
    <div style="font-size:0.75rem;color:var(--color-text-secondary);margin-bottom:4px">
      共 ${city.totalCount} 场 · 历史 ${city.historyCount} · 即将 ${city.upcomingCount}
    </div>
    ${lines.join('')}
  `
}

// ============================================================
// Marker 创建/更新
// ============================================================

function createMarkers(): void {
  if (!map) return

  // 清除旧标记
  for (const [, marker] of markers) {
    map.removeLayer(marker)
  }
  markers.clear()
  // 创建新标记
  const cities = Array.from(props.cityIndex.values())

  for (const city of cities) {
    const radius = tierToRadius(city.sizeTier)
    const color = getDotColor(city)
    const borderColor = getDotBorderColor()

    const marker = L.circleMarker([city.lat, city.lng], {
      radius,
      fillColor: color,
      color: borderColor,
      weight: 1.5,
      fillOpacity: 0.85,
    })

    // Tooltip
    const tooltip = L.tooltip({
      direction: 'auto',
      offset: [0, -radius - 4],
      className: 'world-tooltip',
      opacity: 0.95,
    }).setContent(buildTooltipContent(city))

    marker.bindTooltip(tooltip)

    // 事件处理
    marker.on('mouseover', () => {
      if (!props.pinnedCity || props.pinnedCity !== city.cityKey) {
        marker.openTooltip()
      }
      highlightMarker(city.cityKey, true)
    })

    marker.on('mouseout', () => {
      if (!props.pinnedCity || props.pinnedCity !== city.cityKey) {
        marker.closeTooltip()
      }
      highlightMarker(city.cityKey, false)
    })

    marker.on('click', () => {
      emit('pin', city.cityKey)
      // fly-to 由父组件处理（在 togglePin 后通过 watch 触发）
    })

    marker.addTo(map)
    markers.set(city.cityKey, marker)
  }

  // 恢复固定状态
  if (props.pinnedCity && markers.has(props.pinnedCity)) {
    const m = markers.get(props.pinnedCity)!
    m.openTooltip()
  }
}

// ============================================================
// 高亮控制
// ============================================================

function highlightMarker(cityKey: CityKey, on: boolean): void {
  const marker = markers.get(cityKey)
  if (!marker) return

  if (on) {
    const city = props.cityIndex.get(cityKey)
    const baseRadius = city ? tierToRadius(city.sizeTier) : 8
    marker.setRadius(baseRadius * 1.5)
    marker.bringToFront()
    marker.setStyle({ fillOpacity: 1, weight: 3 })
  } else {
    const city = props.cityIndex.get(cityKey)
    const baseRadius = city ? tierToRadius(city.sizeTier) : 8
    marker.setRadius(baseRadius)
    marker.setStyle({ fillOpacity: 0.85, weight: 1.5 })
  }
}

// ============================================================
// Fly-to（父组件通过 defineExpose 调用）
// ============================================================

function flyToBounds(bounds: LatLngBounds): void {
  if (!map) return
  const leafletBounds = L.latLngBounds(
    [bounds.minLat, bounds.minLng],
    [bounds.maxLat, bounds.maxLng],
  )
  map.flyToBounds(leafletBounds, { padding: [40, 40], duration: 1.2 })
}

function flyToCity(lat: number, lng: number): void {
  if (!map) return
  map.flyTo([lat, lng], Math.max(map.getZoom(), 6), { duration: 0.8 })
}

// ============================================================
// 刷新标记颜色（深色模式切换时调用）
// ============================================================

function refreshMarkerColors(): void {
  for (const [key, marker] of markers) {
    const city = props.cityIndex.get(key)
    if (!city) continue
    const color = getDotColor(city)
    const borderColor = getDotBorderColor()
    marker.setStyle({ fillColor: color, color: borderColor })
  }
}

function refreshBaseMapStyle(): void {
  if (!baseMapLayer) return
  baseMapLayer.setStyle(getBaseMapStyle())
}

async function addLocalBaseMap(): Promise<void> {
  if (!map) return

  const response = await fetch(worldLandUrl)
  if (!response.ok) {
    throw new Error(`Local world map failed to load: ${response.status}`)
  }

  const data = (await response.json()) as GeoJsonObject
  baseMapLayer = L.geoJSON(data, {
    interactive: false,
    style: getBaseMapStyle,
  }).addTo(map)
}

function destroyMap(): void {
  markers.clear()
  baseMapLayer = null

  if (map) {
    map.remove()
    map = null
  }
}

async function initializeMap(): Promise<void> {
  if (!mapContainer.value) return

  destroyMap()
  mapLoadFailed.value = false

  try {
    // 初始化地图
    map = L.map(mapContainer.value, {
      center: [25, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 8,
      maxBounds: worldBounds,
      maxBoundsViscosity: 0.8,
      scrollWheelZoom: true,
      zoomControl: false,
      preferCanvas: false,
      attributionControl: false,
    })

    L.control.zoom({ position: 'topright' }).addTo(map)

    await addLocalBaseMap()

    // 创建标记
    createMarkers()

    // 深色模式监听
    if (!darkObserver) {
      darkObserver = new MutationObserver(() => {
        refreshBaseMapStyle()
        refreshMarkerColors()
      })
      darkObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })
    }
  } catch {
    destroyMap()
    mapLoadFailed.value = true
    emit('map-error')
  }
}

async function retryMap(): Promise<void> {
  mapLoadFailed.value = false
  await nextTick()
  await initializeMap()
}

// ============================================================
// 生命周期
// ============================================================

onMounted(async () => {
  await nextTick()
  await initializeMap()
})

onBeforeUnmount(() => {
  if (darkObserver) {
    darkObserver.disconnect()
    darkObserver = null
  }
  destroyMap()
})

// ============================================================
// Watch Props
// ============================================================

// 数据变更 → 重建标记
watch(
  () => props.cityIndex,
  () => {
    createMarkers()
  },
  { deep: true },
)

// 高亮城市变更
watch(
  () => props.highlightedCity,
  (newVal, oldVal) => {
    if (oldVal) highlightMarker(oldVal, false)
    if (newVal) highlightMarker(newVal, true)
  },
)

// 固定城市变更 → 打开/关闭 tooltip + flyTo
watch(
  () => props.pinnedCity,
  (newVal, oldVal) => {
    // 关闭旧固定
    if (oldVal) {
      const oldMarker = markers.get(oldVal)
      if (oldMarker) {
        oldMarker.closeTooltip()
      }
    }

    // 打开新固定
    if (newVal) {
      const newMarker = markers.get(newVal)
      if (newMarker) {
        newMarker.openTooltip()
        // 平滑居中
        const city = props.cityIndex.get(newVal)
        if (city) {
          flyToCity(city.lat, city.lng)
        }
      }
    }
  },
)

defineExpose({ flyToBounds })
</script>

<template>
  <div class="world-map-container">
    <!-- 地图实例 -->
    <div
      v-if="!mapLoadFailed"
      ref="mapContainer"
      class="h-full w-full"
    ></div>

    <!-- 地图加载失败占位 -->
    <div v-else class="world-map-error">
      <div class="world-map-error-icon">🗺️</div>
      <div class="world-map-error-text">地图加载失败</div>
      <button class="world-map-error-retry" @click="retryMap">
        重试
      </button>
    </div>

    <!-- 图例 -->
    <WorldLegend />
  </div>
</template>
