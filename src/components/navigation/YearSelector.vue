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
    activeBtn.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }
}

onMounted(() => {
  nextTick(scrollToCurrent)
})

watch(
  () => props.current,
  () => {
    nextTick(scrollToCurrent)
  },
)
</script>

<template>
  <div ref="scrollContainer" class="year-selector" aria-label="选择年份">
    <button
      v-for="y in years"
      :key="y"
      :data-active="y === current ? '' : undefined"
      :aria-pressed="y === current"
      @click="emit('select', y)"
    >
      {{ y }}
    </button>
  </div>
</template>
