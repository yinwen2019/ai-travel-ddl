<script setup lang="ts">
import { analytics } from '@/services/analytics'
</script>
<template>
  <div
    v-if="analytics.enabled && analytics.problem.value"
    class="analytics-notice"
    role="status"
    aria-live="polite"
  >
    <span>{{ analytics.problem.value }}</span>
    <button type="button" class="text-link" @click="analytics.retry()">
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
.analytics-notice button {
  min-height: 44px;
}
</style>
