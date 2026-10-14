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

const sortedYears = computed(() => [...props.conference.years].sort((a, b) => b.year - a.year))

const sortedUpcoming = computed(() =>
  sortedYears.value.filter((y) => y.type === 'upcoming' && !isEntryEnded(y)),
)

const sortedHistory = computed(() => sortedYears.value.filter((y) => isEntryEnded(y)))

const showAllHistory = ref(false)

const visibleHistory = computed(() =>
  showAllHistory.value ? sortedHistory.value : sortedHistory.value.slice(0, 2),
)

const hasHistory = computed(() => sortedHistory.value.length > 0)
const showHistoryDivider = computed(() => hasHistory.value)
const canToggleHistory = computed(() => sortedHistory.value.length > 2)
const hiddenHistoryCount = computed(() =>
  Math.max(sortedHistory.value.length - visibleHistory.value.length, 0),
)
</script>

<template>
  <section class="conference-column" :aria-label="conference.name">
    <div class="column-heading">
      <div class="flex items-start justify-between gap-3">
        <h2>{{ conference.name }}</h2>
        <BadgeTag :label="conference.category" :category="conference.category" />
      </div>
      <p>{{ conference.full_name }}</p>
    </div>
    <div class="column-cards">
      <ConferenceCard
        v-for="entry in sortedUpcoming"
        :key="'u-' + entry.year"
        :conference="conference"
        :year="entry.year"
      />
      <div v-if="showHistoryDivider" class="history-divider">历史举办</div>
      <ConferenceCard
        v-for="entry in visibleHistory"
        :key="'h-' + entry.year"
        :conference="conference"
        :year="entry.year"
      />
      <button
        v-if="canToggleHistory"
        class="control-button"
        :aria-expanded="showAllHistory"
        @click="showAllHistory = !showAllHistory"
      >
        {{ showAllHistory ? '收起历史' : `展开另外 ${hiddenHistoryCount} 届` }}
      </button>
    </div>
  </section>
</template>
