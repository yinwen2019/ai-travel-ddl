import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import land from '@/assets/maps/home-land.json'
import type { HomeGlobeRenderer } from '@/types/home'

/** Retain the static globe's projection, geometry and CSS theme on a 2D canvas. */
export function createHomeGlobe(canvas: HTMLCanvasElement): HomeGlobeRenderer | null {
  const context = canvas.getContext('2d')
  if (!context) return null
  const projection = geoOrthographic().translate([340, 340]).scale(305).clipAngle(90)
  const path = geoPath(projection, context)
  const geography = land as unknown as FeatureCollection<Polygon | MultiPolygon>
  const grid = geoGraticule10()
  const sphere = { type: 'Sphere' as const }
  let ocean = ''
  let continent = ''
  let graticule = ''
  let border = ''

  function updateTheme(): void {
    const style = getComputedStyle(canvas)
    ocean = style.getPropertyValue('--home-ocean').trim()
    continent = style.getPropertyValue('--home-land').trim()
    graticule = style.getPropertyValue('--home-graticule').trim()
    border = style.getPropertyValue('--color-canvas').trim()
  }

  function resize(): void {
    // 限制高像素密度屏的画布开销，布局与静态 SVG 使用相同坐标系。
    const size = Math.max(
      1,
      Math.round(canvas.getBoundingClientRect().width * Math.min(devicePixelRatio || 1, 2)),
    )
    if (canvas.width !== size || canvas.height !== size) {
      canvas.width = size
      canvas.height = size
    }
    context?.setTransform(size / 680, 0, 0, size / 680, 0, 0)
  }

  function draw(angle: number): void {
    if (!context) return
    projection.rotate([-25 + angle, -17, 0])
    context.clearRect(0, 0, 680, 680)
    context.beginPath()
    path(sphere)
    context.fillStyle = ocean
    context.fill()
    context.strokeStyle = graticule
    context.lineWidth = 0.8
    context.stroke()
    context.beginPath()
    path(grid)
    context.strokeStyle = graticule
    context.lineWidth = 0.65
    context.stroke()
    context.beginPath()
    path(geography)
    context.fillStyle = continent
    context.fill()
    context.strokeStyle = border
    context.lineWidth = 0.6
    context.lineJoin = 'round'
    context.stroke()
  }

  updateTheme()
  resize()
  return { draw, resize, updateTheme }
}
