<script setup lang="ts">
import { computed } from 'vue'
import { useDDLStatus } from '@/composables/useDDLStatus'
import type { DDLUrgency, ProgressNodeState } from '@/types/view'

const props = defineProps<{
  entry: {
    abstract_ddl?: { date: string }[] | null
    paper_ddl?: { date: string }[] | null
    notification_date?: string | null
    start_date?: string | null
  }
}>()

const { getUrgency, getRelativeDays, selectStageDeadline } = useDDLStatus()

interface ProgressNode {
  label: string
  state: ProgressNodeState
  days: number | null
  color: string | null
}

interface RawNode {
  label: string
  date: string
  urgency: DDLUrgency
}

const urgencyColors: Record<DDLUrgency, string> = {
  expired: 'var(--color-expired-text)',
  travel: 'var(--color-travel-text)',
  urgent: 'var(--color-urgent-text)',
  near: 'var(--color-near-text)',
  ample: 'var(--color-ample-text)',
}

const nodes = computed<ProgressNode[]>(() => {
  const now = new Date()
  now.setUTCHours(0, 0, 0, 0)

  // 收集有效节点
  const rawNodes: RawNode[] = []

  if (props.entry.abstract_ddl && props.entry.abstract_ddl.length > 0) {
    const date = selectStageDeadline(props.entry.abstract_ddl)?.date
    if (date) rawNodes.push({ label: '摘要截止', date, urgency: getUrgency(date) })
  }
  if (props.entry.paper_ddl && props.entry.paper_ddl.length > 0) {
    const date = selectStageDeadline(props.entry.paper_ddl)?.date
    if (date) rawNodes.push({ label: '正文截止', date, urgency: getUrgency(date) })
  }
  if (props.entry.start_date) {
    rawNodes.push({ label: '开会', date: props.entry.start_date, urgency: 'travel' })
  }

  if (rawNodes.length === 0) return []

  rawNodes.sort((a, b) => a.date.localeCompare(b.date))

  // 找到当前阶段
  let currentFound = false

  return rawNodes.map((n) => {
    const d = new Date(n.date + 'T00:00:00Z')
    const days = getRelativeDays(n.date)
    const color = urgencyColors[n.urgency]

    if (currentFound) {
      return { label: n.label, state: 'future' as ProgressNodeState, days, color: null }
    }

    if (d < now) {
      return { label: n.label, state: 'done' as ProgressNodeState, days, color: null }
    }

    currentFound = true
    return { label: n.label, state: 'current' as ProgressNodeState, days, color }
  })
})
</script>

<template>
  <div
    v-if="nodes.length"
    class="progress-nodes"
    :style="{ '--node-count': nodes.length }"
    aria-label="会议时间节点"
  >
    <div
      v-for="node in nodes"
      :key="node.label"
      class="progress-node"
      :class="{ 'is-done': node.state === 'done', 'is-current': node.state === 'current' }"
      :style="{ '--stage-color': node.color ?? undefined }"
    >
      <span class="progress-dot" aria-hidden="true" />
      <span>{{ node.label }}</span>
      <span v-if="node.days != null" class="progress-days">{{
        node.days >= 0 ? `剩 ${node.days} 天` : '已截止'
      }}</span>
    </div>
  </div>
  <p v-else class="card-meta">日期待公布</p>
</template>
