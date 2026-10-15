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

/** Focus can reduce surrounding detail, but never bypass the zoom thresholds. */
export function globeDetailLevel(altitude: number, focus = 1) {
  const weight = Math.max(0, Math.min(1, focus))
  return {
    landmark: reveal(altitude, GLOBE_DETAIL_LEVELS.landmarkFull, GLOBE_DETAIL_LEVELS.landmarkStart),
    city: reveal(altitude, GLOBE_DETAIL_LEVELS.cityFull, GLOBE_DETAIL_LEVELS.cityStart) * weight,
    sizeScale: 0.6 + 0.4 * weight,
  }
}
