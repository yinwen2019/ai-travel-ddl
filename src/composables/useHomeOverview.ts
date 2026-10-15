import { computed } from 'vue'
import { useConferences } from './useConferences'
import { useCityDirectory } from './useCityDirectory'
import { buildHomeRanking } from '@/utils/homeRanking'

export function useHomeOverview() {
  const { conferences } = useConferences()
  const { cities } = useCityDirectory()

  const conferenceCount = computed(() => conferences.value.length)
  const cityCount = computed(
    () => cities.value.filter((city) => city.conferences.length > 0).length,
  )
  const ranking = computed(() => buildHomeRanking(cities.value))

  return { conferenceCount, cityCount, ranking }
}
