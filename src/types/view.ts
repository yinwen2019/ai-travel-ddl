import type { CityData } from './worldView'
import type { Conference, YearEntry } from './conference'

/** Shared edition card; compact layout is used in conference carousels. */
export interface ConferenceCardProps {
  conference: Conference
  year: number
  compact?: boolean
}

/** Deadline stages with an optional condensed presentation. */
export interface ProgressBarProps {
  entry: Pick<YearEntry, 'abstract_ddl' | 'paper_ddl' | 'notification_date' | 'start_date'>
  compact?: boolean
}

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

/** Labels for the shared search control. */
export interface SearchInputProps {
  label?: string
  placeholder?: string
}

/** Props for the selected city panel. */
export interface WorldCityPanelProps {
  city: CityData
}
