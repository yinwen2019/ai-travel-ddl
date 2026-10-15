/** Camera altitude thresholds for conference-first progressive disclosure. */
export const GLOBE_DETAIL_LEVELS = {
  landmarkStart: 0.95,
  landmarkFull: 0.55,
  cityStart: 0.32,
  cityFull: 0.1,
} as const

function reveal(altitude: number, near: number, far: number): number {
  const t = Math.max(0, Math.min(1, (far - altitude) / (far - near)))
  return t * t * (3 - 2 * t)
}

/** Selection never overrides the zoom level; conference markers remain primary. */
export function globeDetailLevel(altitude: number) {
  return {
    landmark: reveal(altitude, GLOBE_DETAIL_LEVELS.landmarkFull, GLOBE_DETAIL_LEVELS.landmarkStart),
    city: reveal(altitude, GLOBE_DETAIL_LEVELS.cityFull, GLOBE_DETAIL_LEVELS.cityStart),
  }
}
