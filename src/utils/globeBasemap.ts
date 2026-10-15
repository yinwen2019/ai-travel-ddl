import * as THREE from 'three'
import type Globe from 'globe.gl'
import type { GlobeGeometryData } from '@/types/globe'
import { createLandscape } from './globeLandscape'

/** Adds the prepared vector land mesh and local map lines. */
export function createBasemap(globe: InstanceType<typeof Globe>, geometry: GlobeGeometryData) {
  const surface = new THREE.MeshBasicMaterial({ color: '#102c43' })
  const continents = new THREE.MeshBasicMaterial({ color: '#54818a' })
  const landscape = createLandscape(geometry)
  const landGeometry = new THREE.BufferGeometry()
  landGeometry.setAttribute('position', new THREE.BufferAttribute(geometry.positions, 3, true))
  landGeometry.setIndex(new THREE.BufferAttribute(geometry.indices, 1))
  landGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1.001)
  const landMesh = new THREE.Mesh(landGeometry, continents)
  landMesh.scale.setScalar(100.1)
  // 底图只用于展示；不对整片大陆进行逐三角形的鼠标命中计算。
  landMesh.raycast = () => {}
  globe.globeMaterial(surface)
  globe.scene().add(landMesh, landscape.group)
}
