import { computed } from 'vue'
import type { Location, LocationData } from '@/types/location'
import rawData from '../../data/locations.json'

const data = rawData as LocationData

function safeLocations(): Location[] {
  if (!data || !Array.isArray(data.locations)) return []
  return data.locations.filter(
    (l): l is Location =>
      !!l && typeof l.id === 'string' && typeof l.city === 'string',
  )
}

export function useLocations() {
  const locations = computed<Location[]>(() => safeLocations())

  function getById(id: string): Location | undefined {
    return safeLocations().find((l) => l.id === id)
  }

  return { locations, getById }
}
