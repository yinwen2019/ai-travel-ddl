import type { Category, DDLEntry } from './conference'

/**
 * Unique key identifying a physical city.
 * Format: "City, Country" (e.g., "Vancouver, Canada")
 */
export type CityKey = string

/** Reference to a single conference-year at a city */
export interface ConferenceRef {
  conferenceId: string
  conferenceName: string
  category: Category
  year: number
  type: 'history' | 'upcoming'
  abstractDdl: DDLEntry[] | null
  paperDdl: DDLEntry[] | null
  startDate: string | null
  endDate: string | null
}

/** Five tiers of dot radius based on conference count */
export type MapDotSizeTier = 1 | 2 | 3 | 4 | 5

/** Color states for map dots */
export type MapDotColor = 'history' | Category

/** Aggregated city data for one map dot */
export interface CityData {
  cityKey: CityKey
  city: string
  country: string
  lat: number
  lng: number
  totalCount: number
  historyCount: number
  upcomingCount: number
  conferences: ConferenceRef[]
  sizeTier: MapDotSizeTier
  dotColor: MapDotColor
  upcomingCategory: Category | null
}

/** Column descriptor for the year table */
export interface WorldColumn {
  conferenceId: string
  conferenceName: string
  category: Category
}

/** A single cell in the year table */
export interface WorldCell {
  cityKey: CityKey | null
  cityName: string | null
  countryName: string | null
  isUpcoming: boolean
}

/** The complete year table structure */
export interface YearTable {
  years: number[]
  columns: WorldColumn[]
  cells: WorldCell[][]
}

/** Bounding box for fly-to operations (framework-agnostic) */
export interface LatLngBounds {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

/** Legend color item */
export interface LegendColorItem {
  label: string
  color: MapDotColor
}

/** Legend size item */
export interface LegendSizeItem {
  label: string
  radius: number
  tier: MapDotSizeTier
}
