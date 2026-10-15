import Globe from 'globe.gl'
import * as THREE from 'three'
import type { ConferenceGlobe, ConferenceGlobeOptions, GlobeGeometryData } from '@/types/globe'
import type { CityData, CityKey } from '@/types/worldView'
import { CATEGORY_COLORS } from '@/constants'
import { GLOBE_LANDMARKS } from '@/data/globeLandmarks'
import { disposeObject, globeVector } from './globeLandscape'
import { createBasemap } from './globeBasemap'
import {
  MIN_GLOBE_ALTITUDE,
  MAX_GLOBE_ALTITUDE,
  markerPixelRadius,
  nextZoomAltitude,
  worldUnitsPerPixel,
} from './globeProjection'
import { placeLandmark } from './globeMarkerLayout'
import { createLandmark } from './globeLandmarks'
import { GLOBE_THEMES } from './globeTheme'
import { waitForGlobeFrame } from './waitForGlobeFrame'

/** Mounts the globe independently of Vue and the conference data pipeline. */
export async function createConferenceGlobe(
  host: HTMLElement,
  options: ConferenceGlobeOptions,
  signal: AbortSignal,
  geometry: GlobeGeometryData,
): Promise<ConferenceGlobe> {
  let compact = host.clientWidth < 768
  signal.throwIfAborted()
  const globe = new Globe(host, {
    animateIn: false,
    waitForGlobeReady: false,
    rendererConfig: { antialias: !compact, alpha: true, powerPreference: 'low-power' },
  })
  let palette = GLOBE_THEMES[options.theme]
  const radius = globe.getGlobeRadius()
  let destroyed = false
  let visible = true
  let motion = false
  let reducedMotion = options.reducedMotion
  let sceneReady = false
  let zoomFrame = 0
  let zoomTarget: number | null = null
  let zoomTime = 0
  let paused = false
  let landmarksVisible = true
  let highlighted: CityKey | null = null
  let pinned: CityKey | null = null
  let hovered: CityKey | null = null
  let interactionUntil = performance.now() + 3000
  let animationFrame = 0
  let labelLevel = -1
  let labelSignature = ''
  const labelElements = new Map<CityKey, HTMLSpanElement>()
  const cameraPoint = new THREE.Vector3()
  let cities = options.cities
  const nodes = new Map<
    CityKey,
    {
      root: THREE.Group
      applyTheme: () => void
      halo: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>
      selection: THREE.Mesh
      pin: THREE.Group
      landmark: THREE.Group | null
      landmarkScale: number
      baseSize: number
      pixelRadius: number
    }
  >()
  globe
    .width(host.clientWidth)
    .height(host.clientHeight)
    .backgroundColor(palette.background)
    .showAtmosphere(true)
    .globeCurvatureResolution(1.5)
    .atmosphereColor(palette.atmosphere)
    .atmosphereAltitude(palette.atmosphereAltitude)
    .objectLabel(() => '')
    .labelLabel(() => '')
    .objectAltitude(0.0015)
    .objectFacesSurface(true)
    .objectsData(cities)
    .objectThreeObject((entry) => {
      const city = entry as CityData
      const root = new THREE.Group()
      const color = city.dotColor === 'history' ? palette.history : CATEGORY_COLORS[city.dotColor]
      const size = 0.65 + city.sizeTier * 0.36
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(size, 12, 8),
        new THREE.MeshBasicMaterial({ color }),
      )
      core.scale.z = 0.4
      core.position.z = 0.22
      root.add(core)
      // 按主题设置衬边，保证光点在海陆两种底色上都清晰。
      const rim = new THREE.Mesh(
        new THREE.RingGeometry(size * 0.95, size * 1.22, 24),
        new THREE.MeshBasicMaterial({ color: palette.rim, side: THREE.DoubleSide }),
      )
      rim.position.z = 0.23
      root.add(rim)
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
        new THREE.MeshBasicMaterial({ color: palette.selection, side: THREE.DoubleSide }),
      )
      selection.position.z = 0.2
      selection.visible = false
      root.add(selection)
      const pin = new THREE.Group()
      const stem = new THREE.Mesh(
        new THREE.ConeGeometry(0.7, 2.6, 12),
        new THREE.MeshStandardMaterial({ color: palette.pinStem, roughness: 0.6 }),
      )
      stem.rotation.x = -Math.PI / 2
      stem.position.z = 2.5
      pin.add(stem)
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(1.25, 16, 12),
        new THREE.MeshStandardMaterial({ color: palette.pinCap, roughness: 0.65 }),
      )
      cap.position.z = 4
      pin.add(cap)
      pin.visible = false
      root.add(pin)
      const spec = GLOBE_LANDMARKS.find((item) => item.cityKey === city.cityKey)
      const model = spec ? createLandmark(spec.kind) : null
      const landmark = model ? new THREE.Group() : null
      let landmarkScale = 1
      if (landmark && model) {
        const box = new THREE.Box3().setFromObject(model)
        const dimensions = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        model.position.set(-center.x, -box.min.y, -center.z)
        landmarkScale = Math.min(30 / dimensions.y, 32 / Math.max(dimensions.x, dimensions.z))
        landmark.add(model)
        landmark.visible = false
        root.add(landmark)
      }
      nodes.set(city.cityKey, {
        root,
        applyTheme() {
          const color =
            city.dotColor === 'history' ? palette.history : CATEGORY_COLORS[city.dotColor]
          core.material.color.set(color)
          halo.material.color.set(color)
          rim.material.color.set(palette.rim)
          selection.material.color.set(palette.selection)
          stem.material.color.set(palette.pinStem)
          cap.material.color.set(palette.pinCap)
        },
        halo,
        selection,
        pin,
        landmark,
        landmarkScale,
        baseSize: size,
        pixelRadius: markerPixelRadius(city.sizeTier),
      })
      return root
    })
    .onObjectClick((entry) => options.onSelect(entry as CityData))
    .onObjectHover((entry) => {
      const city = entry as CityData | null
      hovered = city?.cityKey ?? null
      options.onHover(city)
      updateAppearance(performance.now())
      refreshLabels()
    })
    .htmlElementsData([])
    .htmlLat('lat')
    .htmlLng('lng')
    .htmlAltitude(0.0015)
    .htmlTransitionDuration(0)
    .htmlElement((entry) => {
      const city = entry as CityData
      const anchor = document.createElement('span')
      anchor.style.width = '1px'
      anchor.style.height = '1px'
      anchor.style.pointerEvents = 'none'
      anchor.setAttribute('aria-hidden', 'true')
      const text = document.createElement('span')
      text.className = 'globe-city-label'
      text.textContent = city.city
      labelElements.set(city.cityKey, text)
      anchor.appendChild(text)
      return anchor
    })
  const basemap = createBasemap(globe, geometry)
  basemap.setTheme(palette)
  const sky = new THREE.Group()
  sky.visible = palette.stars
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
        color: '#aebdaf',
        size: 1.2,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.24,
      }),
    ),
  )
  globe.scene().add(sky)
  globe.lights([new THREE.AmbientLight('#c2e2ef', 2.1), new THREE.DirectionalLight('#f9e0b4', 2.3)])
  const controls = globe.controls()
  controls.enableDamping = true
  controls.dampingFactor = 0.075
  controls.enablePan = false
  // 触控板捏合与鼠标滚轮统一交由 OrbitControls 缩放，避免拦截 Mac 双指手势。
  controls.enableZoom = true
  controls.minDistance = radius * (1 + MIN_GLOBE_ALTITUDE)
  controls.maxDistance = radius * 4.2
  controls.autoRotateSpeed = 0.28
  const renderer = globe.renderer()
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2))
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  function interact() {
    interactionUntil = performance.now() + 7000
  }
  const onControlStart = () => {
    stopZoom()
    interact()
  }
  controls.addEventListener('start', onControlStart)
  controls.addEventListener('end', interact)
  const onLoss = (event: Event) => {
    event.preventDefault()
    options.onError()
  }
  canvas.addEventListener('webglcontextlost', onLoss)
  function refreshLabels() {
    const important = [...cities].sort(
      (a, b) =>
        Number(b.cityKey === pinned) - Number(a.cityKey === pinned) ||
        b.upcomingCount - a.upcomingCount ||
        b.totalCount - a.totalCount,
    )
    const chosen: CityData[] = []
    const rectangles: { left: number; top: number; right: number; bottom: number }[] = []
    const placements = new Map<CityKey, { leftSide: boolean; offset: number }>()
    const camera = globe.camera()
    camera.updateMatrixWorld()
    for (const city of important) {
      if (labelLevel !== 1 && city.cityKey !== pinned) continue
      const position = globeVector(city.lat, city.lng, radius * 1.0015)
      if (position.dot(camera.position) < radius * radius * 1.002) continue
      const point = globe.getScreenCoords(city.lat, city.lng, 0.0015)
      const width = Math.min(150, Math.max(40, city.city.length * 7.2 + 10))
      const active =
        city.cityKey === pinned || city.cityKey === highlighted || city.cityKey === hovered
      const pixelRadius = markerPixelRadius(city.sizeTier) * (active ? 1.35 : 1)
      const offset = Math.max(14, pixelRadius * 1.22 + 8)
      const hasLandmark = !!nodes.get(city.cityKey)?.landmark?.visible
      const leftSide = !hasLandmark && point.x + width + offset > globe.width() - 12
      const left = leftSide ? point.x - width - offset : point.x + offset
      const rect = {
        left: hasLandmark ? point.x - pixelRadius * 1.22 - 46 : left,
        top: point.y - (hasLandmark ? 24 : 10),
        right: left + width,
        bottom: point.y + (hasLandmark ? 16 : 10),
      }
      if (
        rect.left < 8 ||
        rect.right > globe.width() - 8 ||
        rect.top < 8 ||
        rect.bottom > globe.height() - 8
      )
        continue
      if (
        rectangles.some(
          (other) =>
            rect.left < other.right + 8 &&
            rect.right + 8 > other.left &&
            rect.top < other.bottom + 6 &&
            rect.bottom + 6 > other.top,
        )
      )
        continue
      rectangles.push(rect)
      chosen.push(city)
      placements.set(city.cityKey, { leftSide, offset })
      if (chosen.length >= (compact ? 8 : 14)) break
    }
    const signature = chosen.map((city) => city.cityKey).join('|')
    if (signature !== labelSignature) {
      labelSignature = signature
      globe.htmlElementsData(chosen)
    }
    // 元素由图层异步创建；重复利用 DOM 标签，避免缩放时不断重建文字几何体。
    requestAnimationFrame(() => {
      if (destroyed) return
      placements.forEach(({ leftSide, offset }, key) => {
        const label = labelElements.get(key)
        label?.classList.toggle('is-left', leftSide)
        label?.style.setProperty('--city-label-offset', `${offset}px`)
      })
    })
  }
  function updateAppearance(now: number) {
    if (destroyed) return
    const altitude = globe.pointOfView().altitude
    const camera = globe.camera()
    camera.updateMatrixWorld()
    controls.autoRotate = motion && !paused && !pinned && !hovered && now > interactionUntil
    nodes.forEach((node, key) => {
      const active = key === highlighted || key === pinned || key === hovered
      node.root.getWorldPosition(cameraPoint).applyMatrix4(camera.matrixWorldInverse)
      const units = worldUnitsPerPixel(
        -cameraPoint.z,
        camera.projectionMatrix.elements[5],
        globe.height(),
      )
      node.root.scale.setScalar((units * node.pixelRadius * (active ? 1.35 : 1)) / node.baseSize)
      node.selection.visible = active
      node.pin.visible = key === pinned
      const pulse = motion ? (Math.sin(now / 950) + 1) / 2 : 0.35
      node.halo.scale.setScalar(1 + pulse * 0.38)
      node.halo.material.opacity = active ? 0.62 : 0.4 - pulse * 0.2
      if (node.landmark) {
        node.landmark.visible = landmarksVisible && (altitude < 1.7 || key === pinned)
        if (node.landmark.visible)
          placeLandmark(
            node.root,
            node.landmark,
            camera,
            node.pixelRadius * (active ? 1.35 : 1),
            units,
            node.landmarkScale,
          )
      }
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
  globe.onZoom(() => {
    updateAppearance(performance.now())
    refreshLabels()
  })
  function stopZoom() {
    cancelAnimationFrame(zoomFrame)
    zoomFrame = 0
    zoomTarget = null
  }
  function stepZoom(now: number) {
    if (destroyed || zoomTarget === null) return
    const view = globe.pointOfView()
    const next = nextZoomAltitude(view.altitude, zoomTarget, now - zoomTime)
    zoomTime = now
    const done = Math.abs(Math.log(next / zoomTarget)) < 0.0005
    globe.pointOfView({ ...view, altitude: done ? zoomTarget : next }, 0)
    if (done) stopZoom()
    else zoomFrame = requestAnimationFrame(stepZoom)
  }
  function goTo(lat: number, lng: number, altitude: number) {
    stopZoom()
    interact()
    globe.pointOfView(
      {
        lat,
        lng,
        altitude: THREE.MathUtils.clamp(altitude, MIN_GLOBE_ALTITUDE, MAX_GLOBE_ALTITUDE),
      },
      sceneReady && !reducedMotion ? 650 : 0,
    )
  }
  goTo(25, 105, compact ? 2.4 : 1.8)
  return {
    setTheme(theme) {
      if (destroyed) return
      palette = GLOBE_THEMES[theme]
      globe.backgroundColor(palette.background)
      globe.atmosphereColor(palette.atmosphere).atmosphereAltitude(palette.atmosphereAltitude)
      basemap.setTheme(palette)
      sky.visible = palette.stars
      nodes.forEach((node) => node.applyTheme())
    },
    setReducedMotion(value) {
      reducedMotion = value
      if (value) stopZoom()
    },
    async ready() {
      await waitForGlobeFrame(
        () =>
          nodes.size === cities.length && [...nodes.values()].every((node) => !!node.root.parent),
        signal,
      )
      updateAppearance(performance.now())
      await renderer.compileAsync(globe.scene(), globe.camera())
      signal.throwIfAborted()
      const frame = renderer.info.render.frame
      await waitForGlobeFrame(() => renderer.info.render.frame > frame, signal)
      sceneReady = true
    },
    resize(width, height) {
      compact = width < 768
      globe.width(width).height(height)
      globe.globeOffset([!compact && pinned ? -85 : 0, compact && pinned ? -85 : 0])
      updateAppearance(performance.now())
      refreshLabels()
    },
    setCities(next) {
      nodes.forEach((node) => disposeObject(node.root))
      nodes.clear()
      cities = next
      labelSignature = ''
      globe.objectsData(next)
      refreshLabels()
    },
    setActive(nextHighlight, nextPinned) {
      highlighted = nextHighlight
      pinned = nextPinned
      globe.globeOffset([!compact && pinned ? -85 : 0, compact && pinned ? -85 : 0])
      updateAppearance(performance.now())
      refreshLabels()
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
      if (!value) stopZoom()
      visible = value
      if (visible) globe.resumeAnimation()
      else globe.pauseAnimation()
      restart()
    },
    setLandmarks(value) {
      landmarksVisible = value
      updateAppearance(performance.now())
      refreshLabels()
    },
    flyToCity(city) {
      goTo(city.lat, city.lng, 0.08)
    },
    flyToBounds(bounds) {
      const span = Math.max(bounds.maxLat - bounds.minLat, bounds.maxLng - bounds.minLng)
      goTo(
        (bounds.minLat + bounds.maxLat) / 2,
        (bounds.minLng + bounds.maxLng) / 2,
        span > 140 ? 2.6 : Math.max(0.08, span / 65),
      )
    },
    zoom(factor) {
      interact()
      const view = globe.pointOfView()
      const target = THREE.MathUtils.clamp(
        (zoomTarget ?? view.altitude) * factor,
        MIN_GLOBE_ALTITUDE,
        MAX_GLOBE_ALTITUDE,
      )
      if (zoomTarget === null) globe.pointOfView(view, 0)
      if (reducedMotion || !sceneReady) {
        stopZoom()
        globe.pointOfView({ ...view, altitude: target }, 0)
        return
      }
      zoomTarget = target
      if (!zoomFrame) {
        zoomTime = performance.now()
        zoomFrame = requestAnimationFrame(stepZoom)
      }
    },
    reset() {
      goTo(25, 105, compact ? 2.4 : 1.8)
    },
    destroy() {
      stopZoom()
      destroyed = true
      labelElements.clear()
      cancelAnimationFrame(animationFrame)
      controls.removeEventListener('start', onControlStart)
      controls.removeEventListener('end', interact)
      canvas.removeEventListener('webglcontextlost', onLoss)
      globe.pauseAnimation()
      disposeObject(globe.scene())
      globe._destructor()
      host.replaceChildren()
    },
  }
}
