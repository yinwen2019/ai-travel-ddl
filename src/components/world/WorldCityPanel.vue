<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ConferenceRef } from '@/types/worldView'
import type { WorldCityPanelProps } from '@/types/view'
import { useDDLStatus } from '@/composables/useDDLStatus'
const props = defineProps<WorldCityPanelProps>()
defineEmits<{ close: [] }>()
const panel = ref<HTMLElement | null>(null)
const { getEarliestUpcomingDDL, hasDeadline, getRelativeDays } = useDDLStatus()
function stageText(conference: ConferenceRef): string {
  const entry = { abstract_ddl: conference.abstractDdl, paper_ddl: conference.paperDdl }
  const deadline = getEarliestUpcomingDDL(entry)
  if (deadline) return `${deadline.note?.trim() || '投稿截止'} ${deadline.date}`
  const days = conference.startDate ? getRelativeDays(conference.startDate) : null
  if (hasDeadline(entry) && days != null && days >= 0) return `距离开会还剩 ${days} 天`
  return '投稿日期待公布'
}
const conferences = computed(() =>
  [...props.city.conferences].sort((a, b) =>
    a.type === b.type ? b.year - a.year : a.type === 'upcoming' ? -1 : 1,
  ),
)
function focus() {
  panel.value?.focus()
}
defineExpose({ focus })
</script>
<template>
  <section
    ref="panel"
    tabindex="-1"
    class="city-panel"
    aria-labelledby="city-panel-title"
    @keydown.esc.stop="$emit('close')"
  >
    <div class="city-panel-title">
      <div>
        <h2 id="city-panel-title">{{ city.city }}</h2>
        <p class="mt-1 text-sm text-secondary">{{ city.country }} · 共 {{ city.totalCount }} 场</p>
      </div>
      <button class="icon-button" aria-label="关闭城市信息" @click="$emit('close')">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path d="m6 6 12 12M6 18 18 6" />
        </svg>
      </button>
    </div>
    <ul class="city-panel-list">
      <li v-for="conference in conferences" :key="`${conference.conferenceId}-${conference.year}`">
        <div class="flex justify-between gap-3">
          <router-link
            class="text-link font-semibold"
            :to="`/conference/${conference.conferenceId}`"
            >{{ conference.conferenceName }} {{ conference.year }}</router-link
          ><span class="text-xs text-secondary">{{
            conference.type === 'upcoming' ? '即将举办' : '历史举办'
          }}</span>
        </div>
        <p v-if="conference.type === 'upcoming'" class="mt-1 text-xs text-secondary">
          会期 {{ conference.startDate || '待公布'
          }}<template v-if="conference.endDate && conference.endDate !== conference.startDate">
            至 {{ conference.endDate }}</template
          >
        </p>
        <p v-if="conference.type === 'upcoming'" class="mt-1 text-xs text-secondary">
          {{ stageText(conference) }}
        </p>
      </li>
    </ul>
  </section>
</template>
