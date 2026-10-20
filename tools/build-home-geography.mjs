import { readFile, writeFile } from 'node:fs/promises'
import { geoArea } from 'd3-geo'

// 首页仅保留投影所需坐标；简化在构建资产时完成，不占用浏览器首屏时间。
const source = new URL('../src/assets/maps/world-land.geojson', import.meta.url)
const target = new URL('../src/assets/maps/home-land.json', import.meta.url)
const toleranceSquared = 0.12 ** 2

function distanceToSegment(point, start, end) {
  let [x, y] = start
  const dx = end[0] - x
  const dy = end[1] - y
  const t = dx || dy ? ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy) : 0
  if (t > 1) [x, y] = end
  else if (t > 0) {
    x += dx * t
    y += dy * t
  }
  return (point[0] - x) ** 2 + (point[1] - y) ** 2
}

function simplifyRing(ring) {
  const keep = new Set([0, ring.length - 1])
  const stack = [[0, ring.length - 1]]
  while (stack.length) {
    const [start, end] = stack.pop()
    let furthest = -1
    let maximum = toleranceSquared
    for (let index = start + 1; index < end; index++) {
      const distance = distanceToSegment(ring[index], ring[start], ring[end])
      if (distance > maximum) {
        maximum = distance
        furthest = index
      }
    }
    if (furthest !== -1) {
      keep.add(furthest)
      stack.push([start, furthest], [furthest, end])
    }
  }
  const simplified = [...keep].sort((a, b) => a - b).map((index) => ring[index])
  // 极小岛屿仍保持合法闭环，避免简化后产生退化多边形。
  return (simplified.length >= 4 ? simplified : ring).map((point) =>
    point.map((coordinate) => Number(coordinate.toFixed(3))),
  )
}

function simplifyPolygon(polygon) {
  const simplified = polygon.map(simplifyRing)
  // 微小岛屿量化后可能退化并反转球面内外；保留原坐标避免整球误填。
  return geoArea({ type: 'Polygon', coordinates: simplified }) > Math.PI * 2 ? polygon : simplified
}

const input = JSON.parse(await readFile(source, 'utf8'))
const features = input.features.map(({ geometry }) => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: geometry.type,
    coordinates:
      geometry.type === 'Polygon'
        ? simplifyPolygon(geometry.coordinates)
        : geometry.coordinates.map(simplifyPolygon),
  },
}))
const output = JSON.stringify({ type: 'FeatureCollection', features })
await writeFile(target, `${output}\n`)
console.log(
  `Prepared homepage geography: ${features.length} countries, ${Buffer.byteLength(output)} bytes`,
)
