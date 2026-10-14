import * as THREE from 'three'
import type { LandmarkKind } from '@/types/globe'

/** Creates an original, low-poly city miniature. Local +Y points upwards. */
export function createLandmark(kind: LandmarkKind): THREE.Group {
  const group = new THREE.Group()
  const cream = new THREE.MeshStandardMaterial({ color: '#e9e4ce', roughness: 0.88 })
  const teal = new THREE.MeshStandardMaterial({ color: '#75c8c1', roughness: 0.7 })
  const clay = new THREE.MeshStandardMaterial({ color: '#e6ab78', roughness: 0.85 })
  const blue = new THREE.MeshStandardMaterial({ color: '#52869c', roughness: 0.65 })
  function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0) {
    const item = new THREE.Mesh(geometry, material)
    item.position.set(x, y, z)
    group.add(item)
    return item
  }
  function beam(from: THREE.Vector3, to: THREE.Vector3, width: number) {
    const delta = to.clone().sub(from)
    const item = mesh(new THREE.CylinderGeometry(width, width, delta.length(), 6), clay)
    item.position.copy(from).add(to).multiplyScalar(0.5)
    item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize())
  }
  mesh(new THREE.CylinderGeometry(2.8, 3.1, 0.45, 24), blue, 0, 0.2)
  if (kind === 'eiffel') {
    for (const x of [-1, 1]) {
      for (const z of [-1, 1]) {
        beam(new THREE.Vector3(x * 1.9, 0.4, z * 1.9), new THREE.Vector3(x * 0.6, 5, z * 0.6), 0.21)
        beam(new THREE.Vector3(x * 0.6, 5, z * 0.6), new THREE.Vector3(0, 9.5, 0), 0.14)
      }
    }
    mesh(new THREE.BoxGeometry(3.1, 0.3, 3.1), cream, 0, 3)
    mesh(new THREE.BoxGeometry(1.9, 0.28, 1.9), cream, 0, 5)
    mesh(new THREE.CylinderGeometry(0.09, 0.15, 1.3, 6), cream, 0, 9.5)
  } else if (kind === 'needle') {
    for (const x of [-1, 0, 1]) {
      beam(new THREE.Vector3(x * 1.7, 0.4, 0), new THREE.Vector3(x * 0.35, 6, 0), 0.17)
    }
    mesh(new THREE.CylinderGeometry(1.1, 2.5, 0.8, 24), cream, 0, 6.3)
    mesh(new THREE.CylinderGeometry(2.1, 1.1, 0.55, 24), teal, 0, 7)
    mesh(new THREE.ConeGeometry(1.7, 1, 24), cream, 0, 7.7)
    mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.6, 8), cream, 0, 8.5)
  } else if (kind === 'opera') {
    mesh(new THREE.BoxGeometry(5.5, 0.7, 3.7), clay, 0, 0.7)
    for (let i = 0; i < 3; i++) {
      const sail = new THREE.Shape()
      sail.moveTo(-0.9, 0)
      sail.quadraticCurveTo(-0.8, 2.8 + i * 0.3, 0.2, 3.7 + i * 0.35)
      sail.quadraticCurveTo(0.8, 1.7, 1.7, 0)
      sail.closePath()
      for (const z of [-0.85, 0.85]) {
        const shell = mesh(
          new THREE.ExtrudeGeometry(sail, {
            depth: 0.7,
            bevelEnabled: true,
            bevelSize: 0.1,
            bevelThickness: 0.1,
            bevelSegments: 2,
            steps: 1,
            curveSegments: 12,
          }),
          cream,
          (i - 1) * 1.6,
          1.1,
          z - 0.35,
        )
        shell.rotation.z = -0.18
      }
    }
  } else {
    for (const x of [-1.8, 0, 1.8]) {
      mesh(new THREE.BoxGeometry(1.15, 5.6, 1.4), cream, x, 3.1)
      mesh(new THREE.BoxGeometry(0.7, 4.8, 1.43), blue, x, 3.2)
    }
    const roof = mesh(new THREE.CapsuleGeometry(0.65, 5.2, 3, 10), teal, 0, 6.2)
    roof.rotation.z = Math.PI / 2
  }
  return group
}
