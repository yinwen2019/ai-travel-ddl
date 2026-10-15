import type { CitySummary } from './location'

/** A city ranked by the historical physical editions in the local dataset. */
export interface CityRankingEntry {
  city: CitySummary
  count: number
  rank: number
  tied: boolean
  countryTone: number
}

export interface HomeCityRankingProps {
  entries: CityRankingEntry[]
}
