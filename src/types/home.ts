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

/** Lightweight orthographic canvas renderer used only by the homepage. */
export interface HomeGlobeRenderer {
  draw: (angle: number) => void
  resize: () => void
  updateTheme: () => void
}
