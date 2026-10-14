<script setup lang="ts">
defineProps<{
  year: number
  city?: string | null
  country?: string | null
  venue?: string | null
  isUpcoming?: boolean
  abstractDDL?: string | null
  paperDDL?: string | null
  cameraReady?: string | null
  notificationDate?: string | null
  startDate?: string | null
  endDate?: string | null
}>()
</script>

<template>
  <div class="relative flex gap-4 pb-6 pl-6" :class="{ 'timeline-history': !isUpcoming }">
    <!-- 时间轴线 -->
    <div class="absolute left-0 top-2 h-full w-0.5 bg-line" />

    <!-- 年份节点 -->
    <div
      class="absolute left-[-5px] top-1.5 h-3 w-3 rounded-full border-2"
      :class="isUpcoming ? 'border-brand bg-brand' : 'border-line bg-surface'"
    />

    <!-- 内容卡片 -->
    <div class="min-w-0 flex-1 rounded-lg border border-line bg-surface p-4">
      <div class="mb-2 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-primary">
            {{ year }}
          </span>
          <span
            v-if="isUpcoming"
            class="rounded bg-subtle px-1.5 py-0.5 text-xs font-medium text-brand"
          >
            即将举办
          </span>
        </div>
      </div>

      <!-- 举办地 -->
      <p class="text-sm text-secondary">
        {{ city || '待公布' }}, {{ country || '待公布' }}
        <span v-if="venue" class="text-xs text-secondary"> · {{ venue }}</span>
      </p>

      <!-- DDL 信息（仅 upcoming） -->
      <div v-if="isUpcoming" class="mt-2 space-y-1 text-xs">
        <div v-if="abstractDDL" class="flex justify-between">
          <span class="text-secondary">摘要截止</span>
          <span class="text-primary">{{ abstractDDL }}</span>
        </div>
        <div v-if="paperDDL" class="flex justify-between">
          <span class="text-secondary">正文截止</span>
          <span class="text-primary">{{ paperDDL }}</span>
        </div>
        <div v-if="notificationDate" class="flex justify-between">
          <span class="text-secondary">录用通知</span>
          <span class="text-primary">{{ notificationDate }}</span>
        </div>
        <div v-if="cameraReady" class="flex justify-between">
          <span class="text-secondary">Camera-ready</span>
          <span class="text-primary">{{ cameraReady }}</span>
        </div>
        <div v-if="startDate || endDate" class="flex justify-between">
          <span class="text-secondary">会期</span>
          <span class="text-primary">
            {{ startDate || '待公布' }} → {{ endDate || '待公布' }}
          </span>
        </div>
      </div>

      <!-- 历史条目标记为只读 -->
      <p v-if="!isUpcoming" class="mt-1 text-xs text-secondary">
        {{ city || '待公布' }}, {{ country || '待公布' }}
      </p>
    </div>
  </div>
</template>
