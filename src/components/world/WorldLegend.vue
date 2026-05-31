<script setup lang="ts">
import type { LegendColorItem, LegendSizeItem } from '@/types/worldView'
import { CATEGORY_COLORS, CATEGORY_CONFIG, CATEGORY_LIST } from '@/constants'

const colorItems: LegendColorItem[] = [
  { label: '历史举办', color: 'history' },
  ...CATEGORY_LIST.map((category) => ({
    label: CATEGORY_CONFIG[category].short,
    color: category,
  })),
]

const sizeItems: LegendSizeItem[] = [
  { label: '1 场', radius: 8, tier: 1 },
  { label: '2-3 场', radius: 12, tier: 2 },
  { label: '4-6 场', radius: 16, tier: 3 },
  { label: '7-10 场', radius: 20, tier: 4 },
  { label: '11+ 场', radius: 25, tier: 5 },
]

function getLegendDotStyle(item: LegendColorItem): Record<string, string> {
  if (item.color === 'history') {
    return {
      width: '10px',
      height: '10px',
      backgroundColor: 'var(--world-dot-history)',
    }
  }

  return {
    width: '10px',
    height: '10px',
    backgroundColor: CATEGORY_COLORS[item.color],
  }
}
</script>

<template>
  <div class="world-legend">
    <!-- 颜色说明 -->
    <div class="world-legend-section">
      <div class="world-legend-title">颜色</div>
      <div
        v-for="item in colorItems"
        :key="item.color"
        class="world-legend-row"
      >
        <span
          class="world-legend-dot"
          :style="getLegendDotStyle(item)"
        ></span>
        <span>{{ item.color === 'history' ? item.label : `${item.label} 即将` }}</span>
      </div>
    </div>

    <!-- 大小说明 -->
    <div class="world-legend-section">
      <div class="world-legend-title">大小</div>
      <div
        v-for="item in sizeItems"
        :key="item.tier"
        class="world-legend-row"
      >
        <span
          class="world-legend-dot"
          :style="{
            width: `${item.radius}px`,
            height: `${item.radius}px`,
            backgroundColor: 'var(--color-text-tertiary)',
          }"
        ></span>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>
