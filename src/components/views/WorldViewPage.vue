<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorldView } from '@/composables/useWorldView'
import { getBoundingBox } from '@/utils/geoDataProcessor'
import type { CityKey, LatLngBounds } from '@/types/worldView'
import WorldMap from '@/components/world/WorldMap.vue'
import WorldTable from '@/components/world/WorldTable.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const {
  cityIndex,
  filteredYearTable,
  highlightedCity,
  pinnedCity,
  setHighlight,
  togglePin,
} = useWorldView()

// Map 组件引用（用于 flyToBounds）
const worldMapRef = ref<InstanceType<typeof WorldMap> | null>(null)

// 加载状态（数据同步计算，短暂延迟用于骨架屏展示）
const loading = ref(true)
setTimeout(() => {
  loading.value = false
}, 300)

// 地图是否完全不可用
const mapUnavailable = computed(() => cityIndex.value.size === 0)
const mapError = ref(false)

// ============================================================
// 交互协调
// ============================================================

/** 表格列头点击 → 地图飞行至会议所有城市 */
function handleColClick(conferenceId: string): void {
  const cityKeys: CityKey[] = []
  for (const [, city] of cityIndex.value) {
    const hasConf = city.conferences.some(
      (ref) => ref.conferenceId === conferenceId,
    )
    if (hasConf) {
      cityKeys.push(city.cityKey)
    }
  }

  if (cityKeys.length === 0) return

  const bounds: LatLngBounds | null = getBoundingBox(cityKeys)
  if (bounds && worldMapRef.value) {
    worldMapRef.value.flyToBounds(bounds)
  }
}

/** 表格单元格 hover → 地图光点高亮 */
function handleCellHover(cityKey: CityKey | null): void {
  setHighlight(cityKey)
}

/** 地图光点点击 → 固定/取消固定 */
function handlePin(cityKey: CityKey): void {
  togglePin(cityKey)
}

/** 地图加载失败 */
function handleMapError(): void {
  mapError.value = true
}
</script>

<template>
  <div class="container-page py-4">
    <!-- 骨架屏 -->
    <template v-if="loading">
      <div
        class="world-map-container skeleton-shimmer flex items-center justify-center"
      >
        <span class="text-sm text-gray-400">加载地图中...</span>
      </div>
      <div
        class="mt-4 h-64 rounded-lg skeleton-shimmer"
      ></div>
    </template>

    <!-- 空状态：无数据 -->
    <EmptyState
      v-else-if="filteredYearTable.years.length === 0"
      message="暂无会议数据"
      variant="empty"
    />

    <!-- 正常内容 -->
    <template v-else>
      <!-- 坐标完全缺失提示 -->
      <div v-if="mapUnavailable" class="world-info-banner">
        <span>📍</span>
        <span>位置坐标数据不可用，仅显示表格</span>
      </div>

      <!-- 地图区域（仅在有坐标数据时显示） -->
      <WorldMap
        v-if="!mapUnavailable"
        ref="worldMapRef"
        :city-index="cityIndex"
        :highlighted-city="highlightedCity"
        :pinned-city="pinnedCity"
        @pin="handlePin"
        @map-error="handleMapError"
      />

      <!-- 表格区域 -->
      <div class="mt-4">
        <WorldTable
          :year-table="filteredYearTable"
          :highlighted-city="highlightedCity"
          @col-click="handleColClick"
          @cell-hover="handleCellHover"
        />
      </div>
    </template>
  </div>
</template>
