import { computed } from 'vue'
import type { CitySummary } from '@/types/location'
import type { RankingBoard, RankingEntry, RankingKind } from '@/types/rankings'
import { buildHomeRanking } from '@/utils/homeRanking'
import { useCityDirectory } from './useCityDirectory'
import { useCommunitySignals } from './useCommunitySignals'
import { useConferences } from './useConferences'
import { analytics } from '@/services/analytics'

export const RANKING_BOARDS: readonly RankingBoard[] = [
  {
    id: 'hosting',
    title: '城市举办榜',
    shortTitle: '城市举办',
    description: '一场场学术相遇，留下城市的足迹。',
    unit: '届',
    methodology:
      '仅统计本站收录的历史线下会议届次，排除线上和未来届次；同届数并列，城市按英文名排序。',
  },
  {
    id: 'conference-heat',
    title: '会议热度榜',
    shortTitle: '会议热度',
    description: '看看大家关注哪些会议。',
    unit: '次',
    methodology:
      '按主动点击累计，重复点击分别计数；筛选、轮播、刷新和组件自动变化不计入。全站数据以统计服务为准。',
  },
  {
    id: 'city-heat',
    title: '城市热度榜',
    shortTitle: '城市热度',
    description: '让好奇心，指向下一座城市。',
    unit: '次',
    methodology:
      '按主动点击累计，重复点击分别计数；筛选、轮播、刷新和组件自动变化不计入。全站数据以统计服务为准。',
  },
  {
    id: 'city-wishlist',
    title: '城市期待榜',
    shortTitle: '城市期待',
    description: '下一场会议，你希望在哪里举办？',
    unit: '票',
    methodology:
      '为希望承办会议的城市投票，每次 +1，可反复投票。未连接统计服务时为本机预览，连接后为全站累计；零票城市不参与排名。',
  },
]

function conferenceNames(city: CitySummary, historyOnly = false): string {
  const names = city.conferences
    .filter(({ entry }) => !historyOnly || entry.type === 'history')
    .map(({ conferenceName }) => conferenceName)

  return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'en')).join(' · ')
}

function historicalDetail(city: CitySummary): string {
  const years = city.conferences
    .filter(({ entry }) => entry.type === 'history')
    .map(({ entry }) => entry.year)
    .sort((a, b) => a - b)
  const firstYear = years[0]
  const lastYear = years[years.length - 1]
  const yearRange = firstYear === lastYear ? `${firstYear}` : `${firstYear}–${lastYear}`

  return `${conferenceNames(city, true)} · ${yearRange}`
}

export function useRankings() {
  const { cities } = useCityDirectory()
  const { conferences } = useConferences()
  const { votes } = useCommunitySignals()

  // 全榜和首页复用历史统计口径，排序始终作用于新数组。
  const hosting = computed<RankingEntry[]>(() =>
    buildHomeRanking(cities.value, cities.value.length).map((entry) => ({
      id: entry.city.id,
      name: entry.city.city,
      subtitle: entry.city.country,
      detail: historicalDetail(entry.city),
      to: `/cities/${encodeURIComponent(entry.city.id)}`,
      count: entry.count,
      rank: entry.rank,
      tied: entry.tied,
      countryTone: entry.countryTone,
      cityId: entry.city.id,
    })),
  )

  const wishlist = computed<RankingEntry[]>(() => {
    const ordered = cities.value
      .map((city) => ({ city, count: votes.value[city.id] ?? 0 }))
      .sort((a, b) => b.count - a.count || a.city.city.localeCompare(b.city.city, 'en'))
    let rank = 0

    // 期待来源由连接模式决定；零票城市仅作候选，不生成虚假名次。
    return ordered.map(({ city, count }, index): RankingEntry => {
      if (count > 0 && (index === 0 || count !== ordered[index - 1].count)) rank = index + 1
      return {
        id: city.id,
        name: city.city,
        subtitle: city.country,
        detail: conferenceNames(city) || '会议记录待补充',
        to: `/cities/${encodeURIComponent(city.id)}`,
        count,
        rank: count > 0 ? rank : null,
        tied:
          count > 0 && (ordered[index - 1]?.count === count || ordered[index + 1]?.count === count),
        cityId: city.id,
      }
    })
  })

  function entriesFor(kind: RankingKind): RankingEntry[] {
    if (kind === 'hosting') return hosting.value
    if (kind === 'city-wishlist') return wishlist.value
    if (!analytics.enabled || !analytics.ready.value) return []
    const rows: RankingEntry[] =
      kind === 'conference-heat'
        ? conferences.value.map((conference) => ({
            id: conference.id,
            name: conference.name,
            subtitle: conference.category,
            detail: conference.full_name,
            to: `/conference/${encodeURIComponent(conference.id)}`,
            count: analytics.state.value.conferenceClicks[conference.id] ?? 0,
            rank: null,
            tied: false,
          }))
        : cities.value.map((city) => ({
            id: city.id,
            name: city.city,
            subtitle: city.country,
            detail: conferenceNames(city),
            to: `/cities/${encodeURIComponent(city.id)}`,
            count: analytics.state.value.cityClicks[city.id] ?? 0,
            rank: null,
            tied: false,
            cityId: city.id,
          }))
    const ordered = rows
      .filter((entry) => (entry.count ?? 0) > 0)
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0) || a.name.localeCompare(b.name, 'en'))
    let rank = 0
    return ordered.map((entry, index) => {
      if (index === 0 || entry.count !== ordered[index - 1].count) rank = index + 1
      return {
        ...entry,
        rank,
        tied:
          ordered[index - 1]?.count === entry.count || ordered[index + 1]?.count === entry.count,
      }
    })
  }

  return { boards: RANKING_BOARDS, entriesFor, cities, conferences }
}
