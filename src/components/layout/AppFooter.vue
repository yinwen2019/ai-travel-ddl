<script setup lang="ts">
import { computed } from 'vue'
import { useConferences } from '@/composables/useConferences'
const { lastUpdated } = useConferences()
const updatedText = computed(() => {
  if (!lastUpdated.value) return '待公布'
  const date = new Date(lastUpdated.value)
  if (Number.isNaN(date.getTime())) return '待公布'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date)
})
</script>
<template>
  <footer class="site-footer">
    <div class="container-page footer-inner">
      <div>
        <p class="footer-brand">AI Travel DDL</p>
        <p>会议信息来自各会议官方网站，日期与时区请以官方公告为准。</p>
      </div>
      <p>
        会议数据更新于 <time :datetime="lastUpdated ?? undefined">{{ updatedText }}</time
        >（UTC）
      </p>
    </div>
  </footer>
</template>
