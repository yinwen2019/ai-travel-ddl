import * as THREE from 'three'
import type { LandmarkKind } from '@/types/globe'
import { Studio } from './cityMiniatureStudio'
import { sydney, seattle, sanFrancisco } from './cityMiniaturesPacific'
import { singapore, beijing, seoul, macao } from './cityMiniaturesAsia'

export { MINIATURE_TILT } from './cityMiniatureStudio'

function eiffel(s: Studio, x: number, z: number, height = 8.5) {
  const k = height / 8.5
  const v = (a: number, b: number, c: number) => [x + a * k, 0.43 + b * k, z + c * k]
  for (const a of [-1, 1])
    for (const b of [-1, 1]) {
      s.beam(v(a * 1.6, 0, b * 1.6), v(a * 0.62, 4.4, b * 0.62), 0.13 * k, 'clay')
      s.beam(v(a * 0.62, 4.4, b * 0.62), v(a * 0.12, 7.5, b * 0.12), 0.09 * k, 'clay')
      for (let i = 0; i < 3; i++) {
        const y = i * 1.25
        const w = 1.6 - y * 0.223
        const nextW = w - 0.279
        s.beam(v(-w, y, b * w), v(nextW, y + 1.25, b * nextW), 0.042 * k, 'brass')
        s.beam(v(a * w, y, -w), v(a * nextW, y + 1.25, nextW), 0.042 * k, 'brass')
      }
    }
  s.box(2.65 * k, 0.22 * k, 2.65 * k, 'ivory', x, 3.1 * k + 0.43, z)
  s.box(1.65 * k, 0.22 * k, 1.65 * k, 'clay', x, 4.8 * k + 0.43, z)
  s.cylinder(0.06 * k, 0.12 * k, 1.2 * k, 'brass', x, 8 * k + 0.43, z, 6)
}

function arch(s: Studio, x: number, z: number) {
  const outline = new THREE.Shape()
  outline.moveTo(-1.5, 0)
  outline.lineTo(-0.64, 0)
  outline.lineTo(-0.64, 1.55)
  outline.absarc(0, 1.55, 0.64, Math.PI, 0, true)
  outline.lineTo(0.64, 0)
  outline.lineTo(1.5, 0)
  outline.lineTo(1.5, 3.1)
  outline.lineTo(-1.5, 3.1)
  outline.closePath()
  s.mesh(
    new THREE.ExtrudeGeometry(outline, {
      depth: 1.25,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 1,
      curveSegments: 8,
      steps: 1,
    }),
    'ivory',
    x,
    0.43,
    z - 0.625,
  )
  s.box(3.35, 0.28, 1.65, 'stone', x, 3.18, z)
  s.box(3.15, 0.25, 1.5, 'ivory', x, 3.5, z)
  for (const dx of [-1.1, 1.1]) s.box(0.35, 1.65, 0.09, 'stone', x + dx, 1.5, z + 0.68)
}

function paris(s: Studio, detailed: boolean) {
  if (!detailed) {
    s.base(5, 4.5)
    eiffel(s, 0, 0)
    return
  }
  s.base()
  s.box(14, 0.08, 1.65, 'water', 0, 0.47, 2.7)
  for (let i = 0; i < 4; i++) s.box(1.2, 0.015, 0.04, 'lightGlass', -5 + i * 2.8, 0.52, 2.9)
  eiffel(s, -3.5, -0.6)
  arch(s, 3.8, -1.9)
  const pyramid = s.mesh(new THREE.ConeGeometry(1.65, 2.1, 4), 'lightGlass', 1.3, 1.5, 0.7)
  pyramid.rotation.y = Math.PI / 4
  for (const dx of [-1.17, 1.17])
    for (const dz of [-1.17, 1.17])
      s.beam([1.3 + dx, 0.45, 0.7 + dz], [1.3, 2.55, 0.7], 0.045, 'ivory')
  for (const [x, z, h] of [
    [-0.3, -2.8, 2.4],
    [1.5, -3, 2.8],
    [-5.6, -2.4, 2],
  ]) {
    s.box(1.35, h, 1.25, 'ivory', x, 0.4 + h / 2, z)
    s.cylinder(0.65, 0.92, 0.65, 'roof', x, h + 0.72, z, 4).rotation.y = Math.PI / 4
    for (let j = 0; j < 3; j++)
      for (const dx of [-0.32, 0.32])
        s.box(0.18, 0.25, 0.035, 'glass', x + dx, 0.9 + j * 0.62, z + 0.65, 0)
  }
  s.box(1.1, 0.18, 2.5, 'stone', -1.6, 0.8, 2.6)
  for (const x of [-2.1, -1.1]) s.beam([x, 0.95, 1.45], [x, 0.95, 3.8], 0.035, 'brass')
  for (const [x, z] of [
    [-6, 0.4],
    [-5.6, 1.2],
    [5.7, 0.6],
    [4.6, 1.1],
    [6, -2.5],
  ])
    s.tree(x, z, 1.3)
}

function bankOfChina(s: Studio, x: number, z: number) {
  const levels = [
    [0, 0, 1.35, 7.8],
    [0.66, 0, 0.75, 6.9],
    [0, -0.55, 1.35, 6],
  ]
  for (const [dx, dz, w, h] of levels) s.box(w, h, 1.3, 'glass', x + dx, h / 2 + 0.45, z + dz)
  for (let i = 0; i < 3; i++) {
    const a = [x - 0.64, 0.5 + i * 2.4, z + 0.68]
    const b = [x + 0.64, 2.9 + i * 2.4, z + 0.68]
    s.beam(a, b, 0.055, 'ivory')
    s.beam([b[0], a[1], b[2]], [a[0], b[1], a[2]], 0.055, 'ivory')
  }
  for (const dx of [-0.66, 0.66])
    s.beam([x + dx, 0.45, z + 0.68], [x + dx, 8.25, z + 0.68], 0.055, 'ivory')
  for (const dx of [-0.4, 0.4]) s.cylinder(0.035, 0.035, 1.2, 'ivory', x + dx, 8.7, z, 5)
}

function hongkong(s: Studio, detailed: boolean) {
  if (!detailed) {
    s.base(4, 4)
    bankOfChina(s, 0, 0)
    return
  }
  s.base()
  s.box(14, 0.12, 3.4, 'water', 0, 0.45, 2.55)
  s.box(14, 0.15, 0.45, 'stone', 0, 0.52, 0.7)
  bankOfChina(s, -3.6, -1.7)
  s.box(1.7, 7.3, 1.65, 'lightGlass', 0, 4.1, -2.2)
  for (let i = 0; i < 4; i++) {
    s.box(1.65 - i * 0.3, 0.35, 1.6 - i * 0.3, 'stone', 0, 7.8 + i * 0.28, -2.2)
    const dx = -0.65 + i * 0.43
    s.box(0.06, 6.8, 0.06, 'ivory', dx, 4, -1.35, 0)
  }
  s.box(1.15, 2.6, 1.15, 'clay', 4.4, 1.75, -0.2)
  s.box(1.35, 0.25, 1.35, 'ivory', 4.4, 3.15, -0.2)
  s.box(0.9, 0.85, 0.9, 'clay', 4.4, 3.7, -0.2)
  const clock = s.cylinder(0.3, 0.3, 0.06, 'ivory', 4.4, 3.75, 0.29, 20)
  clock.rotation.x = Math.PI / 2
  s.beam([4.4, 3.75, 0.34], [4.4, 3.96, 0.34], 0.025, 'roof')
  s.beam([4.4, 3.75, 0.34], [4.56, 3.67, 0.34], 0.025, 'roof')
  s.mesh(new THREE.ConeGeometry(0.75, 0.65, 4), 'roof', 4.4, 4.5, -0.2).rotation.y = Math.PI / 4
  s.box(3.6, 0.35, 1.1, 'leaf', -1.9, 0.75, 2.8, 0.15)
  s.box(2.7, 0.55, 0.85, 'ivory', -1.9, 1.17, 2.8)
  s.box(2.9, 0.12, 0.95, 'leaf', -1.9, 1.52, 2.8)
  for (let i = 0; i < 5; i++) s.box(0.3, 0.25, 0.04, 'glass', -2.9 + i * 0.5, 1.2, 3.25, 0)
  s.box(1.65, 0.65, 0.6, 'clay', 1.9, 0.98, 0.1)
  s.box(1.55, 0.22, 0.64, 'ivory', 1.9, 1.08, 0.1)
  for (const x of [1.4, 2.4])
    s.cylinder(0.15, 0.15, 0.7, 'roof', x, 0.64, 0.1, 8).rotation.x = Math.PI / 2
  for (const [x, z, h] of [
    [-5.9, -1.7, 3],
    [2.2, -2.2, 3.6],
    [5.8, -2.6, 2.4],
  ]) {
    s.box(1.1, h, 1.2, 'stone', x, h / 2 + 0.4, z)
    for (let i = 0; i < 4; i++) s.box(1.14, 0.16, 1.24, 'ivory', x, 0.9 + i * 0.6, z)
  }
  s.tree(-5.8, 0.2, 1.1)
  s.tree(6, 0.2, 1.1)
}

function canadaPlace(s: Studio, x: number, z: number) {
  s.box(6.7, 0.5, 2, 'stone', x, 0.65, z)
  s.box(6.3, 0.65, 1.65, 'glass', x, 1.15, z)
  for (let i = 0; i < 5; i++) {
    const sail = new THREE.Shape()
    sail.moveTo(-0.63, 0)
    sail.quadraticCurveTo(-0.32, 1.9, 0.16, 2.25)
    sail.quadraticCurveTo(0.35, 0.6, 0.72, 0)
    sail.closePath()
    s.mesh(
      new THREE.ExtrudeGeometry(sail, {
        depth: 1.55,
        bevelEnabled: false,
        curveSegments: 8,
        steps: 1,
      }),
      'ivory',
      x - 2.55 + i * 1.25,
      1.48,
      z - 0.78,
    )
  }
}

function vancouver(s: Studio, detailed: boolean) {
  if (!detailed) {
    s.base(8, 3.5)
    canadaPlace(s, 0, 0)
    return
  }
  s.base()
  s.box(14, 0.1, 4.4, 'water', 0, 0.44, 1.9)
  s.box(6.7, 0.15, 3.8, 'ivory', -2.7, 0.54, 0.3)
  canadaPlace(s, -2.6, 1)
  s.cylinder(0.3, 0.48, 4.8, 'stone', 1.3, 2.85, -2.3)
  s.cylinder(1.1, 1.35, 0.5, 'glass', 1.3, 5.4, -2.3, 24)
  s.cylinder(1.45, 1.15, 0.28, 'ivory', 1.3, 5.8, -2.3, 24)
  s.cylinder(0.65, 1.4, 0.35, 'stone', 1.3, 6.1, -2.3, 24)
  s.box(3, 0.2, 2.9, 'stone', 4.6, 0.6, 1.5)
  const sphere = new THREE.IcosahedronGeometry(1.2, 1)
  s.mesh(sphere, 'lightGlass', 4.6, 2.05, 1.5)
  const edges = new THREE.EdgesGeometry(sphere)
  const points = edges.getAttribute('position')
  for (let i = 0; i < points.count; i += 2)
    s.beam(
      [points.getX(i) + 4.6, points.getY(i) + 2.05, points.getZ(i) + 1.5],
      [points.getX(i + 1) + 4.6, points.getY(i + 1) + 2.05, points.getZ(i + 1) + 1.5],
      0.025,
      'ivory',
    )
  edges.dispose()
  for (const [x, z] of [
    [-5.8, -2.7],
    [-4.8, -2.5],
    [-3.8, -2.8],
    [3.7, -2.7],
    [5.3, -2.9],
  ])
    s.tree(x, z, 1.7, true)
  for (const [x, h] of [
    [-4, 2.3],
    [-2, 3.1],
    [0, 2.1],
  ]) {
    const peak = s.mesh(new THREE.ConeGeometry(1.8, h, 4), 'leaf', x, h / 2 + 0.4, -3)
    peak.scale.z = 0.3
    const snow = s.mesh(new THREE.ConeGeometry(0.6, h * 0.35, 4), 'ivory', x, h + 0.1, -3)
    snow.scale.z = 0.3
  }
}

export interface CityMiniature {
  root: THREE.Group
  simple: THREE.Group
  detail: THREE.Group
  setDetail: (amount: number, visibility?: number) => void
}

/** Original city compositions; positions illustrate an identity, not street geography. */
export function createCityMiniature(kind: LandmarkKind): CityMiniature | null {
  const builders: Record<LandmarkKind, (studio: Studio, detailed: boolean) => void> = {
    eiffel: paris,
    hongkong,
    vancouver,
    opera: sydney,
    needle: seattle,
    marina: singapore,
    beijing,
    seoul,
    macao,
    sanfrancisco: sanFrancisco,
  }
  const build = builders[kind]
  const a = new Studio()
  build(a, false)
  const b = new Studio()
  build(b, true)
  const simple = a.finish()
  const detail = b.finish()
  const root = new THREE.Group()
  root.add(simple, detail)
  let previous = -1
  let previousVisibility = -1
  const setDetail = (amount: number, visibility = 1) => {
    if (Math.abs(previous - amount) < 0.001 && Math.abs(previousVisibility - visibility) < 0.001)
      return
    previous = amount
    previousVisibility = visibility
    simple.visible = amount < 0.999
    detail.visible = amount > 0.001
    for (const [group, opacity] of [
      [simple, 1 - amount],
      [detail, amount],
    ] as const)
      group.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.material.opacity = opacity * visibility
          object.material.depthWrite = opacity * visibility > 0.99
        }
      })
  }
  setDetail(0)
  return { root, simple, detail, setDetail }
}
