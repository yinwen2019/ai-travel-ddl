import type { Category, Conference, YearEntry } from '@/types/conference'
import type {
  CityKey,
  CityData,
  ConferenceRef,
  WorldColumn,
  WorldCell,
  YearTable,
  MapDotSizeTier,
  MapDotColor,
  LatLngBounds,
} from '@/types/worldView'
import cityCoords from '@/data/cityCoords'
import { CATEGORY_LIST } from '@/constants'

// ============================================================
// 纯数据处理函数 — 零 DOM / Vue / Leaflet 依赖
// ============================================================

/**
 * 根据会议举办次数计算光点大小档位（1-5）
 * 1场 → 1, 2-3场 → 2, 4-6场 → 3, 7-10场 → 4, 11+场 → 5
 */
export function computeDotTier(count: number): MapDotSizeTier {
  if (count <= 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  if (count <= 10) return 4
  return 5
}

/**
 * 根据该城市最早 upcoming 会议分类计算光点颜色
 */
export function computeDotColor(upcomingCategory: Category | null): MapDotColor {
  if (upcomingCategory) return upcomingCategory
  return 'history'
}

/**
 * 获取城市 upcoming 光点对应的分类。
 * 多个 upcoming 会议落在同一城市时，使用最早 upcoming 年份的会议分类。
 */
function getUpcomingCategory(refs: ConferenceRef[]): Category | null {
  const upcomingRefs = refs.filter((ref) => ref.type === 'upcoming')
  if (upcomingRefs.length === 0) return null

  return [...upcomingRefs].sort((a, b) => a.year - b.year)[0]?.category ?? null
}

/**
 * 生成城市聚合键 "City, Country"
 */
export function makeCityKey(city: string, country: string): CityKey {
  return `${city}, ${country}`
}

/**
 * 从 cityCoords 查询坐标，查不到返回 null
 */
export function getCityCoords(
  cityKey: CityKey,
): { lat: number; lng: number } | null {
  return cityCoords.get(cityKey) ?? null
}

/**
 * 计算一组城市的经纬度边界框（用于地图 flyTo）
 */
export function getBoundingBox(cityKeys: CityKey[]): LatLngBounds | null {
  const coords = cityKeys
    .map((k) => cityCoords.get(k))
    .filter((c): c is { lat: number; lng: number } => c != null)

  if (coords.length === 0) return null

  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity

  for (const c of coords) {
    if (c.lat < minLat) minLat = c.lat
    if (c.lat > maxLat) maxLat = c.lat
    if (c.lng < minLng) minLng = c.lng
    if (c.lng > maxLng) maxLng = c.lng
  }

  return { minLat, maxLat, minLng, maxLng }
}

/**
 * 判断年份条目是否为虚拟/线上会议
 */
function isVirtual(entry: YearEntry): boolean {
  return entry.city === 'Virtual' || entry.country === 'Online'
}

/**
 * 构建城市聚合索引
 * 遍历所有会议的所有年份，按 CityKey 聚合，计算统计信息。
 * 虚拟/线上会议、缺少城市/国家字段的条目会被跳过。
 * 坐标缺失的城市输出 console.warn 并跳过（仅地图层，表格仍可显示）。
 */
export function buildCityIndex(conferences: Conference[]): Map<CityKey, CityData> {
  // 中间聚合结构
  const acc = new Map<
    CityKey,
    {
      city: string
      country: string
      historyCount: number
      upcomingCount: number
      refs: ConferenceRef[]
    }
  >()

  // 已警告的缺失坐标城市（去重）
  const warnedMissing = new Set<CityKey>()

  for (const conf of conferences) {
    if (!conf?.years) continue

    for (const y of conf.years) {
      // 跳过无效条目
      if (!y?.city || !y?.country) continue
      if (isVirtual(y)) continue

      const key = makeCityKey(y.city, y.country)

      if (!acc.has(key)) {
        acc.set(key, {
          city: y.city,
          country: y.country,
          historyCount: 0,
          upcomingCount: 0,
          refs: [],
        })
      }

      const entry = acc.get(key)!

      if (y.type === 'upcoming') {
        entry.upcomingCount++
      } else {
        entry.historyCount++
      }

      entry.refs.push({
        conferenceId: conf.id,
        conferenceName: conf.name,
        category: conf.category,
        year: y.year,
        type: y.type,
        abstractDdl: y.abstract_ddl ?? null,
        paperDdl: y.paper_ddl ?? null,
        startDate: y.start_date ?? null,
        endDate: y.end_date ?? null,
      })
    }
  }

  // 转换为最终 Map，过滤无坐标城市
  const result = new Map<CityKey, CityData>()

  for (const [key, entry] of acc) {
    const coords = cityCoords.get(key)

    if (!coords) {
      if (!warnedMissing.has(key)) {
        warnedMissing.add(key)
        console.warn(`[geoDataProcessor] Missing coordinates for city: ${key}`)
      }
      continue
    }

    const totalCount = entry.historyCount + entry.upcomingCount
    const upcomingCategory = getUpcomingCategory(entry.refs)

    result.set(key, {
      cityKey: key,
      city: entry.city,
      country: entry.country,
      lat: coords.lat,
      lng: coords.lng,
      totalCount,
      historyCount: entry.historyCount,
      upcomingCount: entry.upcomingCount,
      conferences: entry.refs,
      sizeTier: computeDotTier(totalCount),
      dotColor: computeDotColor(upcomingCategory),
      upcomingCategory,
    })
  }

  return result
}

/**
 * 构建年份-会议二维表
 * 列顺序：CV → NLP → ML → AI → DM，组内按会议名字母序排列
 * 行：年份降序
 */
export function buildYearTable(conferences: Conference[]): YearTable {
  // 收集所有有效会议
  const validConfs = conferences.filter((c) => c?.id && c?.name && c?.category)

  // 按分类分组排序
  const categoryOrder = CATEGORY_LIST
  const sortedConfs = [...validConfs].sort((a, b) => {
    const catA = categoryOrder.indexOf(a.category)
    const catB = categoryOrder.indexOf(b.category)
    if (catA !== catB) return catA - catB
    return a.name.localeCompare(b.name)
  })

  // 构建列描述
  const columns: WorldColumn[] = sortedConfs.map((c) => ({
    conferenceId: c.id,
    conferenceName: c.name,
    category: c.category,
  }))

  // 收集所有年份并降序排列
  const yearSet = new Set<number>()
  for (const conf of sortedConfs) {
    for (const y of conf.years ?? []) {
      yearSet.add(y.year)
    }
  }
  const years = Array.from(yearSet).sort((a, b) => b - a)

  // 构建单元格矩阵 cells[row][col]
  const cells: WorldCell[][] = []

  for (const year of years) {
    const row: WorldCell[] = []

    for (const col of columns) {
      const conf = sortedConfs.find((c) => c.id === col.conferenceId)
      const yearEntry = conf?.years?.find((y) => y.year === year)

      if (!yearEntry || !yearEntry.city || !yearEntry.country || isVirtual(yearEntry)) {
        row.push({
          cityKey: null,
          cityName: null,
          countryName: null,
          isUpcoming: false,
        })
      } else {
        row.push({
          cityKey: makeCityKey(yearEntry.city, yearEntry.country),
          cityName: yearEntry.city,
          countryName: yearEntry.country,
          isUpcoming: yearEntry.type === 'upcoming',
        })
      }
    }

    cells.push(row)
  }

  return { years, columns, cells }
}
