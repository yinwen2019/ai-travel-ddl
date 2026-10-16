<script setup lang="ts">
import { computed } from 'vue'
import { useDDLStatus } from '@/composables/useDDLStatus'
import type { DDLUrgency, ProgressBarProps, ProgressNodeState } from '@/types/view'

const props = withDefaults(defineProps<ProgressBarProps>(), { compact: false })

const { getUrgency, getRelativeDays, selectStageDeadline } = useDDLStatus()

interface ProgressNode {
  label: string
  date: string
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
      return {
        label: n.label,
        date: n.date,
        state: 'future' as ProgressNodeState,
        days,
        color: null,
      }
    }

    if (d < now) {
      return { label: n.label, date: n.date, state: 'done' as ProgressNodeState, days, color: null }
    }

    currentFound = true
    return { label: n.label, date: n.date, state: 'current' as ProgressNodeState, days, color }
  })
})

function stageDescription(node: ProgressNode): string {
  const status =
    node.state === 'done' ? '日期已过' : node.state === 'current' ? '下一节点' : '尚未到达'
  return `${node.label}，${node.date}，${status}`
}
</script>

<template>
  <div
    v-if="nodes.length"
    class="progress-nodes"
    :class="{ 'is-compact': compact, 'has-single-node': nodes.length === 1 }"
    :style="{ '--node-count': nodes.length }"
    :role="compact ? 'list' : undefined"
    aria-label="会议时间节点"
  >
    <div
      v-for="node in nodes"
      :key="node.label"
      class="progress-node"
      :class="{ 'is-done': node.state === 'done', 'is-current': node.state === 'current' }"
      :style="{ '--stage-color': node.color ?? undefined }"
      :role="compact ? 'listitem' : undefined"
      :aria-label="compact ? stageDescription(node) : undefined"
      :aria-current="compact && node.state === 'current' ? 'step' : undefined"
    >
      <template v-if="compact">
        <span class="milestone-label" :title="stageDescription(node)" aria-hidden="true">
          <span class="progress-dot">
            <svg v-if="node.state === 'done'" viewBox="0 0 12 12" fill="none">
              <path
                d="m3 6 2 2 4-4"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span>{{ node.label.replace('截止', '') }}</span>
        </span>
        <time class="milestone-date" :datetime="node.date" aria-hidden="true">
          {{ node.date.replace(/-/g, '.') }}
        </time>
      </template>
      <template v-else>
        <span class="progress-dot" aria-hidden="true" />
        <span :title="node.label">{{ node.label }}</span>
        <span v-if="node.days != null" class="progress-days">{{
          node.days >= 0 ? `剩 ${node.days} 天` : '已截止'
        }}</span>
      </template>
    </div>
  </div>
  <p v-else-if="!compact" class="card-meta">日期待公布</p>
</template>
