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

/** Conference recurrence frequency */
export type Frequency = 'annual' | 'biennial' | 'irregular'

/**
 * Conference schedule — drives next-edition creation when no active upcoming
 * exists. `next_expected_year` is only meaningful for `irregular`.
 */
export interface Schedule {
  frequency: Frequency
  next_expected_year?: number
}

/** DDL entry (abstract / paper deadline) */
export interface DDLEntry {
  date: string // ISO 8601 YYYY-MM-DD
  timezone: string // IANA e.g. "America/Los_Angeles"
  note?: string
}

/**
 * Single year entry — unified history and upcoming.
 * 字段统一用 `T | null` 表示「缺失」：history 条目应有真实值（非 null），
 * upcoming 占位条目可整字段为 null，由 AI 后续补全。前端对 null 渲染「待公布」。
 */
export interface YearEntry {
  year: number
  type: YearEntryType
  city?: string | null
  country?: string | null
  continent?: Continent | null
  venue?: string | null
  url?: string | null
  location_id?: string
  abstract_ddl?: DDLEntry[] | null
  paper_ddl?: DDLEntry[] | null
  notification_date?: string | null
  camera_ready?: string | null
  start_date?: string | null
  end_date?: string | null
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
  schedule?: Schedule
  years: YearEntry[]
}

/** Summary counts produced by one AI update run */
export interface AIRunSummary {
  archived: number
  created: number
  queried: number
  skipped: number
  updated: number
}

/** conferences.json top-level meta */
export interface ConferenceMeta {
  version: string
  last_updated: string
  description?: string
  data_source?: string
  last_ai_run?: string
  ai_run_summary?: AIRunSummary
}

/** conferences.json root */
export interface ConferenceData {
  meta: ConferenceMeta
  conferences: Conference[]
}
