<script setup lang="ts">
import { computed } from 'vue'
import type { ConferenceCardProps, DDLUrgency } from '@/types/view'
import { useDDLStatus } from '@/composables/useDDLStatus'
import BadgeTag from '@/components/common/BadgeTag.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import CityLink from '@/components/location/CityLink.vue'

const props = withDefaults(defineProps<ConferenceCardProps>(), { compact: false })

const { getUrgency, getRelativeDays, isDateFuture, getEarliestUpcomingDDL, hasDeadline } =
  useDDLStatus()

const entry = computed(() => {
  return props.conference.years.find((y) => y.year === props.year)
})

const isHistory = computed(() => {
  return entry.value?.type === 'history'
})

const isEnded = computed(() => {
  if (isHistory.value) return true
  if (!entry.value) return false
  if (!entry.value.end_date) return false
  return !isDateFuture(entry.value.end_date)
})

const isHistoricalDisplay = computed(() => isHistory.value || isEnded.value)

const isMeetingInProgress = computed(() => {
  if (isHistoricalDisplay.value || !entry.value?.start_date) return false
  const daysToStart = getRelativeDays(entry.value.start_date)
  if (daysToStart == null || daysToStart > 0) return false
  return entry.value.end_date ? isDateFuture(entry.value.end_date) : true
})

const displayDDL = computed(() => {
  if (isHistoricalDisplay.value || isMeetingInProgress.value || !entry.value) return null
  return getEarliestUpcomingDDL(entry.value)
})

const displayDDLUrgency = computed(() => {
  if (!displayDDL.value) return null
  return getUrgency(displayDDL.value.date)
})

const urgency = computed<DDLUrgency>(() => {
  if (isHistoricalDisplay.value) return 'expired'
  if (isMeetingInProgress.value) return 'travel'
  if (
    !displayDDL.value &&
    entry.value &&
    hasDeadline(entry.value) &&
    entry.value?.start_date &&
    isDateFuture(entry.value.start_date)
  ) {
    return 'travel'
  }
  return displayDDLUrgency.value ?? 'ample'
})

const isTravel = computed(() => urgency.value === 'travel')

const travelDaysText = computed(() => {
  if (!entry.value?.start_date) return ''
  const days = getRelativeDays(entry.value.start_date)
  if (days == null || days < 0) return ''
  return `还剩 ${days} 天`
})

const relativeDaysText = computed(() => {
  if (!displayDDL.value) return ''
  const days = getRelativeDays(displayDDL.value.date)
  if (days == null) return ''
  return days >= 0 ? `剩 ${days} 天` : `已截止 ${Math.abs(days)} 天`
})

function formatMeetingTime(startDate?: string | null, endDate?: string | null): string {
  if (startDate && endDate) {
    return startDate === endDate ? startDate : `${startDate} 至 ${endDate}`
  }
  return startDate ?? endDate ?? '待公布'
}

const meetingTimeText = computed(() => {
  if (!entry.value) return '待公布'
  return formatMeetingTime(entry.value.start_date, entry.value.end_date)
})

const compactMeetingTime = computed(() => {
  const start = entry.value?.start_date
  const end = entry.value?.end_date
  // 年份已在卡片标题展示；跨年会期仍保留完整年份，避免误读。
  if (start && end && start.slice(0, 4) !== end.slice(0, 4)) return meetingTimeText.value
  const shortDate = (date: string) =>
    (date.startsWith(`${props.year}-`) ? date.slice(5) : date).replace(/-/g, '.')
  if (start && end)
    return start === end ? shortDate(start) : `${shortDate(start)}–${shortDate(end)}`
  const knownDate = start ?? end
  return knownDate ? shortDate(knownDate) : '待公布'
})

const progressEntry = computed(() => {
  if (isHistoricalDisplay.value || isMeetingInProgress.value || !entry.value) return null
  return entry.value
})

const officialHref = computed(() => {
  return entry.value?.url ?? props.conference.website ?? ''
})

const isPending = computed(
  () =>
    !isHistoricalDisplay.value &&
    !isMeetingInProgress.value &&
    !isTravel.value &&
    !displayDDL.value,
)
const deadlineLabel = computed(() => {
  if (!displayDDL.value) return ''
  return (
    displayDDL.value.note?.trim() ||
    (entry.value?.abstract_ddl?.includes(displayDDL.value) ? '摘要截止' : '正文截止')
  )
})
const statusStyle = computed(() => {
  const name = isPending.value ? 'expired' : urgency.value
  return {
    '--status-text': `var(--color-${name}-text)`,
    '--status-indicator': `var(--color-${name})`,
  }
})
</script>

<template>
  <article
    class="card conference-card"
    :class="{ 'is-ended': isEnded, 'is-compact': compact }"
    :style="statusStyle"
  >
    <div class="card-header">
      <div class="card-top">
        <h3 class="card-title">
          <router-link
            :to="`/conference/${conference.id}`"
            :aria-label="`${conference.name} ${year} 历届详情`"
            >{{ conference.name }} {{ year }}</router-link
          >
        </h3>
        <BadgeTag v-if="!compact" :label="conference.category" :category="conference.category" />
      </div>
      <div class="card-status">
        <span class="status-dot" aria-hidden="true" />
        <template v-if="isHistoricalDisplay"><span class="status-value">已结束</span></template>
        <template v-else-if="isMeetingInProgress"
          ><span class="status-value">正在开会</span
          ><span class="status-note">旅程进行中</span></template
        >
        <template v-else-if="isTravel"
          ><span class="status-note">距离开会</span
          ><span class="status-value">{{ travelDaysText }}</span></template
        >
        <template v-else-if="displayDDL"
          ><span class="status-note">{{ deadlineLabel }}</span
          ><span class="status-value">{{ displayDDL.date }}</span
          ><span class="status-note">{{ relativeDaysText }}</span></template
        >
        <template v-else><span class="status-value">投稿日期待公布</span></template>
      </div>
    </div>
    <p class="card-location">
      <CityLink :city="entry?.city" :country="entry?.country" include-country />
    </p>
    <p class="card-meta" :title="meetingTimeText" :aria-label="`会期 ${meetingTimeText}`">
      会期 {{ compact ? compactMeetingTime : meetingTimeText }}
    </p>
    <ProgressBar v-if="progressEntry" :entry="progressEntry" :compact="compact" />
    <div class="card-bottom">
      <router-link v-if="!compact" :to="`/conference/${conference.id}`" class="text-link"
        >历届详情</router-link
      >
      <a
        v-if="officialHref"
        :href="officialHref"
        data-analytics-type="conference"
        :data-analytics-id="conference.id"
        target="_blank"
        rel="noopener noreferrer"
        class="text-link"
        :aria-label="`${conference.name} ${year} 官网，在新标签页打开`"
        >官网
        <svg
          class="ml-1"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path d="M14 4h6v6m0-6L10 14M10 4H4v16h16v-6" /></svg
      ></a>
    </div>
  </article>
</template>
