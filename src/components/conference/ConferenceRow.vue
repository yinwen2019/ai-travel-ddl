<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Conference, YearEntry } from '@/types/conference'
import { useDDLStatus } from '@/composables/useDDLStatus'
import BadgeTag from '@/components/common/BadgeTag.vue'
import ConferenceCard from './ConferenceCard.vue'

const props = defineProps<{ conference: Conference }>()
const { isDateFuture } = useDDLStatus()
const viewport = ref<HTMLDivElement | null>(null)
const activeYear = ref<number | null>(null)
const sortedYears = computed(() => [...props.conference.years].sort((a, b) => b.year - a.year))
const activeIndex = computed(() =>
  sortedYears.value.findIndex((entry) => entry.year === activeYear.value),
)
const newerYear = computed(() => sortedYears.value[activeIndex.value - 1]?.year)
const olderYear = computed(() => sortedYears.value[activeIndex.value + 1]?.year)
const viewportId = computed(() => `conference-years-${props.conference.id}`)
let scrollTimer: ReturnType<typeof setTimeout> | undefined
let resizeObserver: ResizeObserver | undefined

function isEntryEnded(entry: YearEntry): boolean {
  return entry.type === 'history' || (!!entry.end_date && !isDateFuture(entry.end_date))
}

function centerActiveYear(smooth = false) {
  const track = viewport.value
  const slide = track?.querySelector<HTMLElement>(`[data-year="${activeYear.value}"]`)
  if (!track || !slide) return
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  track.scrollTo({
    left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
    behavior: smooth && !reduceMotion ? 'smooth' : 'instant',
  })
}

function selectYear(year: number | undefined) {
  if (year == null) return
  clearTimeout(scrollTimer)
  activeYear.value = year
  centerActiveYear(true)
}

function onScroll() {
  clearTimeout(scrollTimer)
  // 等滑动停下再更新焦点，避免经过中间年份时反复切换卡片状态。
  scrollTimer = setTimeout(() => {
    const track = viewport.value
    if (!track) return
    const center = track.scrollLeft + track.clientWidth / 2
    let closest: HTMLElement | null = null
    let distance = Number.POSITIVE_INFINITY
    for (const slide of track.querySelectorAll<HTMLElement>('[data-year]')) {
      const currentDistance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center)
      if (currentDistance < distance) {
        closest = slide
        distance = currentDistance
      }
    }
    if (closest) activeYear.value = Number(closest.dataset.year)
  }, 150)
}

function onKeydown(event: KeyboardEvent) {
  // 卡片内链接保持原生键盘行为，年份导航由轮播区域和箭头按钮接收。
  if (event.target !== viewport.value) return
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    selectYear(newerYear.value)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    selectYear(olderYear.value)
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    selectYear(
      event.key === 'Home'
        ? sortedYears.value[0]?.year
        : sortedYears.value[sortedYears.value.length - 1]?.year,
    )
  }
}

watch(
  sortedYears,
  async (years) => {
    if (!years.some((entry) => entry.year === activeYear.value)) {
      const upcomingYears = years.filter((entry) => !isEntryEnded(entry))
      activeYear.value = upcomingYears[upcomingYears.length - 1]?.year ?? years[0]?.year ?? null
    }
    await nextTick()
    centerActiveYear()
  },
  { immediate: true },
)

onMounted(() => {
  resizeObserver = new ResizeObserver(() => centerActiveYear())
  if (viewport.value) resizeObserver.observe(viewport.value)
  centerActiveYear()
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  clearTimeout(scrollTimer)
})
</script>

<template>
  <section class="conference-row" :aria-labelledby="`conference-heading-${conference.id}`">
    <div class="conference-row-heading">
      <div class="flex items-center gap-3">
        <h2 :id="`conference-heading-${conference.id}`">{{ conference.name }}</h2>
        <BadgeTag :label="conference.category" :category="conference.category" />
      </div>
      <p>{{ conference.full_name }}</p>
      <router-link :to="`/conference/${conference.id}`" class="text-link">历届详情</router-link>
    </div>

    <div v-if="sortedYears.length" class="conference-carousel">
      <div class="conference-carousel-stage">
        <div
          :id="viewportId"
          ref="viewport"
          class="conference-carousel-viewport"
          tabindex="0"
          role="region"
          aria-roledescription="轮播"
          :aria-label="`${conference.name} 历年会议`"
          @scroll.passive="onScroll"
          @keydown="onKeydown"
        >
          <div
            v-for="(entry, index) in sortedYears"
            :key="entry.year"
            class="conference-slide"
            :class="{
              'is-active': entry.year === activeYear,
              'is-before': index < activeIndex,
            }"
            :data-year="entry.year"
            :inert="entry.year !== activeYear"
            :aria-hidden="entry.year !== activeYear"
            role="group"
            aria-roledescription="卡片"
            :aria-label="`${conference.name} ${entry.year}`"
          >
            <ConferenceCard :conference="conference" :year="entry.year" />
          </div>
        </div>
        <button
          type="button"
          class="icon-button carousel-arrow carousel-arrow-previous"
          :disabled="newerYear == null"
          :aria-controls="viewportId"
          :aria-label="`${conference.name} 下一届${newerYear == null ? '' : ` ${newerYear}`}`"
          :title="newerYear == null ? '已到最新一届' : `下一届 ${newerYear}`"
          @click="selectYear(newerYear)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <path d="m15 6-6 6 6 6" />
          </svg>
        </button>
        <button
          type="button"
          class="icon-button carousel-arrow carousel-arrow-next"
          :disabled="olderYear == null"
          :aria-controls="viewportId"
          :aria-label="`${conference.name} 上一届${olderYear == null ? '' : ` ${olderYear}`}`"
          :title="olderYear == null ? '已到最早一届' : `上一届 ${olderYear}`"
          @click="selectYear(olderYear)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>
      <p class="carousel-position" aria-live="polite" aria-atomic="true">
        <span>{{ activeYear }}</span>
        <span>{{ activeIndex + 1 }} / {{ sortedYears.length }} 届</span>
      </p>
    </div>
    <p v-else class="conference-row-empty">历届信息待公布</p>
  </section>
</template>
