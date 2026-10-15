<script setup lang="ts">
import { computed } from 'vue'
import type { ClimateCardProps } from '@/types/location'
const props = defineProps<ClimateCardProps>()
const months = computed(() => [...(props.climate?.monthly ?? [])].sort((a, b) => a.month - b.month))
const maxRainfall = computed(() =>
  Math.max(1, ...months.value.map((month) => month.avg_rainfall_mm)),
)
</script>

<template>
  <section class="city-content-section" aria-labelledby="city-climate-heading">
    <h2 id="city-climate-heading">气候概览</h2>
    <template v-if="months.length">
      <p class="city-section-description">
        月均温度与降水量，帮助你准备行李。<template v-if="months.length < 12"
          >目前收录 {{ months.length }} 个月，仅展示已收录月份。</template
        >
      </p>
      <div
        class="city-climate-scroll"
        tabindex="0"
        role="region"
        aria-label="月度气候数据，可横向滚动"
      >
        <table
          class="city-climate-table"
          :style="{ minWidth: `${Math.max(280, 88 + months.length * 54)}px` }"
        >
          <caption class="sr-only">
            城市月度气候，平均温度单位为摄氏度，降水量单位为毫米。
          </caption>
          <thead>
            <tr>
              <th scope="col">月份</th>
              <th v-for="month in months" :key="month.month" scope="col">{{ month.month }} 月</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">均温 <span>°C</span></th>
              <td v-for="month in months" :key="month.month">{{ month.avg_temp_c ?? '待公布' }}</td>
            </tr>
            <tr>
              <th scope="row">降水 <span>mm</span></th>
              <td v-for="month in months" :key="month.month">
                <div class="city-rainfall-track" aria-hidden="true">
                  <span
                    :style="{
                      height: `${Math.max(0, (month.avg_rainfall_mm / maxRainfall) * 48)}px`,
                    }"
                  />
                </div>
                <span>{{ month.avg_rainfall_mm ?? '待公布' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <p v-else class="city-section-empty">气候资料待公布。</p>
  </section>
</template>
