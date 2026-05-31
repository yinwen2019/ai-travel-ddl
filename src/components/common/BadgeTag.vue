<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '@/types/conference'

const props = defineProps<{
  label: string
  category?: Category
}>()

const colorClass = computed(() => {
  if (!props.category) return ''
  const map: Record<Category, string> = {
    CV: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    NLP: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    ML: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    AI: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    DM: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  }
  return map[props.category]
})
</script>

<template>
  <span
    class="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
    :class="
      colorClass ||
        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
    "
  >
    {{ label }}
  </span>
</template>
