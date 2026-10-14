<script setup lang="ts">
import type { Category } from '@/types/conference'
import { CATEGORY_COLORS } from '@/constants'
defineProps<{ label: string; category?: Category }>()
</script>
<template>
  <span class="category-badge"
    ><span
      v-if="category"
      class="category-dot"
      :style="{ backgroundColor: CATEGORY_COLORS[category] }"
      aria-hidden="true"
    />{{ label }}</span
  >
</template>
