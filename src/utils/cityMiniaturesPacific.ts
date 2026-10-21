import * as THREE from 'three'
import { Studio } from './cityMiniatureStudio'

function operaHouse(s: Studio, x: number, z: number) {
  s.box(6.1, 0.45, 3.6, 'stone', x, 0.68, z)
  s.box(5.7, 0.65, 3.1, 'glass', x, 1.05, z)
  for (let i = 0; i < 3; i++) {
    const height = 2.2 + i * 0.48
    const outline = new THREE.Shape()
    outline.moveTo(-0.85, 0)
    outline.quadraticCurveTo(-0.72, height * 0.75, 0.12, height)
    outline.quadraticCurveTo(0.3, height * 0.42, 1.12, 0)
    outline.closePath()
    for (const dz of [-0.8, 0.8]) {
      s.mesh(
        new THREE.ExtrudeGeometry(outline, {
          depth: 0.65,
          bevelEnabled: true,
          bevelSize: 0.045,
          bevelThickness: 0.045,
          bevelSegments: 1,
          curveSegments: 8,
        }),
        'ivory',
        x - 1.8 + i * 1.5,
        1.25,
        z + dz - 0.32,
      )
    }
  }
}

function harbourBridge(s: Studio) {
  s.box(11.7, 0.25, 1.25, 'roof', 0, 1.7, -2.6)
  for (const z of [-3.13, -2.07]) {
    const points = Array.from({ length: 13 }, (_, i) => {
      const x = -5.5 + i * (11 / 12)
      return [x, 1.9 + 2.8 * (1 - (x / 5.5) ** 2), z]
    })
    s.curve(points, 0.12, 'roof')
    for (const [x, y] of points.slice(1, -1)) s.beam([x, 1.82, z], [x, y, z], 0.045, 'stone')
  }
  for (const x of [-4.65, 4.65])
    for (const z of [-3.25, -1.95]) s.box(0.65, 2.6, 0.55, 'stone', x, 1.72, z)
}

export function sydney(s: Studio, detailed: boolean) {
  if (!detailed) {
    s.base(7, 5)
    operaHouse(s, 0, 0)
    return
  }
  s.base()
  s.box(14, 0.1, 8.5, 'water', 0, 0.45, 0)
  harbourBridge(s)
  s.box(7.1, 0.18, 4.5, 'ivory', -2.5, 0.57, 0.8)
  operaHouse(s, -2.5, 1)
  for (let i = 0; i < 3; i++) s.box(4.8, 0.08, 0.18, 'stone', -2.5, 0.73 + i * 0.07, 2.7 + i * 0.18)
  s.cylinder(0.18, 0.23, 4.6, 'stone', 4.4, 2.75, -0.2)
  s.cylinder(0.85, 0.65, 0.45, 'brass', 4.4, 5.2, -0.2)
  s.cylinder(0.035, 0.05, 1.3, 'ivory', 4.4, 6.05, -0.2, 6)
  s.box(1.5, 2.6, 1.25, 'glass', 2.6, 1.85, -0.6)
  s.windows(2.6, 0.04, 1.5, 3)
  s.box(2.6, 0.4, 0.85, 'leaf', 2, 0.8, 2.9)
  s.box(1.8, 0.45, 0.7, 'ivory', 2, 1.15, 2.9)
  s.box(2, 0.12, 0.8, 'brass', 2, 1.44, 2.9)
  s.windows(2, 3.27, 1.8, 1, 4, 1.15)
  for (const [x, z] of [
    [5.6, 1.4],
    [5.8, 2.7],
    [3.8, 1.5],
  ])
    s.tree(x, z, 1.1)
}

function spaceNeedle(s: Studio, x: number, z: number) {
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3
    const point = (r: number, h: number) => [x + Math.cos(angle) * r, h, z + Math.sin(angle) * r]
    s.beam(point(1.25, 0.45), point(0.35, 3.5), 0.14, 'ivory')
    s.beam(point(0.35, 3.5), point(0.7, 6.1), 0.12, 'ivory')
  }
  s.cylinder(0.17, 0.23, 5.7, 'stone', x, 3.3, z)
  s.cylinder(1.15, 0.65, 0.35, 'ivory', x, 6.15, z, 24)
  s.cylinder(1.55, 1.2, 0.42, 'glass', x, 6.5, z, 24)
  s.cylinder(1.75, 1.55, 0.18, 'ivory', x, 6.8, z, 24)
  s.mesh(new THREE.ConeGeometry(1.65, 0.65, 24), 'stone', x, 7.15, z)
  s.cylinder(0.045, 0.085, 1.3, 'ivory', x, 7.95, z, 6)
}

export function seattle(s: Studio, detailed: boolean) {
  if (!detailed) {
    s.base(4.5, 4.5)
    spaceNeedle(s, 0, 0)
    return
  }
  s.base()
  s.box(14, 0.1, 2.3, 'water', 0, 0.45, 3)
  spaceNeedle(s, -3.6, -1.6)
  const cx = 3.6,
    cy = 3,
    cz = 1.1
  for (const z of [cz - 0.16, cz + 0.16])
    s.mesh(new THREE.TorusGeometry(2, 0.07, 6, 32), 'ivory', cx, cy, z)
  s.beam([cx - 0.95, 0.5, cz + 0.6], [cx, cy, cz], 0.1, 'stone')
  s.beam([cx + 0.95, 0.5, cz + 0.6], [cx, cy, cz], 0.1, 'stone')
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6
    const x = cx + Math.cos(angle) * 2,
      y = cy + Math.sin(angle) * 2
    s.beam([cx, cy, cz], [x, y, cz], 0.027, 'ivory')
    s.box(0.3, 0.4, 0.4, 'glass', x, y - 0.14, cz)
  }
  for (let i = 0; i < 3; i++) {
    const x = -4.8 + i * 1.7
    s.box(1.6, 1.55, 1.45, i === 1 ? 'clay' : 'ivory', x, 1.23, 1.2)
    s.box(1.7, 0.18, 1.6, 'roof', x, 2.1, 1.2)
    s.box(1.6, 0.2, 0.45, 'clay', x, 1.55, 2.02)
    s.windows(x, 1.95, 1.6, 1, 3, 1.1)
  }
  s.box(1.6, 4.2, 1.5, 'glass', 1.2, 2.55, -2.4)
  s.box(1.3, 3.2, 1.4, 'stone', 3.2, 2.05, -2.4)
  for (const [x, z] of [
    [-6, -2.5],
    [-1.1, -2.7],
    [5.7, -2.7],
    [5.9, 2.6],
  ])
    s.tree(x, z, 1.6, true)
}

function goldenGate(s: Studio, x = 0, z = 0, scale = 1) {
  const point = (px: number, py: number, pz = 0): [number, number, number] => [
    x + px * scale,
    0.45 + py * scale,
    z + pz * scale,
  ]
  s.box(12 * scale, 0.23 * scale, 1.35 * scale, 'clay', x, 1.75 * scale + 0.45, z)
  for (const dx of [-3.4, 3.4]) {
    for (const dz of [-0.52, 0.52])
      s.box(0.35 * scale, 5.8 * scale, 0.35 * scale, 'clay', ...point(dx, 2.9, dz))
    for (const h of [2.7, 4.4, 5.5])
      s.box(0.35 * scale, 0.22 * scale, 1.4 * scale, 'clay', ...point(dx, h))
  }
  for (const dz of [-0.55, 0.55]) {
    const points = Array.from({ length: 17 }, (_, i) => {
      const px = -3.4 + i * (6.8 / 16)
      return point(px, 2.2 + 3.5 * (px / 3.4) ** 2, dz)
    })
    s.curve(points, 0.055 * scale, 'clay')
    for (let i = 1; i < points.length - 1; i += 2) {
      const [px, py, pz] = points[i]
      s.beam([px, 2.25 * scale + 0.45, pz], [px, py, pz], 0.025 * scale, 'ivory')
    }
    s.beam(point(-6, 1.8, dz), point(-3.4, 5.7, dz), 0.055 * scale, 'clay')
    s.beam(point(3.4, 5.7, dz), point(6, 1.8, dz), 0.055 * scale, 'clay')
  }
}

export function sanFrancisco(s: Studio, detailed: boolean) {
  if (!detailed) {
    s.base(13, 3)
    goldenGate(s)
    return
  }
  s.base()
  s.box(14, 0.1, 4, 'water', 0, 0.45, -2.1)
  goldenGate(s, -1.1, -2, 0.85)
  const pyramid = s.mesh(new THREE.ConeGeometry(1.1, 5.2, 4), 'ivory', 3.2, 3.05, 0.6)
  pyramid.rotation.y = Math.PI / 4
  for (let i = 0; i < 7; i++)
    s.box(1.4 * (1 - i / 8), 0.05, 0.04, 'stone', 3.2, 0.9 + i * 0.58, 1.32 - i * 0.08, 0)
  s.cylinder(0.45, 0.52, 2.9, 'ivory', 5.4, 1.95, 1.7, 12)
  s.cylinder(0.62, 0.6, 0.45, 'stone', 5.4, 3.62, 1.7, 12)
  for (let i = 0; i < 3; i++) {
    const x = -5.4 + i * 1.65
    const h = 1.7 + i * 0.18
    s.box(1.35, h, 1.35, i === 1 ? 'clay' : 'lightGlass', x, 0.5 + h / 2, 1.5)
    s.mesh(new THREE.ConeGeometry(1.05, 0.8, 4), 'roof', x, h + 0.85, 1.5).rotation.y = Math.PI / 4
    s.windows(x, 2.19, 1.35, 2, 2)
  }
  s.box(2.3, 0.65, 0.8, 'clay', 0, 0.92, 3.1)
  s.box(2.4, 0.12, 0.9, 'ivory', 0, 1.38, 3.1)
  s.windows(0, 3.52, 2.3, 1, 4, 1.02)
  for (const x of [-0.7, 0.7])
    s.cylinder(0.18, 0.18, 0.9, 'roof', x, 0.62, 3.1, 8).rotation.x = Math.PI / 2
  s.tree(-6.1, -0.3, 1.1)
  s.tree(6, -1, 1.1)
}
