import type { DDLUrgency } from '@/types/view'
import type { DDLEntry, YearEntry } from '@/types/conference'

export function useDDLStatus() {
  function getTodayUtc(): Date {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    return today
  }

  function getDateTime(dateStr: string): number | null {
    const d = new Date(dateStr + 'T00:00:00Z')
    if (isNaN(d.getTime())) return null
    return d.getTime()
  }

  function getUrgency(dateStr: string): DDLUrgency {
    const ddlTime = getDateTime(dateStr)
    if (ddlTime == null) return 'expired'
    const today = getTodayUtc()

    const diffMs = ddlTime - today.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'expired'
    if (diffDays <= 7) return 'urgent'
    if (diffDays <= 30) return 'near'
    return 'ample'
  }

  function getRelativeDays(dateStr: string): number | null {
    const dateTime = getDateTime(dateStr)
    if (dateTime == null) return null
    const today = getTodayUtc()
    const diffMs = dateTime - today.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }

  function isDateFuture(dateStr: string): boolean {
    const dateTime = getDateTime(dateStr)
    if (dateTime == null) return false
    return dateTime >= getTodayUtc().getTime()
  }

  function getAllDeadlines(entry: Pick<YearEntry, 'abstract_ddl' | 'paper_ddl'>): DDLEntry[] {
    return [...(entry.abstract_ddl ?? []), ...(entry.paper_ddl ?? [])]
  }

  function getEarliestUpcomingDDL(
    entry: Pick<YearEntry, 'abstract_ddl' | 'paper_ddl'>,
  ): DDLEntry | null {
    const todayTime = getTodayUtc().getTime()

    return getAllDeadlines(entry)
      .filter((ddl) => {
        const dateTime = getDateTime(ddl.date)
        return dateTime != null && dateTime >= todayTime
      })
      .sort((a, b) => {
        const aTime = getDateTime(a.date) ?? Number.POSITIVE_INFINITY
        const bTime = getDateTime(b.date) ?? Number.POSITIVE_INFINITY
        return aTime - bTime
      })[0] ?? null
  }

  function hasDeadline(entry: Pick<YearEntry, 'abstract_ddl' | 'paper_ddl'>): boolean {
    return getAllDeadlines(entry).some((ddl) => getDateTime(ddl.date) != null)
  }

  return {
    getUrgency,
    getRelativeDays,
    isDateFuture,
    getEarliestUpcomingDDL,
    hasDeadline,
  }
}
