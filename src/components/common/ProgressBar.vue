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

const { getUrgency, getRelativeDays } = useDDLStatus()

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
  expired: 'var(--color-expired)',
  travel: 'var(--color-travel)',
  urgent: 'var(--color-urgent)',
  near: 'var(--color-near)',
  ample: 'var(--color-ample)',
}

const nodes = computed<ProgressNode[]>(() => {
  const now = new Date()
  now.setUTCHours(0, 0, 0, 0)

  // 收集有效节点
  const rawNodes: RawNode[] = []

  if (props.entry.abstract_ddl && props.entry.abstract_ddl.length > 0) {
    const date = props.entry.abstract_ddl[0].date
    rawNodes.push({ label: '摘要截止', date, urgency: getUrgency(date) })
  }
  if (props.entry.paper_ddl && props.entry.paper_ddl.length > 0) {
    const date = props.entry.paper_ddl[0].date
    rawNodes.push({ label: '正文截止', date, urgency: getUrgency(date) })
  }
  if (props.entry.start_date) {
    rawNodes.push({ label: '开会', date: props.entry.start_date, urgency: 'travel' })
  }

  if (rawNodes.length === 0) return []

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
  <div v-if="nodes.length > 0">
    <!-- 进度条 -->
    <div class="mt-1 flex items-center gap-0">
      <template v-for="(node, i) in nodes" :key="node.label">
        <!-- 节点圆点 -->
        <div class="flex flex-col items-center">
          <div
            class="h-3 w-3 rounded-full border-2"
            :style="
              node.state === 'current' && node.color
                ? { borderColor: node.color, backgroundColor: node.color }
                : undefined
            "
            :class="{
              'border-gray-400 bg-gray-400 dark:border-gray-500 dark:bg-gray-500':
                node.state === 'done',
              'border-gray-300 bg-transparent dark:border-gray-600':
                node.state === 'future',
            }"
          />
          <span
            class="mt-1 text-xs whitespace-nowrap"
            :style="
              node.state === 'current' && node.color ? { color: node.color } : undefined
            "
            :class="{
              'text-gray-400': node.state === 'done',
              'font-medium': node.state === 'current',
              'text-gray-400 dark:text-gray-600': node.state === 'future',
            }"
          >
            {{ node.label }}
          </span>
          <span
            v-if="node.days != null"
            class="text-xs"
            :style="
              node.state === 'current' && node.color ? { color: node.color } : undefined
            "
            :class="{ 'text-gray-400': node.state !== 'current' }"
          >
            {{
              node.days >= 0
                ? `剩 ${node.days} 天`
                : `已截止`
            }}
          </span>
        </div>

        <!-- 连接线 -->
        <div
          v-if="i < nodes.length - 1"
          class="mb-5 mx-1 h-0.5 w-5 rounded"
          :class="{
            'bg-gray-400 dark:bg-gray-500': node.state === 'done',
            'bg-gray-200 dark:bg-gray-600':
              node.state === 'current' || node.state === 'future',
          }"
        />
      </template>
    </div>
  </div>

  <!-- 无节点数据 -->
  <div v-else class="text-xs text-gray-400">日期待公布</div>
</template>
