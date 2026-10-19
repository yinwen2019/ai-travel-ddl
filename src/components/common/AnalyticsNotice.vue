<script setup lang="ts">
import { analytics } from '@/services/analytics'
</script>
<template>
  <div v-if="analytics.enabled" class="analytics-notice" role="status" aria-live="polite">
    <span v-if="analytics.problem.value">{{ analytics.problem.value }}</span>
    <span v-else-if="!analytics.ready.value">正在连接全站统计…</span>
    <span v-else-if="analytics.pending.value">{{ analytics.pending.value }} 次操作正在同步…</span>
    <button
      v-if="analytics.problem.value"
      type="button"
      class="text-link"
      @click="analytics.retry()"
    >
      重试同步
    </button>
  </div>
</template>
<style scoped>
.analytics-notice {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.7;
}
.analytics-notice:empty {
  display: none;
}
.analytics-notice button {
  min-height: 44px;
}
</style>
