import type { CityData, CityKey, LatLngBounds } from './worldView'

export type GlobeTheme = 'light' | 'dark'

export interface GlobeGeometryData {
  positions: Int16Array
  indices: Uint32Array
  borders: Uint32Array
}

export interface ConferenceGlobeOptions {
  theme: GlobeTheme
  reducedMotion: boolean
  cities: CityData[]
  onHover: (city: CityData | null) => void
  onSelect: (city: CityData) => void
  onError: () => void
}

export interface ConferenceGlobe {
  ready: () => Promise<void>
  setTheme: (theme: GlobeTheme) => void
  setReducedMotion: (reduced: boolean) => void
  resize: (width: number, height: number) => void
  setCities: (cities: CityData[]) => void
  setActive: (highlighted: CityKey | null, pinned: CityKey | null) => void
  setMotion: (enabled: boolean) => void
  setPaused: (paused: boolean) => void
  setVisible: (visible: boolean) => void
  setLandmarks: (visible: boolean) => void
  flyToCity: (city: CityData) => void
  flyToBounds: (bounds: LatLngBounds) => void
  zoom: (factor: number) => void
  reset: () => void
  destroy: () => void
}

export type LandmarkKind =
  | 'eiffel'
  | 'opera'
  | 'needle'
  | 'marina'
  | 'hongkong'
  | 'vancouver'
  | 'beijing'
  | 'seoul'
  | 'macao'
  | 'sanfrancisco'

export interface GlobeLandmark {
  cityKey: CityKey
  name: string
  kind: LandmarkKind
  features?: readonly string[]
}
