import { ref, onMounted, onUnmounted } from 'vue'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide'

const BP_TABLET = 768
const BP_DESKTOP = 1024
const BP_WIDE = 1280

function calcBreakpoint(width: number): Breakpoint {
  if (width >= BP_WIDE) return 'wide'
  if (width >= BP_DESKTOP) return 'desktop'
  if (width >= BP_TABLET) return 'tablet'
  return 'mobile'
}

export function useBreakpoint() {
  const breakpoint = ref<Breakpoint>(calcBreakpoint(window.innerWidth))

  let timer: ReturnType<typeof setTimeout> | null = null

  function onResize() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      breakpoint.value = calcBreakpoint(window.innerWidth)
    }, 100)
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
    if (timer) clearTimeout(timer)
  })

  const isMobile = () => breakpoint.value === 'mobile'
  const isTablet = () => breakpoint.value === 'tablet'
  const isDesktop = () => breakpoint.value === 'desktop' || breakpoint.value === 'wide'

  return { breakpoint, isMobile, isTablet, isDesktop }
}
