<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'

const props = defineProps<{
  years: number[]
  current: number
}>()

const emit = defineEmits<{
  select: [year: number]
}>()

const scrollContainer = ref<HTMLElement | null>(null)

// 当前年份自动滚动到可见区域
function scrollToCurrent() {
  if (!scrollContainer.value) return
  const activeBtn = scrollContainer.value.querySelector('[data-active]') as HTMLElement
  if (activeBtn) {
    activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
}

onMounted(() => {
  nextTick(scrollToCurrent)
})

watch(() => props.current, () => {
  nextTick(scrollToCurrent)
})
</script>

<template>
  <div
    ref="scrollContainer"
    class="flex gap-1 overflow-x-auto py-2 scrollbar-hide"
    style="scrollbar-width: none"
  >
    <button
      v-for="y in years"
      :key="y"
      :data-active="y === current ? '' : undefined"
      class="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all"
      :class="
        y === current
          ? 'bg-success text-white shadow-sm'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
      "
      @click="emit('select', y)"
    >
      {{ y }}
    </button>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
