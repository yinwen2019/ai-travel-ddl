<script setup lang="ts">
import type { Category } from '@/types/conference'
import { CATEGORY_COLORS, CATEGORY_CONFIG, CATEGORY_LIST } from '@/constants'
import { useWorldView } from '@/composables/useWorldView'

const { activeCategories, toggleCategory, isCategoryActive } = useWorldView()

function chipStyle(cat: Category): Record<string, string> {
  const color = CATEGORY_COLORS[cat]
  if (isCategoryActive(cat)) {
    return {
      '--world-category-color': color,
      color: '#ffffff',
      borderColor: color,
      backgroundColor: color,
      boxShadow: 'var(--shadow-sm)',
    }
  }

  return {
    '--world-category-color': color,
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span class="shrink-0 text-xs text-gray-400 dark:text-gray-500"
      >筛选分类：</span
    >
    <button
      v-for="cat in CATEGORY_LIST"
      :key="cat"
      class="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150"
      :class="{
        'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700':
          !isCategoryActive(cat),
        'cursor-not-allowed opacity-45':
          isCategoryActive(cat) && activeCategories.size === 1,
      }"
      :style="chipStyle(cat)"
      :disabled="isCategoryActive(cat) && activeCategories.size === 1"
      @click="toggleCategory(cat)"
    >
      <span
        class="h-2 w-2 rounded-full"
        :style="{
          backgroundColor: isCategoryActive(cat) ? '#ffffff' : CATEGORY_COLORS[cat],
        }"
      ></span>
      {{ CATEGORY_CONFIG[cat].label }}
    </button>
  </div>
</template>
