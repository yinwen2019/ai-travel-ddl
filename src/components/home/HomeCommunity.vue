<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useCommunitySignals } from '@/composables/useCommunitySignals'
import type { SupportParticle } from '@/types/community'
import xiaohongshuLogo from '@/assets/brands/xiaohongshu.svg'
import { analytics } from '@/services/analytics'
import AnalyticsNotice from '@/components/common/AnalyticsNotice.vue'

const { supportCount, storageAvailable, addSupport } = useCommunitySignals()
const particles = ref<SupportParticle[]>([])
const heartBeat = ref(0)
const announcement = ref('')
const community = ref<HTMLElement | null>(null)
const hintRunning = ref(false)
let hintVisible = false
let hintObserver: IntersectionObserver | undefined
const timers = new Map<number, ReturnType<typeof setTimeout>>()
const numberFormat = new Intl.NumberFormat('zh-CN')
const formattedCount = computed(() =>
  analytics.enabled && !analytics.ready.value ? '—' : numberFormat.format(supportCount.value),
)
const defaultXiaohongshuUrl = 'https://xhslink.cn/o/5YIh8OKvkvn'
const xiaohongshuUrl = readXiaohongshuUrl()
let nextParticleId = 0
let announcementTimer: ReturnType<typeof setTimeout> | undefined

function readXiaohongshuUrl(): string {
  const configured: unknown = import.meta.env.VITE_XIAOHONGSHU_URL
  if (typeof configured !== 'string' || !configured.trim()) return defaultXiaohongshuUrl
  try {
    const url = new URL(configured.trim())
    if (
      url.protocol !== 'https:' ||
      !['www.xiaohongshu.com', 'xhslink.com', 'xhslink.cn'].includes(url.hostname) ||
      url.username ||
      url.password ||
      url.port
    )
      return defaultXiaohongshuUrl
    return url.href
  } catch {
    return defaultXiaohongshuUrl
  }
}

function supportProject(): void {
  if (!addSupport()) {
    announcement.value = analytics.problem.value
    return
  }
  heartBeat.value += 1
  const id = nextParticleId++
  const expired = particles.value.length >= 5 ? particles.value[0] : undefined
  if (expired) {
    clearTimeout(timers.get(expired.id))
    timers.delete(expired.id)
  }
  // 每次点击独立确认，快速连续点击时只保留最近五个视觉粒子。
  particles.value = [...particles.value.slice(-4), { id, offset: ((id % 3) - 1) * 13 }]
  timers.set(
    id,
    setTimeout(() => {
      particles.value = particles.value.filter((particle) => particle.id !== id)
      timers.delete(id)
    }, 650),
  )
  announcement.value = ''
  clearTimeout(announcementTimer)
  announcementTimer = setTimeout(() => {
    announcement.value = analytics.enabled
      ? '点赞已提交，谢谢鼓励！'
      : `点赞 +1，谢谢鼓励！本机累计 ${numberFormat.format(supportCount.value)} 次${storageAvailable.value ? '' : '，仅本次浏览有效'}。`
  }, 80)
}

function syncHint(): void {
  hintRunning.value = hintVisible && !document.hidden
}

onMounted(() => {
  // 循环提示只解释可重复点击；离屏或后台停止，不自动增加点赞数。
  hintObserver = new IntersectionObserver(([entry]) => {
    hintVisible = entry?.isIntersecting ?? false
    syncHint()
  })
  if (community.value) hintObserver.observe(community.value)
  document.addEventListener('visibilitychange', syncHint)
})

onUnmounted(() => {
  hintObserver?.disconnect()
  document.removeEventListener('visibilitychange', syncHint)
  timers.forEach((timer) => clearTimeout(timer))
  timers.clear()
  clearTimeout(announcementTimer)
})
</script>

<template>
  <div ref="community" class="home-community" aria-label="点赞与关注项目">
    <div class="home-community-row">
      <div class="home-support-wrap">
        <button
          type="button"
          class="home-support-button"
          :aria-label="`免费点个赞，${analytics.enabled ? '全站' : '本机'}累计 ${formattedCount} 次；每点一次加一，可连续点击`"
          :disabled="analytics.enabled && !analytics.ready.value"
          @click="supportProject"
        >
          <span class="home-support-heart" aria-hidden="true">
            <svg :key="heartBeat" :class="{ 'is-beating': heartBeat > 0 }" viewBox="0 0 24 24">
              <path
                d="M20.4 4.6a5.4 5.4 0 0 0-7.6 0l-.8.8-.8-.8a5.4 5.4 0 0 0-7.6 7.6L12 20.6l8.4-8.4a5.4 5.4 0 0 0 0-7.6Z"
                fill="currentColor"
                stroke="currentColor"
              />
            </svg>
          </span>
          <span>点个赞</span>
          <span class="home-support-count">{{ formattedCount }}</span>
          <span class="home-support-hint" :class="{ 'is-running': hintRunning }" aria-hidden="true"
            >+1</span
          >
        </button>
        <span class="home-support-particles" aria-hidden="true">
          <span
            v-for="particle in particles"
            :key="particle.id"
            class="home-support-plus"
            :style="{ '--support-offset': `${particle.offset}px` }"
            >+1</span
          >
        </span>
      </div>

      <div class="home-community-links">
        <a
          href="https://github.com/yinwen2019/conftrip"
          target="_blank"
          rel="noopener noreferrer"
          class="home-community-link"
          aria-label="GitHub 项目，在新标签页打开"
          title="GitHub 项目"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.82.09-.65.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65a3.86 3.86 0 0 1 1.03 2.68c0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
            />
          </svg>
          <span class="sr-only">GitHub</span>
        </a>
        <a
          :href="xiaohongshuUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="home-community-link home-xiaohongshu-link"
          aria-label="小红书主页，在新标签页打开"
          title="小红书主页"
        >
          <img :src="xiaohongshuLogo" width="36" height="14" alt="" aria-hidden="true" />
          <span class="sr-only">小红书</span>
        </a>
      </div>
    </div>
    <p class="home-community-note">
      <span v-if="!analytics.enabled"
        >本机累计 · {{ storageAvailable ? '已保存在此浏览器' : '仅本次浏览' }}</span
      >
    </p>
    <AnalyticsNotice />
    <span class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{
      announcement
    }}</span>
  </div>
</template>
