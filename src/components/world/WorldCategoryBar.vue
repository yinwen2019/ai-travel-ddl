<script setup lang="ts">
import { CATEGORY_COLORS, CATEGORY_CONFIG, CATEGORY_LIST } from '@/constants'
import { useWorldView } from '@/composables/useWorldView'
const { activeCategories, toggleCategory, isCategoryActive } = useWorldView()
</script>
<template>
  <div class="world-category-bar" aria-label="筛选年表中的会议分类">
    <button
      v-for="cat in CATEGORY_LIST"
      :key="cat"
      class="world-category-chip"
      :aria-pressed="isCategoryActive(cat)"
      :disabled="isCategoryActive(cat) && activeCategories.size === 1"
      @click="toggleCategory(cat)"
    >
      <span
        class="category-dot"
        :style="{ backgroundColor: CATEGORY_COLORS[cat] }"
        aria-hidden="true"
      />{{ CATEGORY_CONFIG[cat].label }}
      <svg
        v-if="isCategoryActive(cat)"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      >
        <path d="m5 12 4 4L19 6" />
      </svg>
    </button>
  </div>
</template>
