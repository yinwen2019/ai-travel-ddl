import * as THREE from 'three'
import type { FeatureCollection, Polygon, MultiPolygon, Position } from 'geojson'

/** Coordinates follow the same orientation as ThreeGlobe. */
export function globeVector(lat: number, lng: number, radius = 100): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(lat)
  const theta = THREE.MathUtils.degToRad(lng)
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.cos(theta),
  )
}

/** Builds local continent dots and fine country boundaries without image or tile services. */
export function createLandscape(
  data: FeatureCollection<Polygon | MultiPolygon>,
  compact: boolean,
): THREE.Group {
  const group = new THREE.Group()
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('无法生成地球轮廓')
  const borders: number[] = []
  function traceRing(ring: Position[]) {
    ring.forEach(([lng, lat], i) => {
      const x = ((lng + 180) / 360) * canvas.width
      const y = ((90 - lat) / 180) * canvas.height
      if (i === 0) ctx!.moveTo(x, y)
      else ctx!.lineTo(x, y)
      if (i === 0) return
      const [prevLng, prevLat] = ring[i - 1]
      // 跨日期变更线的边不连接，避免画出横穿地球的长线。
      if (Math.abs(lng - prevLng) > 180) return
      const count = Math.max(
        1,
        Math.ceil(Math.max(Math.abs(lng - prevLng), Math.abs(lat - prevLat))),
      )
      for (let step = 0; step < count; step++) {
        for (const t of [step / count, (step + 1) / count]) {
          borders.push(
            ...globeVector(
              prevLat + (lat - prevLat) * t,
              prevLng + (lng - prevLng) * t,
              100.08,
            ).toArray(),
          )
        }
      }
    })
    ctx!.closePath()
  }
  ctx.fillStyle = '#ffffff'
  for (const feature of data.features) {
    const polygons =
      feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates
    for (const polygon of polygons) {
      ctx.beginPath()
      polygon.forEach(traceRing)
      ctx.fill('evenodd')
    }
  }
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const positions: number[] = []
  const colors: number[] = []
  const total = compact ? 18000 : 42000
  const color = new THREE.Color()
  // 均匀球面采样，避免高纬度粒子挤在一起。
  for (let i = 0; i < total; i++) {
    const lat = Math.asin(1 - (2 * (i + 0.5)) / total) * (180 / Math.PI)
    const lng = ((i * 137.507764) % 360) - 180
    const x = Math.min(canvas.width - 1, Math.floor(((lng + 180) / 360) * canvas.width))
    const y = Math.min(canvas.height - 1, Math.floor(((90 - lat) / 180) * canvas.height))
    if (pixels[(y * canvas.width + x) * 4 + 3] < 128) continue
    positions.push(...globeVector(lat, lng, 100.13).toArray())
    color.set('#589eaa').multiplyScalar(0.8 + 0.35 * (0.5 + 0.5 * Math.sin(i * 8.31)))
    colors.push(color.r, color.g, color.b)
  }
  const dotGeometry = new THREE.BufferGeometry()
  dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  dotGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  group.add(
    new THREE.Points(
      dotGeometry,
      new THREE.PointsMaterial({
        size: compact ? 1.65 : 1.45,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
      }),
    ),
  )
  const borderGeometry = new THREE.BufferGeometry()
  borderGeometry.setAttribute('position', new THREE.Float32BufferAttribute(borders, 3))
  group.add(
    new THREE.LineSegments(
      borderGeometry,
      new THREE.LineBasicMaterial({ color: '#407382', transparent: true, opacity: 0.4 }),
    ),
  )
  // 经线和纬线与球面保持相同深度关系，背面会被球体遮挡。
  const grid: number[] = []
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lng = -180; lng < 180; lng += 2)
      grid.push(
        ...globeVector(lat, lng, 100.03).toArray(),
        ...globeVector(lat, lng + 2, 100.03).toArray(),
      )
  }
  for (let lng = -180; lng < 180; lng += 30) {
    for (let lat = -90; lat < 90; lat += 2)
      grid.push(
        ...globeVector(lat, lng, 100.03).toArray(),
        ...globeVector(lat + 2, lng, 100.03).toArray(),
      )
  }
  const gridGeometry = new THREE.BufferGeometry()
  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(grid, 3))
  group.add(
    new THREE.LineSegments(
      gridGeometry,
      new THREE.LineBasicMaterial({ color: '#376079', transparent: true, opacity: 0.16 }),
    ),
  )
  return group
}

export function disposeObject(object: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  object.traverse((child) => {
    if (
      child instanceof THREE.Mesh ||
      child instanceof THREE.Points ||
      child instanceof THREE.Line
    ) {
      geometries.add(child.geometry)
      const list = Array.isArray(child.material) ? child.material : [child.material]
      list.forEach((material) => materials.add(material))
    }
  })
  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((material) => material.dispose())
}
