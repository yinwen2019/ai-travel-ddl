import type { Conference } from '@/types/conference'
import type { CitySummary, Location } from '@/types/location'

/** Normalize accents and casing without changing the displayed source name. */
export function normalizeCityText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/** Generate a stable destination path when no travel-guide ID exists. */
export function citySlug(city: string, country: string): string {
  return normalizeCityText(`${city}-${country}`)
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
}

/** Join all physical conference destinations to their optional travel guides. */
export function buildCityDirectory(
  conferences: Conference[],
  locations: Location[],
): CitySummary[] {
  const index = new Map<string, CitySummary>()
  const keyFor = (city: string, country: string) => normalizeCityText(`${city}, ${country}`)

  for (const guide of locations) {
    index.set(keyFor(guide.city, guide.country), {
      id: guide.id,
      city: guide.city,
      country: guide.country,
      continent: guide.continent ?? null,
      guide,
      conferences: [],
    })
  }

  for (const conference of conferences) {
    for (const entry of conference.years) {
      const city = entry.city?.trim()
      const country = entry.country?.trim()
      // 线上会议和未公布的举办地不生成城市；无需坐标也能浏览目的地。
      if (
        !city ||
        !country ||
        normalizeCityText(city) === 'virtual' ||
        normalizeCityText(country) === 'online'
      )
        continue
      const key = keyFor(city, country)
      let destination = index.get(key)
      if (!destination) {
        destination = {
          id: citySlug(city, country),
          city,
          country,
          continent: entry.continent ?? null,
          conferences: [],
        }
        index.set(key, destination)
      }
      destination.conferences.push({
        conferenceId: conference.id,
        conferenceName: conference.name,
        category: conference.category,
        entry,
      })
      destination.continent ??= entry.continent ?? null
    }
  }

  return [...index.values()]
    .map((city) => ({
      ...city,
      conferences: [...city.conferences].sort(
        (a, b) => b.entry.year - a.entry.year || a.conferenceName.localeCompare(b.conferenceName),
      ),
    }))
    .sort((a, b) => a.city.localeCompare(b.city, 'en'))
}
