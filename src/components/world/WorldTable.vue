<script setup lang="ts">
import { computed } from 'vue'
import type { YearTable, CityKey, WorldColumn } from '@/types/worldView'
import { CATEGORY_COLORS, CATEGORY_CONFIG } from '@/constants'
import type { Category } from '@/types/conference'

const props = defineProps<{
  yearTable: YearTable
  highlightedCity: CityKey | null
}>()

const emit = defineEmits<{
  'col-click': [conferenceId: string]
  'cell-hover': [cityKey: CityKey | null]
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
  <div class="world-table-wrapper">
    <table class="world-table">
      <!-- 表头 -->
      <thead>
        <!-- 分类分组行 -->
        <tr>
          <th class="year-col"></th>
          <th
            v-for="group in columnGroups"
            :key="group.category"
            :colspan="group.colSpan"
            class="category-group-header"
          >
            {{ group.label }}
          </th>
        </tr>

        <!-- 会议列头行 -->
        <tr>
          <th class="year-col">年份</th>
          <th
            v-for="col in yearTable.columns"
            :key="col.conferenceId"
            :title="`点击查看 ${col.conferenceName} 所有举办城市`"
            @click="onColHeaderClick(col.conferenceId)"
          >
            <span
              class="category-indicator"
              :style="{ backgroundColor: CATEGORY_COLORS[col.category] }"
            ></span>
            {{ col.conferenceName }}
          </th>
        </tr>
      </thead>

      <!-- 表体 -->
      <tbody>
        <tr
          v-for="(row, rowIndex) in yearTable.cells"
          :key="yearTable.years[rowIndex]"
          :class="{ 'row-upcoming': isUpcomingRow(rowIndex) }"
        >
          <!-- 年份列（sticky） -->
          <td class="year-col">
            {{ yearTable.years[rowIndex] }}
          </td>

          <!-- 数据单元格 -->
          <td
            v-for="(cell, colIndex) in row"
            :key="yearTable.columns[colIndex]?.conferenceId ?? colIndex"
            :class="{
              'cell-empty': !cell.cityName,
            }"
            :title="locationTitle(cell.cityName, cell.countryName)"
            @mouseenter="onCellEnter(cell.cityKey)"
            @mouseleave="onCellLeave"
          >
            <template v-if="cell.cityName && cell.countryName">
              {{ cell.cityName }} {{ countryFlag(cell.countryName) }}
            </template>
            <template v-else>
              —
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 表格为空时显示提示 -->
    <div
      v-if="yearTable.columns.length === 0"
      class="p-4 text-center text-sm text-gray-400"
    >
      所有分类均已隐藏，请至少选择一个分类
    </div>
  </div>
</template>
