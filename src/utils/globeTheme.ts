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

/** Shared scene and interface colors for the site's two themes. */
export const GLOBE_THEMES: Record<GlobeTheme, GlobePalette> = {
  light: {
    background: '#f2efe7',
    ocean: '#dce5e1',
    land: '#b5bfaa',
    border: '#697962',
    borderOpacity: 0.38,
    grid: '#879b94',
    gridOpacity: 0.13,
    atmosphere: '#d1c5b3',
    atmosphereAltitude: 0.06,
    history: '#53624e',
    rim: '#fffaf2',
    selection: '#a64b35',
    pinStem: '#a64b35',
    pinCap: '#ce7959',
    stars: false,
    css: {
      '--globe-background': '#f2efe7',
      '--globe-ink': '#302e29',
      '--globe-muted': '#665f54',
      '--globe-line': '#d2cabd',
      '--globe-panel': '#fffcf5',
      '--globe-hover': '#eee7db',
      '--globe-accent': '#a64b35',
      '--globe-history': '#53624e',
      '--globe-scheme': 'light',
    },
  },
  dark: {
    background: '#202421',
    ocean: '#1c3035',
    land: '#58746d',
    border: '#b5c3b1',
    borderOpacity: 0.32,
    grid: '#8baba2',
    gridOpacity: 0.1,
    atmosphere: '#78998e',
    atmosphereAltitude: 0.09,
    history: '#b1c1b6',
    rim: '#20332d',
    selection: '#efb49a',
    pinStem: '#d68c6b',
    pinCap: '#efb49a',
    stars: true,
    css: {
      '--globe-background': '#202421',
      '--globe-ink': '#f0ede4',
      '--globe-muted': '#b7bdb5',
      '--globe-line': '#4c5851',
      '--globe-panel': '#292e2b',
      '--globe-hover': '#364039',
      '--globe-accent': '#e6a38a',
      '--globe-history': '#b1c1b6',
      '--globe-scheme': 'dark',
    },
  },
}
