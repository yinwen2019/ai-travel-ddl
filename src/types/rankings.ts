/** The ranking categories shared by the homepage and the rankings page. */
export type RankingKind = 'hosting' | 'conference-heat' | 'city-heat' | 'city-wishlist'

/** Display copy and counting rules for one ranking category. */
export interface RankingBoard {
  id: RankingKind
  title: string
  shortTitle: string
  description: string
  unit: string
  methodology: string
}

/** A shared ranking row; null ranks indicate an unranked candidate. */
export interface RankingEntry {
  id: string
  name: string
  subtitle: string
  detail: string
  to: string
  count: number | null
  rank: number | null
  tied: boolean
  countryTone?: number
  cityId?: string
}
