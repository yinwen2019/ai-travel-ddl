import * as THREE from 'three'
import { MINIATURE_TILT } from './cityMiniatures'

const point = new THREE.Vector3()
const right = new THREE.Vector3()
const up = new THREE.Vector3()
const forward = new THREE.Vector3()
const inverse = new THREE.Quaternion()
const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.15, -0.35, 0))

export interface ScreenBounds {
  left: number
  top: number
  right: number
  bottom: number
}

/** Projects cached local bounds, including perspective and camera offset. */
export function landmarkScreenBounds(
  landmark: THREE.Group,
  bounds: THREE.Box3,
  camera: THREE.Camera,
  width: number,
  height: number,
): ScreenBounds {
  landmark.updateWorldMatrix(true, false)
  const result = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z]) {
        point.set(x, y, z).applyMatrix4(landmark.matrixWorld).project(camera)
        const px = ((point.x + 1) * width) / 2
        const py = ((1 - point.y) * height) / 2
        result.left = Math.min(result.left, px)
        result.right = Math.max(result.right, px)
        result.top = Math.min(result.top, py)
        result.bottom = Math.max(result.bottom, py)
      }
  return result
}

/** Keeps neighbouring scenery away from the focused marker and its label. */
export function boundsOverlap(a: ScreenBounds, b: ScreenBounds): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

/** Keeps the miniature left of its city, upright in the current camera view. */
export function placeLandmark(
  root: THREE.Group,
  landmark: THREE.Group,
  camera: THREE.Camera,
  pixelRadius: number,
  unitsPerPixel: number,
  modelScale: number,
  displaySize = 0,
): void {
  root.updateWorldMatrix(true, false)
  right.setFromMatrixColumn(camera.matrixWorld, 0)
  up.setFromMatrixColumn(camera.matrixWorld, 1)
  forward.setFromMatrixColumn(camera.matrixWorld, 2)
  root.getWorldPosition(point)
  point.addScaledVector(
    right,
    -(pixelRadius * 1.22 + (displaySize ? 12 + displaySize / 2 : 26)) * unitsPerPixel,
  )
  point.addScaledVector(up, (displaySize ? 0 : -12) * unitsPerPixel)
  // 预留模型厚度，避免立体屋顶被球面遮去一半。
  point.addScaledVector(forward, (displaySize ? displaySize * 0.8 : 24) * unitsPerPixel)
  landmark.position.copy(root.worldToLocal(point))
  root.getWorldQuaternion(inverse).invert()
  landmark.quaternion
    .copy(inverse)
    .multiply(camera.quaternion)
    .multiply(displaySize ? MINIATURE_TILT : tilt)
  landmark.scale.setScalar((unitsPerPixel * modelScale) / root.scale.x)
}
