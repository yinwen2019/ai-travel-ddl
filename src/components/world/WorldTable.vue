<script setup lang="ts">
import { computed } from 'vue'
import type { YearTable, CityKey, WorldColumn } from '@/types/worldView'
import { CATEGORY_COLORS, CATEGORY_CONFIG } from '@/constants'
import type { Category } from '@/types/conference'
import CityLink from '@/components/location/CityLink.vue'

const props = defineProps<{
  yearTable: YearTable
  highlightedCity: CityKey | null
  availableCities: ReadonlySet<CityKey>
}>()

const emit = defineEmits<{
  'col-click': [conferenceId: string]
  'cell-hover': [cityKey: CityKey | null]
  'city-select': [cityKey: CityKey]
}>()

// ============================================================
// 列分组（按分类）
// ============================================================

interface ColumnGroup {
  category: Category
  label: string
  columns: WorldColumn[]
  colSpan: number
}

const columnGroups = computed<ColumnGroup[]>(() => {
  if (props.yearTable.columns.length === 0) return []

  const groups: ColumnGroup[] = []
  let current: ColumnGroup | null = null

  for (const col of props.yearTable.columns) {
    if (!current || current.category !== col.category) {
      current = {
        category: col.category,
        label: CATEGORY_CONFIG[col.category]?.label || col.category,
        columns: [],
        colSpan: 0,
      }
      groups.push(current)
    }
    current.columns.push(col)
    current.colSpan++
  }

  return groups
})

// ============================================================
// 行是否为 upcoming（该行任意单元格 isUpcoming 为 true）
// ============================================================

function isUpcomingRow(rowIndex: number): boolean {
  return props.yearTable.cells[rowIndex]?.some((cell) => cell.isUpcoming) ?? false
}

// ============================================================
// 事件处理
// ============================================================

function onColHeaderClick(conferenceId: string): void {
  emit('col-click', conferenceId)
}

function onCellEnter(cityKey: CityKey | null): void {
  emit('cell-hover', cityKey)
}

function onCellLeave(): void {
  emit('cell-hover', null)
}

// ============================================================
// 获取列所属的分类指示器颜色（用于小圆点）
// ============================================================

const countryFlags: Record<string, string> = {
  Argentina: '🇦🇷',
  Australia: '🇦🇺',
  Austria: '🇦🇹',
  Belgium: '🇧🇪',
  Brazil: '🇧🇷',
  Canada: '🇨🇦',
  Chile: '🇨🇱',
  China: '🇨🇳',
  Denmark: '🇩🇰',
  'Dominican Republic': '🇩🇴',
  France: '🇫🇷',
  Germany: '🇩🇪',
  Hungary: '🇭🇺',
  Ireland: '🇮🇪',
  Israel: '🇮🇱',
  Italy: '🇮🇹',
  Japan: '🇯🇵',
  Mexico: '🇲🇽',
  Netherlands: '🇳🇱',
  Portugal: '🇵🇹',
  'Puerto Rico': '🇵🇷',
  Rwanda: '🇷🇼',
  Singapore: '🇸🇬',
  'South Korea': '🇰🇷',
  Spain: '🇪🇸',
  Sweden: '🇸🇪',
  Thailand: '🇹🇭',
  'United Arab Emirates': '🇦🇪',
  'United Kingdom': '🇬🇧',
  'United States': '🇺🇸',
}

function countryFlag(countryName: string | null): string {
  if (!countryName) return ''
  return countryFlags[countryName] ?? countryName
}

function locationTitle(cityName: string | null, countryName: string | null): string {
  if (!cityName || !countryName) return ''
  return `${cityName}, ${countryName}`
}
</script>

<template>
  <div class="world-table-wrapper" tabindex="0" aria-label="历年会议举办城市年表，可横向滚动">
    <table class="world-table">
      <caption class="sr-only">
        按年份与会议排列的举办城市。城市名称在新标签页打开详情，定位按钮在地图查看。
      </caption>
      <thead>
        <tr>
          <th class="year-col"><span class="sr-only">分类</span></th>
          <th
            v-for="group in columnGroups"
            :key="group.category"
            :colspan="group.colSpan"
            scope="colgroup"
            class="category-group-header"
          >
            {{ group.label }}
          </th>
        </tr>
        <tr>
          <th class="year-col" scope="col">年份</th>
          <th v-for="col in yearTable.columns" :key="col.conferenceId" scope="col">
            <button
              class="world-table-button"
              :aria-label="`定位 ${col.conferenceName} 的所有举办城市`"
              @click="onColHeaderClick(col.conferenceId)"
            >
              <span
                class="category-indicator"
                :style="{ backgroundColor: CATEGORY_COLORS[col.category] }"
                aria-hidden="true"
              />{{ col.conferenceName }}
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in yearTable.cells"
          :key="yearTable.years[rowIndex]"
          :class="{ 'row-upcoming': isUpcomingRow(rowIndex) }"
        >
          <th class="year-col" scope="row">{{ yearTable.years[rowIndex] }}</th>
          <td
            v-for="(cell, colIndex) in row"
            :key="yearTable.columns[colIndex]?.conferenceId ?? colIndex"
            :class="{
              'cell-empty': !cell.cityName,
              'is-highlighted': cell.cityKey && highlightedCity === cell.cityKey,
            }"
            :title="locationTitle(cell.cityName, cell.countryName)"
          >
            <div
              v-if="cell.cityName && cell.countryName"
              class="world-city-actions"
              @mouseenter="onCellEnter(cell.cityKey)"
              @mouseleave="onCellLeave"
              @focusin="onCellEnter(cell.cityKey)"
              @focusout="onCellLeave"
            >
              <CityLink :city="cell.cityName" :country="cell.countryName"
                >{{ cell.cityName }}
                <span aria-hidden="true">{{ countryFlag(cell.countryName) }}</span></CityLink
              >
              <button
                v-if="cell.cityKey && availableCities.has(cell.cityKey)"
                class="world-city-locate"
                :aria-label="`${yearTable.columns[colIndex]?.conferenceName} ${yearTable.years[rowIndex]}，${locationTitle(cell.cityName, cell.countryName)}，在地图定位`"
                @click="emit('city-select', cell.cityKey)"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="6" />
                  <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                </svg>
              </button>
            </div>
            <span v-else aria-label="无举办城市数据">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
