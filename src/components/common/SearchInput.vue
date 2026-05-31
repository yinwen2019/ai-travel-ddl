<script setup lang="ts">
import { ref, watch } from 'vue'

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{
  search: [query: string]
}>()

const localQuery = ref(model.value)

// 防抖 200ms
let timer: ReturnType<typeof setTimeout> | null = null
watch(localQuery, (val) => {
  model.value = val
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    emit('search', val)
  }, 200)
})
</script>

<template>
  <div class="relative">
    <svg
      class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <input
      v-model="localQuery"
      type="text"
      placeholder="搜索会议..."
      class="w-full rounded-lg border border-gray-300 bg-gray-50 py-1.5 pl-8 pr-2 text-xs text-gray-900 placeholder-gray-400 transition-colors focus:border-success focus:outline-none focus:ring-1 focus:ring-success/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
    />
    <button
      v-if="localQuery"
      class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      @click="localQuery = ''"
    >
      <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
