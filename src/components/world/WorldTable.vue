<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CityKey, WorldColumn, WorldTableProps } from '@/types/worldView'
import { CATEGORY_COLORS, CATEGORY_CONFIG } from '@/constants'
import type { Category } from '@/types/conference'
import CityLink from '@/components/location/CityLink.vue'
import { useCityDirectory } from '@/composables/useCityDirectory'
import { buildWorldTableClipboard } from '@/utils/worldTableClipboard'

const props = defineProps<WorldTableProps>()
const { findCity } = useCityDirectory()

const scrollArea = ref<HTMLDivElement | null>(null)
const tableElement = ref<HTMLTableElement | null>(null)
const copyFallback = ref<HTMLTextAreaElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const copying = ref(false)
const copied = ref(false)
const copyFailed = ref(false)
const clipboardData = computed(() => buildWorldTableClipboard(props.yearTable))
let resizeObserver: ResizeObserver | null = null
let copyTimer: ReturnType<typeof setTimeout> | undefined

function syncScrollState(): void {
  const area = scrollArea.value
  if (!area) return
  canScrollLeft.value = area.scrollLeft > 1
  canScrollRight.value = area.scrollLeft + area.clientWidth < area.scrollWidth - 1
}

function scrollTable(direction: -1 | 1): void {
  const area = scrollArea.value
  if (!area) return
  area.scrollBy({
    left: direction * Math.max(160, area.clientWidth * 0.8),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}

async function copyTable(): Promise<void> {
  if (copying.value) return
  copying.value = true
  copied.value = false
  copyFailed.value = false
  clearTimeout(copyTimer)
  const { text, html } = clipboardData.value
  try {
    // 同时提供富文本与纯文本，表格应用保留单元格，文本编辑器保留制表符。
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' }),
          }),
        ])
      } catch {
        await navigator.clipboard.writeText(text)
      }
    } else {
      await navigator.clipboard.writeText(text)
    }
    copied.value = true
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 3000)
  } catch {
    copyFailed.value = true
    await nextTick()
    copyFallback.value?.focus()
    copyFallback.value?.select()
  } finally {
    copying.value = false
  }
}

watch(
  () => props.yearTable,
  async () => {
    copied.value = false
    copyFailed.value = false
    await nextTick()
    syncScrollState()
  },
)
onMounted(() => {
  resizeObserver = new ResizeObserver(syncScrollState)
  if (scrollArea.value) resizeObserver.observe(scrollArea.value)
  if (tableElement.value) resizeObserver.observe(tableElement.value)
  syncScrollState()
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  clearTimeout(copyTimer)
})

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
  <div class="world-table-panel">
    <div
      id="world-city-table"
      ref="scrollArea"
      class="world-table-wrapper"
      tabindex="0"
      aria-label="历年会议举办城市年表，可横向滚动"
      @scroll.passive="syncScrollState"
    >
      <table ref="tableElement" class="world-table">
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
                data-analytics-type="conference"
                :data-analytics-id="col.conferenceId"
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
                  data-analytics-type="city"
                  :data-analytics-id="findCity(cell.cityName, cell.countryName)?.id"
                  :title="`在地球上定位 ${cell.cityName}`"
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
    <div class="world-table-dock">
      <div class="world-table-tools" role="group" aria-label="年表控制">
        <button
          class="world-table-tool"
          :disabled="!canScrollLeft"
          aria-label="向左滑动年表"
          title="向左滑动"
          aria-controls="world-city-table"
          @click="scrollTable(-1)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>
        <button
          class="world-table-tool"
          :disabled="!canScrollRight"
          aria-label="向右滑动年表"
          title="向右滑动"
          aria-controls="world-city-table"
          @click="scrollTable(1)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <path d="m10 6 6 6-6 6" />
          </svg>
        </button>
        <span class="world-table-tool-divider" aria-hidden="true" />
        <button
          class="world-table-tool world-table-copy"
          :disabled="copying"
          :aria-label="copied ? '年表已复制到剪贴板' : '复制当前筛选的年表'"
          @click="copyTable"
        >
          <svg
            v-if="copied"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
          <svg
            v-else
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <rect x="8" y="8" width="12" height="13" rx="2" />
            <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
          </svg>
          <span>{{ copying ? '复制中' : copied ? '已复制' : '复制年表' }}</span>
        </button>
      </div>
      <span class="sr-only" role="status">{{
        copied ? '已复制当前筛选的全部年份和会议，可粘贴到表格中。' : ''
      }}</span>
      <div v-if="copyFailed" class="world-table-copy-fallback">
        <p id="world-table-copy-help">自动复制未成功，内容已选中，请按 Ctrl+C 或 ⌘C 复制。</p>
        <textarea
          ref="copyFallback"
          :value="clipboardData.text"
          readonly
          aria-label="可手动复制的年表内容"
          aria-describedby="world-table-copy-help"
        />
      </div>
    </div>
  </div>
</template>
