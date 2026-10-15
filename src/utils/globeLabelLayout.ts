import type { CityData, CityKey } from '@/types/worldView'
import { MAX_GLOBE_ALTITUDE } from './globeProjection'

/** Gradually increases label capacity while keeping names in the global view. */
export function cityLabelBudget(altitude: number, compact: boolean): number {
  const progress = Math.max(
    0,
    Math.min(1, Math.log(MAX_GLOBE_ALTITUDE / Math.max(0.08, altitude)) / Math.log(40)),
  )
  return compact ? Math.round(3 + progress * 9) : Math.round(6 + progress * 18)
}

/** Uses conference activity rather than a fixed list of popular destinations. */
export function rankCityLabels(
  cities: readonly CityData[],
  pinned: CityKey | null,
  hovered: CityKey | null,
  highlighted: CityKey | null,
): CityData[] {
  const focus = (key: CityKey) =>
    key === pinned ? 3 : key === hovered ? 2 : key === highlighted ? 1 : 0
  return [...cities].sort(
    (a, b) =>
      focus(b.cityKey) - focus(a.cityKey) ||
      b.upcomingCount - a.upcomingCount ||
      b.totalCount - a.totalCount ||
      a.cityKey.localeCompare(b.cityKey),
  )
}
