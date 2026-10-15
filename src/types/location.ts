import type { Category, Continent, YearEntry } from './conference'

export interface ClimateMonth {
  month: number
  name: string
  avg_temp_c: number
  avg_rainfall_mm: number
  note?: string
}

export interface ClimateData {
  monthly: ClimateMonth[]
}

export interface FoodItem {
  name: string
  description: string
}

export interface AttractionItem {
  name: string
  description: string
  type?: string
}

export interface Location {
  id: string
  city: string
  country: string
  continent: Continent
  description: string
  best_season: string
  climate: ClimateData
  food: FoodItem[]
  attractions: AttractionItem[]
  travel_tips?: string
  language?: string
  currency?: string
  image_url?: string
}

export interface LocationData {
  locations: Location[]
}

/** A conference edition associated with a destination. */
export interface CityConference {
  conferenceId: string
  conferenceName: string
  category: Category
  entry: YearEntry
}

/** A destination assembled from conference records and an optional travel guide. */
export interface CitySummary {
  id: string
  city: string
  country: string
  continent: Continent | null
  guide?: Location
  conferences: CityConference[]
}

export interface CityCardProps {
  city: CitySummary
}

export interface CityLinkProps {
  city?: string | null
  country?: string | null
  includeCountry?: boolean
}

export interface AttractionListProps {
  attractions?: AttractionItem[]
}

export interface FoodListProps {
  food?: FoodItem[]
}

export interface ClimateCardProps {
  climate?: ClimateData
}
