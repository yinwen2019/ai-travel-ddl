<script setup lang="ts">
import { computed } from 'vue'
import { useSearch } from '@/composables/useSearch'
import { useConferences } from '@/composables/useConferences'
import SearchInput from '@/components/common/SearchInput.vue'
import YearSelector from '@/components/navigation/YearSelector.vue'
import { useYearSelect } from '@/composables/useYearSelect'
import { useDDLStatus } from '@/composables/useDDLStatus'
import type { Conference, YearEntry } from '@/types/conference'
import ConferenceCard from '@/components/conference/ConferenceCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const { query, filteredConferences, isFiltering, clear: clearSearch } = useSearch()
const { conferences } = useConferences()
const { currentYear, setYear } = useYearSelect()
const years = computed(() =>
  [...new Set(conferences.value.flatMap((c) => c.years.map((y) => y.year)))].sort((a, b) => b - a),
)
const { getEarliestUpcomingDDL, getRelativeDays, isDateFuture } = useDDLStatus()

// 当前年份有数据的会议
const conferencesThisYear = computed(() =>
  filteredConferences.value.filter((c) => c.years.some((y) => y.year === currentYear.value)),
)

function getCurrentYearEntry(conference: Conference): YearEntry | undefined {
  return conference.years.find((y) => y.year === currentYear.value)
}

function isEnded(entry: YearEntry): boolean {
  if (entry.type === 'history') return true
  return entry.end_date ? !isDateFuture(entry.end_date) : false
}

function getSortRank(entry: YearEntry | undefined): number {
  if (!entry) return 4
  if (isEnded(entry)) return 3
  return getEarliestUpcomingDDL(entry) ? 0 : 2
}

function getDeadlineSortValue(entry: YearEntry | undefined): number {
  if (!entry) return Number.POSITIVE_INFINITY
  const ddl = getEarliestUpcomingDDL(entry)
  if (!ddl) return Number.POSITIVE_INFINITY
  return getRelativeDays(ddl.date) ?? Number.POSITIVE_INFINITY
}

// 按最早未截止 DDL 的紧迫度排序，已结束会议靠后
const sortedConferences = computed(() => {
  return [...conferencesThisYear.value].sort((a, b) => {
    const aEntry = getCurrentYearEntry(a)
    const bEntry = getCurrentYearEntry(b)
    const rankDiff = getSortRank(aEntry) - getSortRank(bEntry)
    if (rankDiff !== 0) return rankDiff

    const deadlineDiff = getDeadlineSortValue(aEntry) - getDeadlineSortValue(bEntry)
    if (deadlineDiff !== 0) return deadlineDiff

    return a.name.localeCompare(b.name)
  })
})
</script>

<template>
  <div class="container-page year-page page-content">
    <div class="page-heading">
      <div>
        <h1 class="page-title">年份视图</h1>
        <p class="page-description">一年的研究计划，一眼看清。</p>
      </div>
      <div class="view-toolbar"><SearchInput v-model="query" /></div>
    </div>
    <YearSelector :years="years" :current="currentYear" @select="setYear" />
    <!-- 空状态 -->
    <EmptyState
      v-if="filteredConferences.length === 0"
      :message="isFiltering ? '没有符合条件的会议' : '暂无会议数据'"
      :variant="isFiltering ? 'no-results' : 'empty'"
      @clear="clearSearch"
    />

    <!-- 卡片网格 -->
    <div v-else>
      <!-- 无此年份数据 -->
      <EmptyState
        v-if="sortedConferences.length === 0"
        :message="`${currentYear} 年暂无会议数据`"
        variant="empty"
      />

      <div v-else class="year-grid">
        <ConferenceCard
          v-for="c in sortedConferences"
          :key="`${c.id}-${currentYear}`"
          :conference="c"
          :year="currentYear"
        />
      </div>
    </div>
  </div>
</template>
