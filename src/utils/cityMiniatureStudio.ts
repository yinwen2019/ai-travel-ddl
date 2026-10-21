import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export const MINIATURE_TILT = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.52, -0.52, 0))

const COLORS = {
  ivory: '#f2e5ce',
  stone: '#c7b599',
  clay: '#ab7058',
  roof: '#686561',
  glass: '#528b94',
  lightGlass: '#a3c9c2',
  water: '#709fa8',
  deepWater: '#507e89',
  leaf: '#78977a',
  lightLeaf: '#a3b083',
  brass: '#c5a15f',
  warm: '#f4dca6',
}
type Finish = keyof typeof COLORS

/** Shared clay geometry, merged by finish to keep each miniature inexpensive to draw. */
export class Studio {
  readonly root = new THREE.Group()
  private materials = new Map<Finish, THREE.MeshStandardMaterial>()

  mesh(geometry: THREE.BufferGeometry, finish: Finish, x = 0, y = 0, z = 0) {
    let material = this.materials.get(finish)
    if (!material) {
      material = new THREE.MeshStandardMaterial({
        color: COLORS[finish],
        roughness: 0.86,
        metalness: 0,
        transparent: true,
        opacity: 1,
      })
      this.materials.set(finish, material)
    }
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(x, y, z)
    this.root.add(mesh)
    return mesh
  }

  box(w: number, h: number, d: number, finish: Finish, x = 0, y = 0, z = 0, bevel = 0.06) {
    return this.mesh(
      bevel
        ? new RoundedBoxGeometry(w, h, d, 1, Math.min(bevel, w / 4, h / 4, d / 4))
        : new THREE.BoxGeometry(w, h, d),
      finish,
      x,
      y,
      z,
    )
  }

  cylinder(
    top: number,
    bottom: number,
    h: number,
    finish: Finish,
    x = 0,
    y = 0,
    z = 0,
    sides = 16,
  ) {
    return this.mesh(new THREE.CylinderGeometry(top, bottom, h, sides), finish, x, y, z)
  }

  beam(a: number[], b: number[], width: number, finish: Finish) {
    const start = new THREE.Vector3(...a)
    const end = new THREE.Vector3(...b)
    const delta = end.clone().sub(start)
    const mesh = this.cylinder(width, width, delta.length(), finish)
    mesh.position.copy(start).add(end).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize())
  }

  lathe(profile: [number, number][], finish: Finish, x = 0, y = 0, z = 0, sides = 16) {
    return this.mesh(
      new THREE.LatheGeometry(
        profile.map(([r, h]) => new THREE.Vector2(r, h)),
        sides,
      ),
      finish,
      x,
      y,
      z,
    )
  }

  curve(points: number[][], radius: number, finish: Finish) {
    const path = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)))
    return this.mesh(new THREE.TubeGeometry(path, 24, radius, 6, false), finish)
  }

  windows(x: number, z: number, width: number, rows: number, columns = 3, bottom = 0.9) {
    for (let row = 0; row < rows; row++)
      for (let column = 0; column < columns; column++)
        this.box(
          0.16,
          0.25,
          0.025,
          'glass',
          x + (column - (columns - 1) / 2) * (width / (columns + 1)),
          bottom + row * 0.6,
          z,
          0,
        )
  }

  tree(x: number, z: number, h = 1.6, pine = false) {
    this.cylinder(0.08, 0.1, h * 0.6, 'clay', x, h * 0.3 + 0.4, z, 6)
    if (pine) {
      for (let i = 0; i < 3; i++)
        this.mesh(
          new THREE.ConeGeometry(0.63 - i * 0.13, h * 0.65, 7),
          'leaf',
          x,
          0.9 + i * 0.45,
          z,
        )
    } else {
      this.mesh(new THREE.IcosahedronGeometry(h * 0.4, 1), 'leaf', x, h + 0.4, z)
      this.mesh(new THREE.IcosahedronGeometry(h * 0.25, 0), 'lightLeaf', x + 0.3, h + 0.7, z + 0.12)
    }
  }

  base(w = 14.5, d = 9) {
    this.box(w, 0.5, d, 'stone', 0, 0, 0, 0.2)
    this.box(w - 0.25, 0.18, d - 0.25, 'ivory', 0, 0.32, 0, 0.08)
  }

  finish() {
    this.root.updateMatrixWorld(true)
    const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>()
    this.root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      const material = object.material as THREE.Material
      const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld)
      // 不同基础几何体统一为无索引三角面，保留法线、UV 后按材质合批。
      const plain = geometry.index ? geometry.toNonIndexed() : geometry
      if (plain !== geometry) geometry.dispose()
      const bucket = buckets.get(material) ?? []
      bucket.push(plain)
      buckets.set(material, bucket)
      object.geometry.dispose()
    })
    const result = new THREE.Group()
    buckets.forEach((geometries, material) => {
      const merged = mergeGeometries(geometries, false)
      if (merged) result.add(new THREE.Mesh(merged, material))
      geometries.forEach((geometry) => geometry.dispose())
    })
    // 归一化投影包围盒，远近两档都按屏幕像素预算摆放，不改变城市统计点大小。
    const box = new THREE.Box3().setFromObject(result)
    const center = box.getCenter(new THREE.Vector3())
    result.position.copy(center).negate()
    const projected = new THREE.Box3()
    for (const x of [box.min.x, box.max.x])
      for (const y of [box.min.y, box.max.y])
        for (const z of [box.min.z, box.max.z])
          projected.expandByPoint(
            new THREE.Vector3(x, y, z).sub(center).applyQuaternion(MINIATURE_TILT),
          )
    const size = projected.getSize(new THREE.Vector3())
    const wrapper = new THREE.Group()
    wrapper.add(result)
    wrapper.scale.setScalar(1 / Math.max(size.x, size.y))
    return wrapper
  }
}
