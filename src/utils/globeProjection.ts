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
  return [3.5, 5, 7, 9.5, 12.5][Math.max(0, Math.min(4, Math.round(tier) - 1))]
}

/** Exponential zoom interpolation keeps repeated button presses continuous. */
export function nextZoomAltitude(current: number, target: number, elapsed: number): number {
  const amount = 1 - Math.exp(-Math.min(48, Math.max(0, elapsed)) / 90)
  return Math.exp(Math.log(current) + (Math.log(target) - Math.log(current)) * amount)
}
