<script setup lang="ts">
import type { AttractionItem } from '@/types/location'

defineProps<{
  attractions: AttractionItem[]
}>()

function typeIcon(type?: string): string {
  const map: Record<string, string> = {
    nature: '🌿',
    park: '🏞',
    beach: '🏖',
    market: '🏪',
    historic: '🏛',
    architecture: '🏗',
    museum: '🏛',
    adventure: '🧗',
    hike: '🥾',
    landmark: '📍',
    entertainment: '🎭',
    street: '🚶',
    food: '🍜',
  }
  return map[type ?? ''] ?? '📍'
}
</script>

<template>
  <section class="mb-6">
    <h2 class="mb-3 text-lg font-semibold text-primary">景点推荐</h2>
    <div class="grid gap-3 sm:grid-cols-2">
      <div
        v-for="item in attractions"
        :key="item.name"
        class="flex gap-3 rounded-lg border border-line p-3 transition-colors hover:bg-subtle"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-subtle text-base"
        >
          {{ typeIcon(item.type) }}
        </span>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-medium text-primary">
              {{ item.name }}
            </h3>
            <span v-if="item.type" class="rounded bg-subtle px-1.5 py-0.5 text-xs text-secondary">
              {{ item.type }}
            </span>
          </div>
          <p class="mt-0.5 text-xs text-secondary">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
