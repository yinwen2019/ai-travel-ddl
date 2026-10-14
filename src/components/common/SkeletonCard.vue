<script setup lang="ts">
defineProps<{
  count?: number
}>()
</script>

<template>
  <div v-for="i in count ?? 3" :key="i" class="animate-pulse rounded-lg border border-line p-4">
    <div class="mb-3 flex items-center gap-2">
      <div class="h-5 w-12 rounded-full bg-gray-200" />
      <div class="h-3 w-10 rounded bg-gray-200" />
    </div>
    <div class="mb-2 h-4 w-24 rounded bg-gray-200" />
    <div class="h-3 w-40 rounded bg-subtle" />
    <!-- 进度条占位 -->
    <div class="mt-3 flex items-center gap-1">
      <div v-for="j in 4" :key="j" class="h-3 w-3 rounded-full bg-subtle" />
      <div class="mx-1 h-0.5 w-6 rounded bg-subtle" />
      <div v-for="j in 3" :key="'b' + j" class="h-3 w-3 rounded-full bg-subtle" />
    </div>
  </div>
</template>
