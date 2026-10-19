import type { ComputedRef, Ref } from 'vue'

/** Versioned, browser-local community preferences. */
export interface CommunitySignalsSnapshot {
  version: 2
  supportCount: number
  cityVotes: Record<string, number>
}

/** Shared reactive access to browser-local community preferences. */
export interface CommunitySignals {
  supportCount: ComputedRef<number>
  votes: ComputedRef<Readonly<Record<string, number>>>
  storageAvailable: Readonly<Ref<boolean>>
  addSupport: () => boolean
  addCityVote: (id: string) => boolean
  getCityVotes: (id: string) => number
}

/** One bounded visual acknowledgement of a support action. */
export interface SupportParticle {
  id: number
  offset: number
}
