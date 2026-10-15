import { computed } from 'vue'
import { useConferences } from './useConferences'
import { useLocations } from './useLocations'
import { buildCityDirectory, normalizeCityText } from '@/utils/cityDirectory'

const { conferences } = useConferences()
const { locations } = useLocations()
const cities = computed(() => buildCityDirectory(conferences.value, locations.value))
const byId = computed(() => new Map(cities.value.map((city) => [city.id, city])))
const byName = computed(
  () =>
    new Map(cities.value.map((city) => [normalizeCityText(`${city.city}, ${city.country}`), city])),
)

export function useCityDirectory() {
  function getById(id: string) {
    return byId.value.get(id)
  }

  function findCity(city?: string | null, country?: string | null) {
    if (!city || !country) return undefined
    return byName.value.get(normalizeCityText(`${city}, ${country}`))
  }

  return { cities, getById, findCity }
}
