<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Conference } from '@/types/conference'
import type { DDLUrgency } from '@/types/view'
import { useDDLStatus } from '@/composables/useDDLStatus'
import BadgeTag from '@/components/common/BadgeTag.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'

const props = defineProps<{
  conference: Conference
  year: number
}>()

const router = useRouter()
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

const progressEntry = computed(() => {
  if (isHistoricalDisplay.value || isMeetingInProgress.value || !entry.value) return null
  return entry.value
})

const locationHref = computed(() => {
  if (!entry.value?.location_id) return ''
  return router.resolve({
    name: 'location',
    params: { id: entry.value.location_id },
  }).href
})

const officialHref = computed(() => {
  return entry.value?.url ?? props.conference.website ?? ''
})

const locationText = computed(() => {
  const city = entry.value?.city || '待公布'
  const country = entry.value?.country || '待公布'
  return `${city}, ${country}`
})
</script>

<template>
  <div
    class="card flex gap-2"
    :class="{ 'is-ended': isEnded }"
  >
    <!-- 左侧 DDL 紧迫度色条 -->
    <div
      class="ddl-strip shrink-0"
      :class="[urgency, { 'is-traveling': isMeetingInProgress }]"
    />

    <div class="flex-1 space-y-1.5">
      <!-- 会议缩写 + 年份（左） | 类别标签（右） -->
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-gray-900 dark:text-white">
          {{ conference.name }} {{ year }}
        </h3>
        <BadgeTag
          :label="conference.category"
          :category="conference.category"
        />
      </div>

      <!-- 开会时间 -->
      <p class="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        <span class="text-gray-400">开会时间 </span>
        <span>{{ meetingTimeText }}</span>
      </p>

      <!-- 举办地 + 官网 -->
      <p v-if="entry" class="text-xs text-gray-500 dark:text-gray-400">
        <a
          v-if="locationHref"
          :href="locationHref"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block bg-gradient-to-r from-amber-700 via-rose-600 to-indigo-600 bg-clip-text font-semibold text-transparent transition-opacity hover:opacity-80 dark:from-amber-300 dark:via-pink-300 dark:to-sky-300"
        >
          {{ locationText }}
        </a>
        <span v-else>{{ locationText }}</span>
        <a
          v-if="officialHref"
          :href="officialHref"
          target="_blank"
          rel="noopener noreferrer"
          class="ml-2 font-medium text-gray-500 transition-colors hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
        >
          官网 ↗
        </a>
      </p>
      <p v-else class="text-xs text-gray-400">地点待公布</p>

      <!-- 正在开会：突出旅行状态 -->
      <div
        v-if="isMeetingInProgress"
        class="inline-flex w-fit rotate-[-1deg] rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400 px-3 py-1 text-sm font-black uppercase text-white shadow-sm"
      >
        Traveling!
      </div>

      <!-- Travel 状态：距离开会倒计时 -->
      <div v-else-if="isTravel" class="text-xs">
        <span class="text-gray-400">距离开会 </span>
        <span class="font-medium text-travel">{{ travelDaysText }}</span>
      </div>

      <!-- DDL 信息 -->
      <div v-else-if="displayDDL" class="text-xs">
        <span class="text-gray-400">{{ displayDDL.note+':' || '正文截止' }} </span>
        <span
          class="font-medium"
          :class="{
            'text-expired': displayDDLUrgency === 'expired',
            'text-danger': displayDDLUrgency === 'urgent',
            'text-warning': displayDDLUrgency === 'near',
            'text-success': displayDDLUrgency === 'ample',
          }"
        >
          {{displayDDL.date }}
        </span>
        <span class="ml-1 text-gray-400">({{ relativeDaysText }})</span>
      </div>

      <!-- 进度条 / 已结束 -->
      <ProgressBar
        v-if="progressEntry"
        :entry="progressEntry"
      />
      <div
        v-else-if="isHistoricalDisplay && entry"
        class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800"
      >
        已结束
      </div>
    </div>
  </div>
</template>
