import Globe from 'globe.gl'
import * as THREE from 'three'
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson'
import type { ConferenceGlobe, ConferenceGlobeOptions } from '@/types/globe'
import type { CityData, CityKey } from '@/types/worldView'
import { CATEGORY_COLORS } from '@/constants'
import { GLOBE_LANDMARKS } from '@/data/globeLandmarks'
import { createLandscape, disposeObject } from './globeLandscape'
import { createLandmark } from './globeLandmarks'
import worldLandUrl from '@/assets/maps/world-land.geojson?url'

/** Mounts the globe independently of Vue and the conference data pipeline. */
export async function createConferenceGlobe(
  host: HTMLElement,
  options: ConferenceGlobeOptions,
  signal: AbortSignal,
): Promise<ConferenceGlobe> {
  let compact = host.clientWidth < 768
  const response = await fetch(worldLandUrl, { signal })
  if (!response.ok) throw new Error('地球轮廓加载失败')
  const land: FeatureCollection<Polygon | MultiPolygon> = await response.json()
  signal.throwIfAborted()
  const globe = new Globe(host, {
    animateIn: false,
    waitForGlobeReady: false,
    rendererConfig: { antialias: !compact, alpha: true, powerPreference: 'low-power' },
  })
  const radius = globe.getGlobeRadius()
  let destroyed = false
  let visible = true
  let motion = false
  let paused = false
  let landmarksVisible = true
  let highlighted: CityKey | null = null
  let pinned: CityKey | null = null
  let hovered: CityKey | null = null
  let interactionUntil = performance.now() + 3000
  let animationFrame = 0
  let labelLevel = -1
  let cities = options.cities
  const nodes = new Map<
    CityKey,
    {
      root: THREE.Group
      halo: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>
      selection: THREE.Mesh
      pin: THREE.Group
      landmark: THREE.Group | null
    }
  >()
  globe
    .width(host.clientWidth)
    .height(host.clientHeight)
    .backgroundColor('#050e19')
    .globeMaterial(
      new THREE.MeshPhongMaterial({
        color: '#091e30',
        emissive: '#03101d',
        specular: '#28516a',
        shininess: 12,
      }),
    )
    .showAtmosphere(true)
    .atmosphereColor('#58bdca')
    .atmosphereAltitude(0.12)
    .objectLabel(() => '')
    .labelLabel(() => '')
    .objectAltitude(0.005)
    .objectFacesSurface(true)
    .objectsData(cities)
    .objectThreeObject((entry) => {
      const city = entry as CityData
      const root = new THREE.Group()
      const color = city.dotColor === 'history' ? '#9aaeb8' : CATEGORY_COLORS[city.dotColor]
      const size = 0.65 + city.sizeTier * 0.36
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(size, 12, 8),
        new THREE.MeshBasicMaterial({ color }),
      )
      core.scale.z = 0.4
      core.position.z = 0.22
      root.add(core)
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(size * 1.3, size * 1.7, 32),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.38,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      )
      halo.position.z = 0.15
      root.add(halo)
      const selection = new THREE.Mesh(
        new THREE.RingGeometry(size * 2, size * 2.15, 32),
        new THREE.MeshBasicMaterial({ color: '#f2eed8', side: THREE.DoubleSide }),
      )
      selection.position.z = 0.2
      selection.visible = false
      root.add(selection)
      const pin = new THREE.Group()
      const stem = new THREE.Mesh(
        new THREE.ConeGeometry(0.7, 2.6, 12),
        new THREE.MeshStandardMaterial({ color: '#e7bb84', roughness: 0.6 }),
      )
      stem.rotation.x = -Math.PI / 2
      stem.position.z = 2.5
      pin.add(stem)
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(1.25, 16, 12),
        new THREE.MeshStandardMaterial({ color: '#f1c894', roughness: 0.65 }),
      )
      cap.position.z = 4
      pin.add(cap)
      pin.visible = false
      root.add(pin)
      const spec = GLOBE_LANDMARKS.find((item) => item.cityKey === city.cityKey)
      const landmark = spec ? createLandmark(spec.kind) : null
      if (landmark) {
        landmark.rotation.x = Math.PI / 2 - 0.55
        landmark.position.set(5, 1, 0.2)
        landmark.scale.setScalar(0.65)
        landmark.visible = false
        root.add(landmark)
      }
      nodes.set(city.cityKey, { root, halo, selection, pin, landmark })
      return root
    })
    .onObjectClick((entry) => options.onSelect(entry as CityData))
    .onObjectHover((entry) => {
      const city = entry as CityData | null
      hovered = city?.cityKey ?? null
      options.onHover(city)
      updateAppearance(performance.now())
    })
    .labelsData([])
    .labelLat('lat')
    .labelLng('lng')
    .labelText('city')
    .labelSize(0.65)
    .labelDotRadius(0)
    .labelIncludeDot(true)
    .labelDotOrientation('right')
    .labelAltitude(0.018)
    .labelColor(() => '#d9eceb')
    .labelsTransitionDuration(0)
    .onLabelClick((entry) => options.onSelect(entry as CityData))
  const landscape = createLandscape(land, compact)
  globe.scene().add(landscape)
  const sky = new THREE.Group()
  const starPositions: number[] = []
  const starCount = compact ? 180 : 450
  // 确定性星空只作为背景，城市点始终位于球面。
  for (let i = 0; i < starCount; i++) {
    const y = 1 - (2 * (i + 0.5)) / starCount
    const angle = i * 2.399963
    const r = 550 + ((i * 37) % 200)
    starPositions.push(
      Math.sqrt(1 - y * y) * Math.cos(angle) * r,
      y * r,
      Math.sqrt(1 - y * y) * Math.sin(angle) * r,
    )
  }
  const starGeometry = new THREE.BufferGeometry()
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3))
  sky.add(
    new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: '#a6c1d5',
        size: 1.2,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.6,
      }),
    ),
  )
  globe.scene().add(sky)
  globe.lights([new THREE.AmbientLight('#c2e2ef', 2.1), new THREE.DirectionalLight('#f9e0b4', 2.3)])
  const controls = globe.controls()
  controls.enableDamping = true
  controls.dampingFactor = 0.075
  controls.enablePan = false
  controls.enableZoom = true
  controls.minDistance = radius * 1.45
  controls.maxDistance = radius * 4.2
  controls.autoRotateSpeed = 0.28
  const renderer = globe.renderer()
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2))
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  // 双指缩放由 OrbitControls 处理；滚轮留给页面，避免滚动浏览时误放大地球。
  const pageScroll = (event: WheelEvent) => event.stopImmediatePropagation()
  canvas.addEventListener('wheel', pageScroll, true)
  function interact() {
    interactionUntil = performance.now() + 7000
  }
  controls.addEventListener('start', interact)
  controls.addEventListener('end', interact)
  const onLoss = (event: Event) => {
    event.preventDefault()
    options.onError()
  }
  canvas.addEventListener('webglcontextlost', onLoss)
  function refreshLabels() {
    const important = [...cities].sort(
      (a, b) => b.upcomingCount - a.upcomingCount || b.totalCount - a.totalCount,
    )
    const chosen = labelLevel === 1 ? important.slice(0, compact ? 7 : 12) : []
    const selected = cities.find((city) => city.cityKey === pinned)
    if (selected && !chosen.includes(selected)) chosen.push(selected)
    globe.labelsData(chosen)
  }
  function updateAppearance(now: number) {
    if (destroyed) return
    const altitude = globe.pointOfView().altitude
    controls.autoRotate = motion && !paused && !pinned && !hovered && now > interactionUntil
    nodes.forEach((node, key) => {
      const active = key === highlighted || key === pinned || key === hovered
      node.root.scale.setScalar(active ? 1.35 : 1)
      node.selection.visible = active
      node.pin.visible = key === pinned
      const pulse = motion ? (Math.sin(now / 950) + 1) / 2 : 0.35
      node.halo.scale.setScalar(1 + pulse * 0.38)
      node.halo.material.opacity = active ? 0.62 : 0.4 - pulse * 0.2
      if (node.landmark)
        node.landmark.visible = landmarksVisible && (altitude < 1.7 || key === pinned)
    })
    const level = altitude < 1.4 ? 1 : 0
    if (level !== labelLevel) {
      labelLevel = level
      refreshLabels()
    }
  }
  function tick(now: number) {
    updateAppearance(now)
    if (!destroyed && visible && motion) animationFrame = requestAnimationFrame(tick)
  }
  function restart() {
    cancelAnimationFrame(animationFrame)
    updateAppearance(performance.now())
    if (visible && motion && !destroyed) animationFrame = requestAnimationFrame(tick)
  }
  globe.onZoom(() => updateAppearance(performance.now()))
  function goTo(lat: number, lng: number, altitude: number) {
    interact()
    globe.pointOfView(
      { lat, lng, altitude: THREE.MathUtils.clamp(altitude, 0.45, 3.2) },
      motion ? 950 : 0,
    )
  }
  goTo(25, 105, compact ? 2.4 : 1.8)
  return {
    resize(width, height) {
      compact = width < 768
      globe.width(width).height(height)
      globe.globeOffset([!compact && pinned ? -85 : 0, compact && pinned ? -85 : 0])
    },
    setCities(next) {
      nodes.forEach((node) => disposeObject(node.root))
      nodes.clear()
      cities = next
      globe.objectsData(next)
      refreshLabels()
    },
    setActive(nextHighlight, nextPinned) {
      highlighted = nextHighlight
      pinned = nextPinned
      globe.globeOffset([!compact && pinned ? -85 : 0, compact && pinned ? -85 : 0])
      refreshLabels()
      updateAppearance(performance.now())
    },
    setMotion(enabled) {
      motion = enabled
      restart()
    },
    setPaused(value) {
      paused = value
      updateAppearance(performance.now())
    },
    setVisible(value) {
      visible = value
      if (visible) globe.resumeAnimation()
      else globe.pauseAnimation()
      restart()
    },
    setLandmarks(value) {
      landmarksVisible = value
      updateAppearance(performance.now())
    },
    flyToCity(city) {
      goTo(city.lat, city.lng, compact ? 1.8 : 1.15)
    },
    flyToBounds(bounds) {
      const span = Math.max(bounds.maxLat - bounds.minLat, bounds.maxLng - bounds.minLng)
      goTo(
        (bounds.minLat + bounds.maxLat) / 2,
        (bounds.minLng + bounds.maxLng) / 2,
        span > 140 ? 2.6 : Math.max(0.65, span / 65),
      )
    },
    zoom(factor) {
      const view = globe.pointOfView()
      goTo(view.lat, view.lng, view.altitude * factor)
    },
    reset() {
      goTo(25, 105, compact ? 2.4 : 1.8)
    },
    destroy() {
      destroyed = true
      cancelAnimationFrame(animationFrame)
      controls.removeEventListener('start', interact)
      controls.removeEventListener('end', interact)
      canvas.removeEventListener('webglcontextlost', onLoss)
      canvas.removeEventListener('wheel', pageScroll, true)
      globe.pauseAnimation()
      disposeObject(globe.scene())
      globe._destructor()
      host.replaceChildren()
    },
  }
}
