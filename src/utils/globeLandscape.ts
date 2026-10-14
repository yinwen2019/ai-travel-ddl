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

/** Builds local country boundaries and graticules above either basemap. */
export function createLandscape(data: FeatureCollection<Polygon | MultiPolygon>): {
  group: THREE.Group
  setTerrain: (enabled: boolean) => void
} {
  const group = new THREE.Group()
  const borders: number[] = []
  function traceRing(ring: Position[]) {
    ring.forEach(([lng, lat], i) => {
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
              100.12,
            ).toArray(),
          )
        }
      }
    })
  }
  for (const feature of data.features) {
    const polygons =
      feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates
    for (const polygon of polygons) {
      polygon.forEach(traceRing)
    }
  }
  const borderGeometry = new THREE.BufferGeometry()
  borderGeometry.setAttribute('position', new THREE.Float32BufferAttribute(borders, 3))
  const borderMaterial = new THREE.LineBasicMaterial({
    color: '#a4c6ca',
    transparent: true,
    opacity: 0.32,
  })
  group.add(new THREE.LineSegments(borderGeometry, borderMaterial))
  // 经线和纬线与球面保持相同深度关系，背面会被球体遮挡。
  const grid: number[] = []
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lng = -180; lng < 180; lng += 2)
      grid.push(
        ...globeVector(lat, lng, 100.12).toArray(),
        ...globeVector(lat, lng + 2, 100.12).toArray(),
      )
  }
  for (let lng = -180; lng < 180; lng += 30) {
    for (let lat = -90; lat < 90; lat += 2)
      grid.push(
        ...globeVector(lat, lng, 100.12).toArray(),
        ...globeVector(lat + 2, lng, 100.12).toArray(),
      )
  }
  const gridGeometry = new THREE.BufferGeometry()
  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(grid, 3))
  const gridMaterial = new THREE.LineBasicMaterial({
    color: '#789eaf',
    transparent: true,
    opacity: 0.1,
  })
  group.add(new THREE.LineSegments(gridGeometry, gridMaterial))
  return {
    group,
    setTerrain(enabled) {
      borderMaterial.color.set(enabled ? '#405c58' : '#a4c6ca')
      borderMaterial.opacity = enabled ? 0.3 : 0.32
      gridMaterial.color.set(enabled ? '#426d79' : '#789eaf')
      gridMaterial.opacity = enabled ? 0.07 : 0.1
    },
  }
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
