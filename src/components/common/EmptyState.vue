<script setup lang="ts">
defineProps<{
  message: string
  variant?: 'empty' | 'no-results'
}>()

defineEmits<{
  clear: []
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-16">
    <!-- 图标 -->
    <div class="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
      <svg
        v-if="variant === 'no-results'"
        class="h-8 w-8 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <svg
        v-else
        class="h-8 w-8 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    </div>

    <!-- 文案 -->
    <p class="text-sm text-gray-500 dark:text-gray-400">{{ message }}</p>

    <!-- 清除筛选按钮（仅搜索无结果时） -->
    <button
      v-if="variant === 'no-results'"
      class="rounded-lg border border-gray-300 px-4 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
      @click="$emit('clear')"
    >
      清除筛选条件
    </button>
  </div>
</template>
