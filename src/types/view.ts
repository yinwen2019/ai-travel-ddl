import type { CityData } from './worldView'

/** Active view mode */
export type ViewMode = 'conference' | 'year'

/** DDL urgency level for color coding */
export type DDLUrgency = 'expired' | 'travel' | 'urgent' | 'near' | 'ample'

/** Progress bar node state */
export type ProgressNodeState = 'done' | 'current' | 'future'

/** Props for the conference selection panel. */
export interface ConferenceFiltersProps {
  open: boolean
}

/** Props for the selected city panel. */
export interface WorldCityPanelProps {
  city: CityData
}
