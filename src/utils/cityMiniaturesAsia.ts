import * as THREE from 'three'
import { Studio } from './cityMiniatureStudio'

function marinaBay(s: Studio, x: number, z: number) {
  for (const dx of [-1.9, 0, 1.9]) {
    s.box(1.35, 5.6, 1.6, 'ivory', x + dx, 3.25, z)
    s.box(0.95, 5.1, 0.04, 'glass', x + dx, 3.3, z + 0.83, 0)
    for (let i = 0; i < 8; i++)
      s.box(1.2, 0.035, 0.04, 'lightGlass', x + dx, 1 + i * 0.6, z + 0.86, 0)
  }
  const ship = s.mesh(new THREE.CapsuleGeometry(0.58, 5.5, 3, 12), 'stone', x, 6.3, z)
  ship.rotation.z = Math.PI / 2
  ship.scale.z = 1.25
  s.box(5, 0.08, 0.75, 'water', x - 0.2, 6.9, z)
  for (const dx of [-2.4, 2.4])
    s.mesh(new THREE.IcosahedronGeometry(0.25, 0), 'leaf', x + dx, 6.95, z - 0.45)
}

function merlion(s: Studio, x: number, z: number) {
  s.cylinder(0.7, 0.95, 0.3, 'stone', x, 0.65, z)
  s.lathe(
    [
      [0.65, 0],
      [0.5, 0.6],
      [0.33, 1.4],
      [0.45, 1.8],
      [0, 1.9],
    ],
    'ivory',
    x,
    0.8,
    z,
  )
  s.mesh(new THREE.IcosahedronGeometry(0.67, 1), 'stone', x, 2.75, z)
  s.mesh(new THREE.IcosahedronGeometry(0.52, 1), 'ivory', x, 2.78, z + 0.26)
  s.box(0.45, 0.23, 0.43, 'ivory', x, 2.65, z + 0.72)
  for (const dx of [-0.25, 0.25]) {
    s.mesh(new THREE.ConeGeometry(0.2, 0.4, 5), 'ivory', x + dx, 3.22, z + 0.08)
    s.mesh(new THREE.SphereGeometry(0.055, 6, 4), 'roof', x + dx * 0.65, 2.92, z + 0.72)
  }
  s.curve(
    [
      [x, 2.65, z + 0.95],
      [x, 2.5, z + 1.4],
      [x, 1.9, z + 1.8],
      [x, 0.6, z + 2.1],
    ],
    0.055,
    'lightGlass',
  )
}

export function singapore(s: Studio, detailed: boolean) {
  if (!detailed) {
    s.base(7.8, 4)
    marinaBay(s, 0, 0)
    return
  }
  s.base()
  s.box(14, 0.1, 3, 'water', 0, 0.45, 2.6)
  marinaBay(s, -2.4, -2.2)
  merlion(s, -4.5, 1.2)
  s.cylinder(0.9, 0.65, 0.8, 'stone', 3.5, 0.9, 1.4)
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4
    const petal = s.mesh(
      new THREE.SphereGeometry(0.8, 10, 8),
      'ivory',
      3.5 + Math.cos(angle) * 0.9,
      1.9,
      1.4 + Math.sin(angle) * 0.9,
    )
    petal.scale.set(0.5, 1.45, 0.75)
    petal.rotation.set(Math.sin(angle) * 0.65, 0, -Math.cos(angle) * 0.65)
  }
  for (const [x, z, h] of [
    [3.5, -2.4, 3.6],
    [5.5, -0.9, 2.7],
  ]) {
    s.cylinder(0.14, 0.25, h, 'clay', x, 0.45 + h / 2, z, 8)
    s.cylinder(1.05, 0.22, 0.85, 'leaf', x, h + 0.25, z, 10)
    s.mesh(new THREE.TorusGeometry(1.05, 0.04, 5, 12), 'brass', x, h + 0.7, z).rotation.x =
      Math.PI / 2
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      s.beam([x, h - 0.2, z], [x + Math.cos(angle), h + 0.72, z + Math.sin(angle)], 0.035, 'brass')
    }
  }
  s.tree(0.9, -2.8, 1)
}

function prayerHall(s: Studio, x: number, z: number) {
  for (let i = 0; i < 3; i++)
    s.cylinder(2.5 - i * 0.25, 2.55 - i * 0.25, 0.2, 'ivory', x, 0.55 + i * 0.2, z, 24)
  s.cylinder(1.6, 1.65, 1.8, 'clay', x, 1.75, z, 16)
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6
    s.cylinder(
      0.07,
      0.07,
      1.8,
      'ivory',
      x + Math.cos(angle) * 1.61,
      1.75,
      z + Math.sin(angle) * 1.61,
      6,
    )
  }
  for (const [r, h] of [
    [2.1, 2.8],
    [1.7, 3.7],
    [1.25, 4.5],
  ]) {
    s.cylinder(r, r, 0.12, 'brass', x, h - 0.32, z, 24)
    s.mesh(new THREE.ConeGeometry(r, 0.95, 24), 'glass', x, h + 0.1, z)
    if (h < 4.5) s.cylinder(r * 0.53, r * 0.6, 0.45, 'clay', x, h + 0.65, z, 16)
  }
  s.cylinder(0.07, 0.14, 0.3, 'brass', x, 5.12, z, 8)
  s.mesh(new THREE.SphereGeometry(0.13, 8, 6), 'brass', x, 5.32, z)
}

function palaceGate(s: Studio, x: number, z: number, korean = false) {
  s.box(5.4, 0.35, 2.3, 'stone', x, 0.62, z)
  s.box(4.6, 1.15, 1.8, korean ? 'ivory' : 'clay', x, 1.3, z)
  for (const dx of [-1.45, 0, 1.45]) s.box(0.65, 0.95, 0.04, 'roof', x + dx, 1.15, z + 0.92)
  s.box(4.7, 0.75, 1.65, 'clay', x, 2.2, z)
  for (const dx of [-1.95, -1.3, -0.65, 0, 0.65, 1.3, 1.95])
    s.box(0.1, 0.85, 0.1, 'ivory', x + dx, 2.2, z + 0.9)
  for (const [y, scale] of [
    [1.9, 1.1],
    [2.9, 0.94],
  ]) {
    const roof = s.mesh(
      new THREE.ConeGeometry(2.65, 0.75, 4),
      korean ? 'roof' : 'brass',
      x,
      y + 0.3,
      z,
    )
    roof.rotation.y = Math.PI / 4
    roof.scale.set(scale * 1.3, 1, scale * 0.6)
    s.box(5.6 * scale, 0.1, 2.2 * scale, korean ? 'leaf' : 'clay', x, y, z)
  }
}

export function beijing(s: Studio, detailed: boolean) {
  if (!detailed) {
    s.base(6, 6)
    prayerHall(s, 0, 0)
    return
  }
  s.base()
  prayerHall(s, -3.7, -0.8)
  palaceGate(s, 2.3, 1.4)
  s.box(2.2, 0.08, 7.8, 'stone', -0.5, 0.46, 0)
  s.beam([3.1, 0.45, -2.7], [2.5, 4.7, -2.7], 0.5, 'glass')
  s.beam([5.1, 0.45, -2.7], [4.8, 3.9, -2.7], 0.5, 'glass')
  s.beam([2.5, 4.7, -2.7], [4.8, 3.9, -2.7], 0.5, 'lightGlass')
  s.box(4.5, 0.09, 1.3, 'water', -3.1, 0.49, 3)
  for (let i = 0; i < 3; i++)
    s.box(1, 0.12, 1.65, 'ivory', -2.6 + i * 0.35, 0.65 + (1 - Math.abs(i - 1)) * 0.15, 3)
  for (const [x, z] of [
    [-6, 2.4],
    [-6, -2.8],
    [0.3, -2.5],
    [5.8, 2.7],
  ])
    s.tree(x, z, 1.3)
}

function seoulTower(s: Studio, x: number, z: number) {
  s.cylinder(0.3, 0.65, 5.4, 'ivory', x, 3.15, z, 16)
  s.cylinder(0.85, 0.65, 0.4, 'glass', x, 5.85, z, 20)
  s.cylinder(0.95, 0.95, 0.16, 'ivory', x, 6.1, z, 20)
  s.cylinder(0.65, 0.85, 0.4, 'stone', x, 6.38, z, 20)
  s.cylinder(0.06, 0.15, 1.8, 'clay', x, 7.4, z, 8)
  for (const y of [6.7, 7, 7.3]) s.cylinder(0.16, 0.16, 0.08, 'ivory', x, y, z, 8)
}

export function seoul(s: Studio, detailed: boolean) {
  if (!detailed) {
    s.base(4.5, 4.5)
    seoulTower(s, 0, 0)
    return
  }
  s.base()
  s.mesh(new THREE.SphereGeometry(1.7, 12, 8), 'leaf', -3.8, 0.1, -1.6).scale.y = 0.45
  seoulTower(s, -3.8, -1.6)
  palaceGate(s, -0.9, 1.4, true)
  s.lathe(
    [
      [1.05, 0],
      [1, 1.4],
      [0.8, 3.8],
      [0.5, 5.6],
      [0.08, 6.9],
    ],
    'lightGlass',
    4.3,
    0.45,
    -2,
    12,
  )
  for (const dx of [-0.18, 0.18])
    s.beam([4.3 + dx * 4, 0.6, -1.45], [4.3 + dx, 6.5, -1.85], 0.04, 'ivory')
  s.box(14, 0.08, 1.25, 'water', 0, 0.45, 3.5)
  s.box(1.5, 0.18, 1.6, 'stone', 3.7, 0.65, 3.5)
  for (const [x, z] of [
    [-5.8, 1.7],
    [-5.5, 2.9],
    [5.8, 0.4],
    [5.7, 1.6],
  ])
    s.tree(x, z, 1.2)
}

function stPauls(s: Studio, x: number, z: number) {
  const shape = new THREE.Shape()
  shape.moveTo(-2.8, 0)
  shape.lineTo(2.8, 0)
  shape.lineTo(2.8, 2.5)
  shape.quadraticCurveTo(2.2, 2.55, 2, 3.7)
  shape.lineTo(1.35, 3.7)
  shape.lineTo(1.35, 4.4)
  shape.lineTo(0, 5.3)
  shape.lineTo(-1.35, 4.4)
  shape.lineTo(-1.35, 3.7)
  shape.lineTo(-2, 3.7)
  shape.quadraticCurveTo(-2.2, 2.55, -2.8, 2.5)
  shape.closePath()
  for (const dx of [-1.65, 0, 1.65]) {
    const door = new THREE.Path()
    door.moveTo(dx - 0.36, 0.05)
    door.lineTo(dx - 0.36, 1.2)
    door.absarc(dx, 1.2, 0.36, Math.PI, 0, true)
    door.lineTo(dx + 0.36, 0.05)
    door.closePath()
    shape.holes.push(door)
  }
  const window = new THREE.Path()
  window.absarc(0, 3.25, 0.38, 0, Math.PI * 2, true)
  shape.holes.push(window)
  s.mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.32, bevelEnabled: false, curveSegments: 10 }),
    'stone',
    x,
    0.7,
    z,
  )
  for (const [y, w] of [
    [0.8, 5.8],
    [2.7, 5.8],
    [4.4, 3],
  ])
    s.box(w, 0.16, 0.5, 'ivory', x, y, z + 0.18)
  for (const dx of [-2.45, -0.85, 0.85, 2.45]) s.box(0.13, 2.9, 0.12, 'ivory', x + dx, 2.2, z + 0.4)
  s.box(0.12, 0.7, 0.14, 'ivory', x, 6.1, z + 0.15)
  s.box(0.5, 0.12, 0.14, 'ivory', x, 6.2, z + 0.15)
  for (let i = 0; i < 4; i++) s.box(6, 0.15, 0.35, 'ivory', x, 0.45 + i * 0.12, z + 1.55 - i * 0.35)
}

export function macao(s: Studio, detailed: boolean) {
  if (!detailed) {
    s.base(7, 4)
    stPauls(s, 0, -0.5)
    return
  }
  s.base()
  stPauls(s, -3.4, -1.7)
  s.mesh(new THREE.SphereGeometry(1.15, 12, 8), 'brass', 3, 1.1, -1.8).scale.y = 0.65
  s.lathe(
    [
      [0.35, 0],
      [0.32, 0.7],
      [0.7, 1.8],
      [1.35, 3.6],
      [1.15, 4.6],
      [0.6, 5.4],
      [0.08, 6.3],
    ],
    'brass',
    3,
    0.7,
    -1.8,
    10,
  )
  for (const angle of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2])
    s.curve(
      [
        [3 + Math.cos(angle) * 0.35, 1.3, -1.8 + Math.sin(angle) * 0.35],
        [3 + Math.cos(angle) * 1.4, 4.3, -1.8 + Math.sin(angle) * 1.4],
        [3, 7, -1.8],
      ],
      0.035,
      'ivory',
    )
  s.cylinder(0.38, 0.6, 2.7, 'ivory', 4.7, 1.85, 1.7, 16)
  s.cylinder(0.6, 0.6, 0.2, 'brass', 4.7, 3.3, 1.7, 16)
  s.cylinder(0.4, 0.4, 0.55, 'glass', 4.7, 3.65, 1.7, 12)
  s.mesh(new THREE.ConeGeometry(0.62, 0.55, 12), 'clay', 4.7, 4.15, 1.7)
  for (let i = 0; i < 3; i++) {
    const x = -5.4 + i * 1.7
    s.box(1.4, 1.65, 1.15, i === 1 ? 'clay' : 'ivory', x, 1.25, 2)
    s.box(1.6, 0.18, 1.35, 'roof', x, 2.2, 2)
    s.windows(x, 2.6, 1.4, 2, 2)
  }
  for (const z of [3, 3.6])
    s.curve(
      [
        [-6.5, 0.5, z],
        [-3.5, 0.5, z - 0.2],
        [0, 0.5, z + 0.1],
        [2.7, 0.5, z],
      ],
      0.06,
      'roof',
    )
  s.tree(0.6, 0.2, 1)
  s.tree(5.9, -2.8, 1.3)
}
