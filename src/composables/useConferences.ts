import { computed } from 'vue'
import type { Conference, ConferenceData } from '@/types/conference'
import rawData from '../../data/conferences.json'

const data = rawData as ConferenceData

function safeConferences(): Conference[] {
  if (!data || !Array.isArray(data.conferences)) return []
  return data.conferences.filter(
    (c): c is Conference =>
      !!c && typeof c.id === 'string' && typeof c.name === 'string',
  )
}

export function useConferences() {
  const conferences = computed<Conference[]>(() => safeConferences())

  function getById(id: string): Conference | undefined {
    return safeConferences().find((c) => c.id === id)
  }

  function search(query: string): Conference[] {
    const q = query.toLowerCase().trim()
    if (!q) return safeConferences()
    return safeConferences().filter((c) => {
      const matchName = c.name.toLowerCase().includes(q)
      const matchFull = c.full_name.toLowerCase().includes(q)
      const matchAka = c.aka?.some((a) => a.toLowerCase().includes(q)) ?? false
      const matchCategory = c.category?.toLowerCase().includes(q) ?? false
      return matchName || matchFull || matchAka || matchCategory
    })
  }

  return { conferences, getById, search }
}
