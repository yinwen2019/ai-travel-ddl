import { computed, getCurrentScope, onScopeDispose, readonly, ref } from 'vue'
import type { CommunitySignals, CommunitySignalsSnapshot } from '@/types/community'
import { analytics } from '@/services/analytics'

// 沿用旧键，以便旧版本数据与跨标签页事件走同一条迁移路径；内容版本已升级为 v2。
const STORAGE_KEY = 'ai-travel-ddl:community:v1'
const STORAGE_PROBE_KEY = `${STORAGE_KEY}:probe`
const MAX_SUPPORT_COUNT = 999_999_999
const MAX_CITY_VOTES = 1_000
const MAX_STORED_LENGTH = 250_000
const signals = ref<CommunitySignalsSnapshot>(emptySnapshot())
const storageAvailable = ref(false)
const supportCount = computed(() =>
  analytics.enabled ? analytics.state.value.support : signals.value.supportCount,
)
const votes = computed<Readonly<Record<string, number>>>(() =>
  Object.freeze({
    ...(analytics.enabled ? analytics.state.value.expectations : signals.value.cityVotes),
  }),
)
let initialized = false
let listenerAttached = false
let activeConsumers = 0

function emptySnapshot(): CommunitySignalsSnapshot {
  return { version: 2, supportCount: 0, cityVotes: {} }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidCityId(id: string): boolean {
  return (
    /^[\p{L}\p{N}][\p{L}\p{N}_-]{0,199}$/u.test(id) &&
    !['__proto__', 'constructor', 'prototype'].includes(id)
  )
}

function isValidCount(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= MAX_SUPPORT_COUNT
  )
}

function parseSnapshot(raw: string | null): CommunitySignalsSnapshot | null {
  if (raw === null) return emptySnapshot()
  if (raw.length > MAX_STORED_LENGTH) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (
      !isRecord(parsed) ||
      (parsed.version !== 1 && parsed.version !== 2) ||
      !isValidCount(parsed.supportCount) ||
      !isRecord(parsed.cityVotes)
    )
      return null

    const entries = Object.entries(parsed.cityVotes)
    if (
      entries.length > MAX_CITY_VOTES ||
      entries.some(
        ([id, count]) =>
          !isValidCityId(id) ||
          (parsed.version === 1 ? typeof count !== 'boolean' : !isValidCount(count)),
      )
    )
      return null

    return {
      version: 2,
      supportCount: parsed.supportCount,
      cityVotes: Object.fromEntries(entries.map(([id, count]) => [id, Number(count)])),
    }
  } catch {
    return null
  }
}

function loadSignals(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  try {
    const stored = parseSnapshot(window.localStorage.getItem(STORAGE_KEY))
    if (stored) signals.value = stored
    // 先实际写入探测，避免把只读或已满的存储误报为可持久化。
    window.localStorage.setItem(STORAGE_PROBE_KEY, '1')
    window.localStorage.removeItem(STORAGE_PROBE_KEY)
    // 首次读取即写回 v2，将原先的已选/未选迁移成 1/0 票，保留支持次数。
    if (stored) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    storageAvailable.value = true
  } catch {
    // 存储受限时继续使用当前内存状态，交互不因浏览器设置中断。
    storageAvailable.value = false
  }
}

function persistSignals(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(signals.value))
    storageAvailable.value = true
  } catch {
    storageAvailable.value = false
  }
}

function syncStoredSignals(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY && event.key !== null) return
  try {
    if (event.storageArea !== window.localStorage) return
  } catch {
    storageAvailable.value = false
    return
  }
  const stored = parseSnapshot(event.key === null ? null : event.newValue)
  // 忽略其他标签页中的非法数据，不覆盖当前可用状态。
  if (stored) signals.value = stored
}

function attachStorageListener(): void {
  if (listenerAttached || typeof window === 'undefined') return
  if (initialized && storageAvailable.value) {
    try {
      // 路由离开后再次使用时，补读没有监听期间其他标签页保存的票数。
      const stored = parseSnapshot(window.localStorage.getItem(STORAGE_KEY))
      if (stored) signals.value = stored
    } catch {
      storageAvailable.value = false
    }
  }
  window.addEventListener('storage', syncStoredSignals)
  listenerAttached = true
}

function addSupport(): boolean {
  if (analytics.enabled) return analytics.submit('support', 'project')
  signals.value = {
    ...signals.value,
    supportCount: Math.min(MAX_SUPPORT_COUNT, signals.value.supportCount + 1),
  }
  persistSignals()
  return true
}

function addCityVote(id: string): boolean {
  if (!isValidCityId(id)) return false
  if (analytics.enabled) return analytics.submit('expectation', id)
  const cityVotes = { ...signals.value.cityVotes }
  if (
    !Object.prototype.hasOwnProperty.call(cityVotes, id) &&
    Object.keys(cityVotes).length >= MAX_CITY_VOTES
  )
    return false
  // 期待表示希望该城市承办会议，每次点击累加一票，可重复表达期待。
  cityVotes[id] = Math.min(MAX_SUPPORT_COUNT, getCityVotes(id) + 1)
  signals.value = { ...signals.value, cityVotes }
  persistSignals()
  return true
}

function getCityVotes(id: string): number {
  if (!isValidCityId(id)) return 0
  const count = analytics.enabled
    ? analytics.state.value.expectations[id]
    : signals.value.cityVotes[id]
  return typeof count === 'number' ? count : 0
}

export function useCommunitySignals(): CommunitySignals {
  loadSignals()
  attachStorageListener()
  if (getCurrentScope()) {
    activeConsumers += 1
    onScopeDispose(() => {
      activeConsumers -= 1
      if (activeConsumers === 0 && listenerAttached) {
        window.removeEventListener('storage', syncStoredSignals)
        listenerAttached = false
      }
    })
  }
  return {
    supportCount,
    votes,
    storageAvailable: readonly(storageAvailable),
    addSupport,
    addCityVote,
    getCityVotes,
  }
}
