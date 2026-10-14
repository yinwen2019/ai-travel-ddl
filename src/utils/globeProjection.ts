export const MIN_GLOBE_ALTITUDE = 0.025
export const MAX_GLOBE_ALTITUDE = 3.2

/** Converts a screen pixel to world units at a given camera-space depth. */
export function worldUnitsPerPixel(
  depth: number,
  projectionScaleY: number,
  height: number,
): number {
  return (2 * Math.max(0.001, depth)) / (Math.max(1, height) * projectionScaleY)
}

/** Fixed screen-space size preserves conference-count encoding while zooming. */
export function markerPixelRadius(tier: number): number {
  return 2.8 + tier * 0.8
}
