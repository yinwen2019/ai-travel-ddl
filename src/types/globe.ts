import type { CityData, CityKey, LatLngBounds } from './worldView'

export interface ConferenceGlobeOptions {
  cities: CityData[]
  onHover: (city: CityData | null) => void
  onSelect: (city: CityData) => void
  onError: () => void
}

export interface ConferenceGlobe {
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

export type LandmarkKind = 'eiffel' | 'opera' | 'needle' | 'marina'

export interface GlobeLandmark {
  cityKey: CityKey
  name: string
  kind: LandmarkKind
}
