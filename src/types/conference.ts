/** Conference category */
export type Category = 'CV' | 'NLP' | 'ML' | 'AI' | 'DM'

/** Continent */
export type Continent =
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Africa'
  | 'Oceania'

/** Year entry type */
export type YearEntryType = 'history' | 'upcoming'

/** Verification status (upcoming entries only) */
export type VerificationStatus = 'verified' | 'unverified'

/** DDL entry (abstract / paper deadline) */
export interface DDLEntry {
  date: string // ISO 8601 YYYY-MM-DD
  timezone: string // IANA e.g. "America/Los_Angeles"
  note?: string
}

/** Single year entry — unified history and upcoming */
export interface YearEntry {
  year: number
  type: YearEntryType
  city: string
  country: string
  continent: Continent
  venue?: string
  url?: string
  location_id?: string
  abstract_ddl?: DDLEntry[]
  paper_ddl?: DDLEntry[]
  notification_date?: string
  camera_ready?: string
  start_date?: string
  end_date?: string
  status?: VerificationStatus
}

/** Conference object */
export interface Conference {
  id: string
  name: string
  full_name: string
  category: Category
  subcategory?: string
  aka?: string[]
  website?: string
  years: YearEntry[]
}

/** conferences.json top-level meta */
export interface ConferenceMeta {
  version: string
  last_updated: string
  description?: string
  data_source?: string
}

/** conferences.json root */
export interface ConferenceData {
  meta: ConferenceMeta
  conferences: Conference[]
}
