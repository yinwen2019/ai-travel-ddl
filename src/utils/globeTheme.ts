import type { GlobeTheme } from '@/types/globe'

export interface GlobePalette {
  background: string
  ocean: string
  land: string
  border: string
  borderOpacity: number
  grid: string
  gridOpacity: number
  atmosphere: string
  atmosphereAltitude: number
  history: string
  rim: string
  selection: string
  pinStem: string
  pinCap: string
  stars: boolean
  css: Record<`--${string}`, string>
}

// 浮层直接继承全站语义色，避免地图控件在后续品牌调色时再次脱节。
const interfaceColors = {
  '--globe-background': 'var(--color-canvas)',
  '--globe-ink': 'var(--color-text-primary)',
  '--globe-muted': 'var(--color-text-secondary)',
  '--globe-line': 'var(--color-border)',
  '--globe-panel': 'var(--color-surface)',
  '--globe-hover': 'var(--color-surface-hover)',
  '--globe-accent': 'var(--color-brand)',
} satisfies Record<`--${string}`, string>

/** Shared scene and interface colors for the site's two themes. */
export const GLOBE_THEMES: Record<GlobeTheme, GlobePalette> = {
  light: {
    background: '#f1f5f6',
    ocean: '#dce8eb',
    land: '#9ebbc4',
    border: '#526b78',
    borderOpacity: 0.38,
    grid: '#b0c7cf',
    gridOpacity: 0.18,
    atmosphere: '#dce8ed',
    atmosphereAltitude: 0.06,
    history: '#385867',
    rim: '#fcfefe',
    selection: '#295b73',
    pinStem: '#295b73',
    pinCap: '#527f92',
    stars: false,
    css: {
      ...interfaceColors,
      '--globe-history': '#385867',
      '--globe-scheme': 'light',
    },
  },
  dark: {
    background: '#111e26',
    ocean: '#1d3542',
    land: '#537985',
    border: '#a9bdc7',
    borderOpacity: 0.32,
    grid: '#6d919f',
    gridOpacity: 0.1,
    atmosphere: '#7195a5',
    atmosphereAltitude: 0.075,
    history: '#d0dfe5',
    rim: '#172832',
    selection: '#c0dce8',
    pinStem: '#a1c8d8',
    pinCap: '#c0dce8',
    stars: true,
    css: {
      ...interfaceColors,
      '--globe-history': '#d0dfe5',
      '--globe-scheme': 'dark',
    },
  },
}
