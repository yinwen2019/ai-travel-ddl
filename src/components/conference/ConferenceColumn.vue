<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Conference, YearEntry } from '@/types/conference'
import { useDDLStatus } from '@/composables/useDDLStatus'
import BadgeTag from '@/components/common/BadgeTag.vue'
import ConferenceCard from './ConferenceCard.vue'

const props = defineProps<{
  conference: Conference
}>()

const { isDateFuture } = useDDLStatus()

function isEntryEnded(entry: YearEntry): boolean {
  if (entry.type === 'history') return true
  return entry.end_date ? !isDateFuture(entry.end_date) : false
}

const sortedYears = computed(() =>
  [...props.conference.years].sort((a, b) => b.year - a.year),
)

const sortedUpcoming = computed(() =>
  sortedYears.value.filter((y) => y.type === 'upcoming' && !isEntryEnded(y)),
)

const sortedHistory = computed(() =>
  sortedYears.value.filter((y) => isEntryEnded(y)),
)

const showAllHistory = ref(false)

const visibleHistory = computed(() =>
  showAllHistory.value ? sortedHistory.value : sortedHistory.value.slice(0, 2),
)

const hasUpcoming = computed(() => sortedUpcoming.value.length > 0)
const hasHistory = computed(() => sortedHistory.value.length > 0)
const canToggleHistory = computed(() => sortedHistory.value.length > 2)
const hiddenHistoryCount = computed(() =>
  Math.max(sortedHistory.value.length - visibleHistory.value.length, 0),
)
</script>

<template>
  <div class="flex w-[260px] min-w-[260px] flex-none flex-col max-md:w-[64vw] max-md:min-w-[86vw]">
    <!-- 列头 -->
    <div class="mb-3 px-1">
      <div class="relative overflow-hidden rounded-lg border border-gray-200/80 bg-gradient-to-br from-white via-white to-gray-50 px-3 py-2.5 shadow-sm ring-1 ring-gray-100 dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 dark:ring-gray-800/70">
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-success via-warning to-travel" />
        <div class="flex items-start justify-between gap-2 pt-1">
          <div class="min-w-0">
            <h2 class="text-sm font-extrabold text-gray-950 dark:text-white">
              {{ conference.name }}
            </h2>
            <p class="mt-0.5 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
              {{ conference.full_name }}
            </p>
          </div>
          <BadgeTag
            :label="conference.category"
            :category="conference.category"
          />
        </div>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div class="flex flex-col gap-2">
      <template v-if="hasUpcoming">
        <ConferenceCard
          v-for="entry in sortedUpcoming"
          :key="'u-' + entry.year"
          :conference="conference"
          :year="entry.year"
        />
      </template>

      <div
        v-if="hasUpcoming && hasHistory"
        class="py-1 text-center text-xs text-gray-400"
      >
        — 历史 —
      </div>

      <ConferenceCard
        v-for="entry in visibleHistory"
        :key="'h-' + entry.year"
        :conference="conference"
        :year="entry.year"
      />

      <button
        v-if="canToggleHistory"
        type="button"
        class="rounded-lg py-1 text-center text-xs text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        @click="showAllHistory = !showAllHistory"
      >
        {{ showAllHistory ? '收起' : `+${hiddenHistoryCount} 届` }}
      </button>
    </div>
  </div>
</template>
