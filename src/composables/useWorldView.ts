import { reactive, computed, readonly, ref } from 'vue'
import type { Category, Conference } from '@/types/conference'
import type { CityData, CityKey, YearTable } from '@/types/worldView'
import { buildCityIndex, buildYearTable } from '@/utils/geoDataProcessor'
import { useConferences } from './useConferences'
import { CATEGORY_LIST } from '@/constants'

// ---- 模块级响应式状态（全局单例） ----

/** 活跃分类筛选（至少保留一个） */
const activeCategories = reactive(new Set<Category>([...CATEGORY_LIST]))

/** 当前高亮的城市（来自表格 hover 或地图 hover） */
const highlightedCity = ref<CityKey | null>(null)

/** 被点击固定的城市（再次点击取消） */
const pinnedCity = ref<CityKey | null>(null)

// ---- 导出 composable ----

export function useWorldView() {
  const { conferences } = useConferences()

  /** 从会议数据构建城市聚合索引（全量，不受分类筛选影响） */
  const cityIndex = computed<Map<CityKey, CityData>>(() =>
    buildCityIndex(conferences.value),
  )

  /** 从全量会议数据构建年表 */
  const yearTable = computed<YearTable>(() =>
    buildYearTable(conferences.value),
  )

  /** 根据活跃分类筛选后的会议列表 */
  const visibleConferences = computed<Conference[]>(() =>
    conferences.value.filter((c) => activeCategories.has(c.category)),
  )

  /** 根据筛选后的会议构建年表（用于表格列过滤） */
  const filteredYearTable = computed<YearTable>(() =>
    buildYearTable(visibleConferences.value),
  )

  /** 切换分类筛选，最后一个活跃分类不可关闭 */
  function toggleCategory(cat: Category): void {
    if (activeCategories.has(cat)) {
      if (activeCategories.size > 1) {
        activeCategories.delete(cat)
      }
    } else {
      activeCategories.add(cat)
    }
  }

  /** 检查分类是否活跃 */
  function isCategoryActive(cat: Category): boolean {
    return activeCategories.has(cat)
  }

  /** 设置高亮城市 */
  function setHighlight(cityKey: CityKey | null): void {
    highlightedCity.value = cityKey
  }

  /** 切换固定城市 */
  function togglePin(cityKey: CityKey): void {
    pinnedCity.value = pinnedCity.value === cityKey ? null : cityKey
  }

  /** 清除固定 */
  function clearPin(): void {
    pinnedCity.value = null
  }

  return {
    cityIndex,
    yearTable,
    filteredYearTable,
    visibleConferences,
    activeCategories: readonly(activeCategories),
    highlightedCity: readonly(highlightedCity),
    pinnedCity: readonly(pinnedCity),
    toggleCategory,
    isCategoryActive,
    setHighlight,
    togglePin,
    clearPin,
  }
}
