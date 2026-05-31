<script setup lang="ts">
defineProps<{
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div
    class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
  >
    <div class="flex items-start gap-3">
      <!-- 错误图标 -->
      <div class="mt-0.5 shrink-0 rounded-full bg-red-100 p-1 dark:bg-red-800/40">
        <svg
          class="h-4 w-4 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div class="flex-1">
        <p class="text-sm font-medium text-red-800 dark:text-red-300">
          出错了
        </p>
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ message }}
        </p>
      </div>

      <!-- 重试按钮 -->
      <button
        class="shrink-0 rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-800/40 dark:text-red-400 dark:hover:bg-red-800/60"
        @click="$emit('retry')"
      >
        重试
      </button>
    </div>
  </div>
</template>
