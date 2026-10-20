<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import globeMarkup from '@/assets/maps/home-globe.svg?raw'
import type { HomeGlobeRenderer } from '@/types/home'
import { useTheme } from '@/composables/useTheme'

const { theme } = useTheme()
const host = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)
const reducedMotion = ref(false)
let renderer: HomeGlobeRenderer | null = null
let frame: number | null = null
let previousTime: number | null = null
let lastPaint = 0
let angle = 0
let visible = false
let disposed = false
let intersection: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let motionQuery: MediaQueryList | null = null

function tick(time: number): void {
  // 用实际经过时间计算角度，40 秒一圈；绘制限制为约 30fps。
  if (previousTime !== null) angle = (angle + ((time - previousTime) * 360) / 40000) % 360
  previousTime = time
  if (time - lastPaint >= 1000 / 30) {
    renderer?.draw(angle)
    lastPaint = time
  }
  frame = requestAnimationFrame(tick)
}

function syncAnimation(): void {
  if (frame !== null) cancelAnimationFrame(frame)
  frame = null
  previousTime = null
  if (disposed || !ready.value) return
  renderer?.draw(reducedMotion.value ? 0 : angle)
  if (visible && !document.hidden && !reducedMotion.value) {
    frame = requestAnimationFrame(tick)
  }
}

function onMotionChange(event: MediaQueryListEvent): void {
  reducedMotion.value = event.matches
}

watch(reducedMotion, syncAnimation)
watch(theme, () => {
  renderer?.updateTheme()
  renderer?.draw(reducedMotion.value ? 0 : angle)
})

onMounted(async () => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', onMotionChange)
  document.addEventListener('visibilitychange', syncAnimation)
  intersection = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
    syncAnimation()
  })
  if (host.value) intersection.observe(host.value)
  try {
    const { createHomeGlobe } = await import('@/utils/createHomeGlobe')
    if (disposed || !canvas.value) return
    renderer = createHomeGlobe(canvas.value)
    if (!renderer) return
    renderer.draw(0)
    ready.value = true
    resizeObserver = new ResizeObserver(() => {
      renderer?.resize()
      renderer?.draw(reducedMotion.value ? 0 : angle)
    })
    resizeObserver.observe(canvas.value)
    syncAnimation()
  } catch {
    // 绘制库或画布不可用时继续显示原始 SVG，不影响首页入口和榜单。
  }
})

onBeforeUnmount(() => {
  disposed = true
  if (frame !== null) cancelAnimationFrame(frame)
  intersection?.disconnect()
  resizeObserver?.disconnect()
  motionQuery?.removeEventListener('change', onMotionChange)
  document.removeEventListener('visibilitychange', syncAnimation)
  renderer = null
})
</script>

<template>
  <div ref="host" class="home-globe" aria-hidden="true">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-show="!ready" v-html="globeMarkup" />
    <canvas ref="canvas" class="home-globe-canvas" :class="{ 'is-ready': ready }" />
  </div>
</template>
