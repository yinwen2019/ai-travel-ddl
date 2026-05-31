<script setup lang="ts">
import type { FoodItem } from '@/types/location'

defineProps<{
  food: FoodItem[]
}>()
</script>

<template>
  <section class="mb-6">
    <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
      美食推荐
    </h2>
    <div class="grid gap-3 sm:grid-cols-2">
      <div
        v-for="item in food"
        :key="item.name"
        class="flex gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
      >
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-base dark:bg-amber-900/20">
          🍽
        </span>
        <div>
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">
            {{ item.name }}
          </h3>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
