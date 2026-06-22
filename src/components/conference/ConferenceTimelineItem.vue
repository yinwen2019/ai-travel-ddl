<script setup lang="ts">
defineProps<{
  year: number
  city?: string | null
  country?: string | null
  venue?: string | null
  isUpcoming?: boolean
  abstractDDL?: string | null
  paperDDL?: string | null
  notificationDate?: string | null
  startDate?: string | null
  endDate?: string | null
}>()
</script>

<template>
  <div
    class="relative flex gap-4 pb-6 pl-6"
    :class="{ 'opacity-70': !isUpcoming }"
  >
    <!-- 时间轴线 -->
    <div class="absolute left-0 top-2 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />

    <!-- 年份节点 -->
    <div
      class="absolute left-[-5px] top-1.5 h-3 w-3 rounded-full border-2"
      :class="
        isUpcoming
          ? 'border-success bg-success'
          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
      "
    />

    <!-- 内容卡片 -->
    <div class="flex-1 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div class="mb-2 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-gray-900 dark:text-white">
            {{ year }}
          </span>
          <span
            v-if="isUpcoming"
            class="rounded bg-success/10 px-1.5 py-0.5 text-xs font-medium text-success"
          >
            即将举办
          </span>
        </div>
      </div>

      <!-- 举办地 -->
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ city || '待公布' }}, {{ country || '待公布' }}
        <span v-if="venue" class="text-xs text-gray-400"> · {{ venue }}</span>
      </p>

      <!-- DDL 信息（仅 upcoming） -->
      <div v-if="isUpcoming" class="mt-2 space-y-1 text-xs">
        <div v-if="abstractDDL" class="flex justify-between">
          <span class="text-gray-400">摘要截止</span>
          <span class="text-gray-700 dark:text-gray-300">{{ abstractDDL }}</span>
        </div>
        <div v-if="paperDDL" class="flex justify-between">
          <span class="text-gray-400">正文截止</span>
          <span class="text-gray-700 dark:text-gray-300">{{ paperDDL }}</span>
        </div>
        <div v-if="notificationDate" class="flex justify-between">
          <span class="text-gray-400">录用通知</span>
          <span class="text-gray-700 dark:text-gray-300">{{ notificationDate }}</span>
        </div>
        <div v-if="cameraReady" class="flex justify-between">
          <span class="text-gray-400">Camera-ready</span>
          <span class="text-gray-700 dark:text-gray-300">{{ cameraReady }}</span>
        </div>
        <div v-if="startDate || endDate" class="flex justify-between">
          <span class="text-gray-400">会期</span>
          <span class="text-gray-700 dark:text-gray-300">
            {{ startDate || '待公布' }} → {{ endDate || '待公布' }}
          </span>
        </div>
      </div>

      <!-- 历史条目标记为只读 -->
      <p v-if="!isUpcoming" class="mt-1 text-xs text-gray-400">
        {{ city || '待公布' }}, {{ country || '待公布' }}
      </p>
    </div>
  </div>
</template>
