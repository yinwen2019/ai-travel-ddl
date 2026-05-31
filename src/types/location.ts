import type { Continent } from './conference'

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
