import { readFile, writeFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'

// UI 资源预处理独立于 scripts/ 的会议数据更新流程。
globalThis.window = {}
const { default: ConicPolygonGeometry } = await import('three-conic-polygon-geometry')
const root = new URL('../src/assets/maps/', import.meta.url)
const land = JSON.parse(await readFile(new URL('world-land.geojson', root), 'utf8'))
const positions = []
const indices = []
const borders = []
const unique = new Map()
const quantize = (value) => Math.round(Math.max(-1, Math.min(1, value)) * 32767)
function vertex(point) {
  const coordinates = point.map(quantize)
  const key = coordinates.join(',')
  if (!unique.has(key)) {
    unique.set(key, positions.length / 3)
    positions.push(...coordinates)
  }
  return unique.get(key)
}
function vector(lat, lng) {
  const phi = (lat * Math.PI) / 180
  const theta = (lng * Math.PI) / 180
  return [Math.cos(phi) * Math.sin(theta), Math.sin(phi), Math.cos(phi) * Math.cos(theta)]
}
for (const feature of land.features) {
  const polygons =
    feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates
  for (const polygon of polygons) {
    const geometry = new ConicPolygonGeometry(polygon, 0, 1, false, true, false, 1)
    const source = geometry.getAttribute('position')
    const remap = []
    for (let i = 0; i < source.count; i++) {
      remap.push(vertex([source.getX(i), source.getY(i), source.getZ(i)]))
    }
    for (const index of geometry.index.array) indices.push(remap[index])
    geometry.dispose()
    for (const ring of polygon) {
      for (let i = 1; i < ring.length; i++) {
        const [lng, lat] = ring[i]
        const [previousLng, previousLat] = ring[i - 1]
        if (Math.abs(lng - previousLng) > 180) continue
        const count = Math.max(
          1,
          Math.ceil(Math.max(Math.abs(lng - previousLng), Math.abs(lat - previousLat))),
        )
        for (let step = 0; step < count; step++) {
          for (const t of [step / count, (step + 1) / count]) {
            borders.push(
              vertex(
                vector(
                  previousLat + (lat - previousLat) * t,
                  previousLng + (lng - previousLng) * t,
                ),
              ),
            )
          }
        }
      }
    }
  }
}
const payload = []
function encode(values, stride) {
  const previous = new Array(stride).fill(0)
  values.forEach((value, i) => {
    const axis = i % stride
    const delta = value - previous[axis]
    previous[axis] = value
    let encoded = (delta << 1) ^ (delta >> 31)
    while (encoded >= 128) {
      payload.push((encoded & 127) | 128)
      encoded >>>= 7
    }
    payload.push(encoded)
  })
}
encode(positions, 3)
encode(indices, 1)
encode(borders, 1)
const output = Buffer.alloc(24 + payload.length)
// CLG1, format version, vertex count, index count, border vertex count, reserved.
const header = [0x31474c43, 2, positions.length / 3, indices.length, borders.length, 0]
header.forEach((value, i) => output.writeUInt32LE(value, i * 4))
Buffer.from(payload).copy(output, 24)
const compressed = gzipSync(output, { level: 9 })
await writeFile(new URL('world-mesh.bin.gz', root), compressed)
console.log(
  JSON.stringify({
    vertices: positions.length / 3,
    triangles: indices.length / 3,
    borderIndices: borders.length,
    bytes: output.byteLength,
    compressedBytes: compressed.byteLength,
  }),
)
