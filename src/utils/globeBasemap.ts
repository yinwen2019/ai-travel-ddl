import * as THREE from 'three'
import type Globe from 'globe.gl'
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson'
import type { GlobeBasemap } from '@/types/globe'
import { createLandscape } from './globeLandscape'
import terrainUrl from '@/assets/maps/natural-earth-terrain.webp?url'
import mobileTerrainUrl from '@/assets/maps/natural-earth-terrain-mobile.webp?url'

/** Keeps vector geometry resident and loads a local terrain texture on demand. */
export function createBasemap(
  globe: InstanceType<typeof Globe>,
  land: FeatureCollection<Polygon | MultiPolygon>,
  compact: boolean,
  signal: AbortSignal,
) {
  const surface = new THREE.MeshBasicMaterial({ color: '#102c43' })
  const continents = new THREE.MeshBasicMaterial({ color: '#54818a' })
  const landscape = createLandscape(land)
  let texture: THREE.Texture | null = null
  let bitmap: ImageBitmap | null = null
  let pending: Promise<THREE.Texture> | null = null
  let disposed = false
  let revision = 0
  globe
    .globeMaterial(surface)
    .polygonsData(land.features)
    .polygonAltitude(0.001)
    .polygonCapCurvatureResolution(1)
    .polygonCapMaterial(continents)
    .polygonSideColor(() => '#00000000')
    .polygonsTransitionDuration(0)
  globe.scene().add(landscape.group)

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
      continents.visible = !map
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
