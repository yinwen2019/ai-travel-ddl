import type { CitySummary } from '@/types/location'
import type { CityRankingEntry } from '@/types/home'

/** Keep a country's color stable when the ranking changes. */
function countryTone(country: string): number {
  const primary: Record<string, number> = { Canada: 0, 'United States': 1, Singapore: 2 }
  if (country in primary) return primary[country]
  return 3 + ([...country].reduce((hash, character) => hash + character.codePointAt(0)!, 0) % 4)
}

/** Rank archived physical editions; equal counts share competition ranks. */
export function buildHomeRanking(cities: CitySummary[], limit = 8): CityRankingEntry[] {
  const ordered = cities
    .map((city) => ({
      city,
      count: city.conferences.filter(({ entry }) => entry.type === 'history').length,
    }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count || a.city.city.localeCompare(b.city.city, 'en'))

  let rank = 0
  return ordered.slice(0, Math.max(0, limit)).map((entry, index) => {
    if (index === 0 || entry.count !== ordered[index - 1].count) rank = index + 1
    return {
      ...entry,
      rank,
      tied: ordered[index - 1]?.count === entry.count || ordered[index + 1]?.count === entry.count,
      countryTone: countryTone(entry.city.country),
    }
  })
}
