import * as THREE from 'three'
import type { GlobeGeometryData } from '@/types/globe'

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
export function createLandscape(data: GlobeGeometryData): {
  group: THREE.Group
  setTerrain: (enabled: boolean) => void
} {
  const group = new THREE.Group()
  const borderGeometry = new THREE.BufferGeometry()
  borderGeometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3, true))
  borderGeometry.setIndex(new THREE.BufferAttribute(data.borders, 1))
  borderGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1.001)
  const borderMaterial = new THREE.LineBasicMaterial({
    color: '#a4c6ca',
    transparent: true,
    opacity: 0.32,
  })
  const borderLines = new THREE.LineSegments(borderGeometry, borderMaterial)
  borderLines.scale.setScalar(100.12)
  borderLines.raycast = () => {}
  group.add(borderLines)
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
  const gridLines = new THREE.LineSegments(gridGeometry, gridMaterial)
  gridLines.raycast = () => {}
  group.add(gridLines)
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
