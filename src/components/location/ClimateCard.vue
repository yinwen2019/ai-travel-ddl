<script setup lang="ts">
import type { ClimateData } from '@/types/location'

defineProps<{
  climate: ClimateData
}>()

function tempColor(temp: number): string {
  if (temp >= 28) return '#ef4444'
  if (temp >= 22) return '#f59e0b'
  if (temp >= 15) return '#10b981'
  if (temp >= 8) return '#3b82f6'
  return '#6366f1'
}
</script>

<template>
  <section class="mb-6">
    <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
      全年气候
    </h2>

    <div class="overflow-x-auto rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div class="flex items-end gap-1.5" style="min-width: 720px">
        <div
          v-for="m in climate.monthly"
          :key="m.month"
          class="flex flex-1 flex-col items-center gap-1"
        >
          <!-- 降雨量（上方柱状） -->
          <div class="flex w-full flex-col items-center">
            <span class="mb-0.5 text-xs text-blue-400">
              {{ m.avg_rainfall_mm }}
            </span>
            <div
              class="w-full rounded-t-sm opacity-60"
              :style="{
                height: `${Math.max(2, m.avg_rainfall_mm / 8)}px`,
                backgroundColor: '#60a5fa',
              }"
            />
          </div>

          <!-- 温度柱状 -->
          <div
            class="w-full rounded-t transition-colors"
            :style="{
              height: `${Math.max(4, m.avg_temp_c * 3)}px`,
              backgroundColor: tempColor(m.avg_temp_c),
            }"
          />

          <!-- 温度标签 -->
          <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
            {{ m.avg_temp_c }}°
          </span>

          <!-- 月份 -->
          <span class="text-xs text-gray-400">{{ m.name }}</span>
        </div>
      </div>

      <!-- 图例 -->
      <div class="mt-4 flex justify-center gap-6 text-xs text-gray-400">
        <span class="flex items-center gap-1">
          <span class="inline-block h-3 w-3 rounded-sm bg-blue-400 opacity-60" />
          降水量 (mm)
        </span>
        <span class="flex items-center gap-1">
          <span class="inline-block h-3 w-3 rounded-sm" :style="{ backgroundColor: tempColor(20) }" />
          温度 (°C)
        </span>
      </div>
    </div>
  </section>
</template>
