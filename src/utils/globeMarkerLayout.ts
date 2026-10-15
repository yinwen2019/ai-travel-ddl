import * as THREE from 'three'

const point = new THREE.Vector3()
const right = new THREE.Vector3()
const up = new THREE.Vector3()
const forward = new THREE.Vector3()
const inverse = new THREE.Quaternion()
const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.15, -0.35, 0))

/** Keeps the miniature left of its city, upright in the current camera view. */
export function placeLandmark(
  root: THREE.Group,
  landmark: THREE.Group,
  camera: THREE.Camera,
  pixelRadius: number,
  unitsPerPixel: number,
  modelScale: number,
): void {
  root.updateWorldMatrix(true, false)
  right.setFromMatrixColumn(camera.matrixWorld, 0)
  up.setFromMatrixColumn(camera.matrixWorld, 1)
  forward.setFromMatrixColumn(camera.matrixWorld, 2)
  root.getWorldPosition(point)
  point.addScaledVector(right, -(pixelRadius * 1.22 + 26) * unitsPerPixel)
  point.addScaledVector(up, -12 * unitsPerPixel)
  // 预留模型厚度，避免立体屋顶被球面遮去一半。
  point.addScaledVector(forward, 24 * unitsPerPixel)
  landmark.position.copy(root.worldToLocal(point))
  root.getWorldQuaternion(inverse).invert()
  landmark.quaternion.copy(inverse).multiply(camera.quaternion).multiply(tilt)
  landmark.scale.setScalar((unitsPerPixel * modelScale) / root.scale.x)
}
