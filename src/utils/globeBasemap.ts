import * as THREE from 'three'
import type Globe from 'globe.gl'
import type { GlobeBasemap, GlobeGeometryData } from '@/types/globe'
import { createLandscape } from './globeLandscape'
import terrainUrl from '@/assets/maps/natural-earth-terrain.webp?url'
import mobileTerrainUrl from '@/assets/maps/natural-earth-terrain-mobile.webp?url'

/** Keeps vector geometry resident and loads a local terrain texture on demand. */
export function createBasemap(
  globe: InstanceType<typeof Globe>,
  geometry: GlobeGeometryData,
  compact: boolean,
  signal: AbortSignal,
) {
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
  let texture: THREE.Texture | null = null
  let bitmap: ImageBitmap | null = null
  let pending: Promise<THREE.Texture> | null = null
  let disposed = false
  let revision = 0
  globe.globeMaterial(surface)
  globe.scene().add(landMesh, landscape.group)

  async function loadTerrain(): Promise<THREE.Texture> {
    const response = await fetch(compact ? mobileTerrainUrl : terrainUrl, { signal })
    if (!response.ok) throw new Error('地形底图加载失败')
    const image = await createImageBitmap(await response.blob(), { imageOrientation: 'flipY' })
    if (disposed || signal.aborted) {
      image.close()
      throw new DOMException('场景已关闭', 'AbortError')
    }
    bitmap = image
    texture = new THREE.Texture(image)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.flipY = false
    texture.anisotropy = Math.min(4, globe.renderer().capabilities.getMaxAnisotropy())
    texture.needsUpdate = true
    return texture
  }

  return {
    async setStyle(style: GlobeBasemap) {
      const current = ++revision
      let map: THREE.Texture | null = null
      if (style === 'terrain') {
        pending ??= loadTerrain().catch((error: unknown) => {
          pending = null
          throw error
        })
        map = await pending
      }
      if (disposed || current !== revision) return
      surface.map = map
      surface.color.set(map ? '#ffffff' : '#102c43')
      surface.needsUpdate = true
      landMesh.visible = !map
      landscape.setTerrain(!!map)
    },
    destroy() {
      disposed = true
      revision++
      surface.map = null
      texture?.dispose()
      bitmap?.close()
    },
  }
}
