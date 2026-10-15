<script setup lang="ts">
import { ref, computed } from 'vue'
import WorldCategoryBar from '@/components/world/WorldCategoryBar.vue'
import { useWorldView } from '@/composables/useWorldView'
import { getBoundingBox } from '@/utils/geoDataProcessor'
import type { CityKey, LatLngBounds } from '@/types/worldView'
import WorldMap from '@/components/world/WorldMap.vue'
import WorldTable from '@/components/world/WorldTable.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const { cityIndex, filteredYearTable, highlightedCity, pinnedCity, setHighlight, togglePin } =
  useWorldView()

// Map 组件引用（用于 flyToBounds）
const worldMapRef = ref<InstanceType<typeof WorldMap> | null>(null)

const mapUnavailable = computed(() => cityIndex.value.size === 0)
const availableCities = computed(() => new Set(cityIndex.value.keys()))

// ============================================================
// 交互协调
// ============================================================

/** 表格列头点击 → 地图飞行至会议所有城市 */
function handleColClick(conferenceId: string): void {
  const cityKeys: CityKey[] = []
  for (const [, city] of cityIndex.value) {
    const hasConf = city.conferences.some((ref) => ref.conferenceId === conferenceId)
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
</script>

<template>
  <div class="container-page page-content">
    <div class="page-heading">
      <div>
        <h1 class="page-title">世界视图</h1>
        <p class="page-description">沿着研究的足迹，看看世界。</p>
      </div>
    </div>
    <div class="mb-5">
      <WorldCategoryBar />
      <p class="page-description mt-3 text-xs">
        分类筛选仅影响下方年表，地图始终展示全部举办城市。
      </p>
    </div>
    <EmptyState
      v-if="filteredYearTable.years.length === 0"
      message="暂无会议数据"
      variant="empty"
    />
    <template v-else>
      <div v-if="mapUnavailable" class="world-info-banner">位置坐标数据不可用，仅显示年表。</div>
      <WorldMap
        v-if="!mapUnavailable"
        ref="worldMapRef"
        :city-index="cityIndex"
        :highlighted-city="highlightedCity"
        :pinned-city="pinnedCity"
        @pin="handlePin"
        @hover="setHighlight"
      />
      <section class="mt-7" aria-labelledby="world-table-title">
        <div class="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="world-table-title" class="text-lg font-semibold">历年举办城市</h2>
          <p class="text-xs text-secondary">城市名称打开详情 · 定位按钮查看地图 · 年表可横向滚动</p>
        </div>
        <WorldTable
          :year-table="filteredYearTable"
          :highlighted-city="highlightedCity"
          :available-cities="availableCities"
          @col-click="handleColClick"
          @cell-hover="handleCellHover"
          @city-select="handlePin"
        />
      </section>
    </template>
  </div>
</template>
