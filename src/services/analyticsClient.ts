import { computed, readonly, ref } from 'vue'

export type AnalyticsMetric = 'support' | 'expectation' | 'conference' | 'city'
export interface AnalyticsState {
  support: number
  expectations: Record<string, number>
  conferenceClicks: Record<string, number>
  cityClicks: Record<string, number>
  startedAt: string | null
  updatedAt: string | null
}
interface QueuedEvent {
  eventId: string
  createdAt: number
  metric: AnalyticsMetric
  entityId: string
  attempts: number
}
interface ClientOptions {
  endpoint: string
  fetch?: typeof fetch
  storage?: Pick<Storage, 'getItem' | 'setItem'> | null
}
const MAX_AGE = 24 * 60 * 60 * 1000
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
function count(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}
function counts(value: unknown): value is Record<string, number> {
  return (
    record(value) &&
    Object.entries(value).every(
      ([id, value]) => !['__proto__', 'prototype', 'constructor'].includes(id) && count(value),
    )
  )
}
function validState(value: unknown): value is AnalyticsState {
  return (
    record(value) &&
    count(value.support) &&
    counts(value.expectations) &&
    counts(value.cityClicks) &&
    counts(value.conferenceClicks) &&
    (value.startedAt === null || typeof value.startedAt === 'string') &&
    (value.updatedAt === null || typeof value.updatedAt === 'string')
  )
}
function empty(): AnalyticsState {
  return {
    support: 0,
    expectations: {},
    cityClicks: {},
    conferenceClicks: {},
    startedAt: null,
    updatedAt: null,
  }
}
function metricMap(state: AnalyticsState, metric: Exclude<AnalyticsMetric, 'support'>) {
  return metric === 'expectation'
    ? state.expectations
    : metric === 'city'
      ? state.cityClicks
      : state.conferenceClicks
}

/** A public counting client; retry identifiers deduplicate transport, never real clicks. */
export function createAnalyticsClient(options: ClientOptions) {
  const enabled = !!options.endpoint
  let base: string | null = null
  try {
    const url = new URL(options.endpoint)
    if (
      (url.protocol === 'https:' ||
        (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    )
      base = url.href.replace(/\/$/, '')
  } catch {
    /* 未配置接口时保留本机模式；错误地址不会被当作已连接。 */
  }
  const state = ref<AnalyticsState>(empty())
  const ready = ref(false)
  const loading = ref(false)
  const problem = ref(enabled && !base ? '统计接口地址配置有误' : '')
  const queue = ref<QueuedEvent[]>([])
  const pending = computed(() => queue.value.length)
  const key = `ai-travel-ddl:outbox:${base ?? 'disabled'}`
  const fetcher = options.fetch ?? fetch
  const storage = options.storage
  let writing = false
  let refreshing: Promise<void> | null = null
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let closed = false

  function persist() {
    try {
      storage?.setItem(key, JSON.stringify(queue.value))
    } catch {
      /* 保存失败仍可在本次页面内发送，不伪造全站计数。 */
    }
  }
  function restore() {
    if (!base) return
    try {
      const raw = storage?.getItem(key)
      if (!raw || raw.length > 100000) return
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed) || parsed.length > 200) return
      const seen = new Set<string>()
      queue.value = parsed.filter((item): item is QueuedEvent => {
        if (
          !record(item) ||
          typeof item.eventId !== 'string' ||
          !/^[0-9a-f-]{36}$/i.test(item.eventId) ||
          seen.has(item.eventId) ||
          typeof item.createdAt !== 'number' ||
          item.createdAt < Date.now() - MAX_AGE ||
          item.createdAt > Date.now() + 300000 ||
          !['support', 'expectation', 'conference', 'city'].includes(String(item.metric)) ||
          typeof item.entityId !== 'string' ||
          item.entityId.length > 200 ||
          !count(item.attempts) ||
          item.attempts > 3
        )
          return false
        seen.add(item.eventId)
        return true
      })
    } catch {
      /* 忽略损坏的重试队列，绝不上传旧版本机累计数据。 */
    }
  }
  restore()

  async function refresh(): Promise<void> {
    if (!base || closed) return
    if (refreshing) return refreshing
    loading.value = true
    refreshing = (async () => {
      try {
        const response = await fetcher(`${base}/v1/state`, {
          signal: AbortSignal.timeout(8000),
          cache: 'no-store',
        })
        const value: unknown = await response.json()
        if (!response.ok || !validState(value)) throw new Error('state')
        // 累计只增不减，防止乱序或较旧的读取响应覆盖刚确认的点击。
        state.value.support = Math.max(state.value.support, value.support)
        for (const metric of ['expectation', 'conference', 'city'] as const) {
          const target = metricMap(state.value, metric)
          for (const [id, total] of Object.entries(metricMap(value, metric)))
            target[id] = Math.max(target[id] ?? 0, total)
        }
        state.value.startedAt = value.startedAt
        state.value.updatedAt = value.updatedAt
        ready.value = true
        if (!queue.value.length) problem.value = ''
      } catch {
        problem.value = '暂时无法连接全站统计'
      } finally {
        loading.value = false
        refreshing = null
      }
    })()
    return refreshing
  }
  async function flush(): Promise<void> {
    if (!base || writing || closed) return
    writing = true
    clearTimeout(retryTimer)
    try {
      while (queue.value.length && !closed) {
        const event = queue.value[0]
        if (event.createdAt < Date.now() - MAX_AGE) {
          queue.value.shift()
          persist()
          problem.value = '过期操作未同步，请重新点击'
          continue
        }
        if (event.attempts >= 3) {
          problem.value = '部分操作等待同步，请重试'
          break
        }
        event.attempts++
        persist()
        const path =
          event.metric === 'support'
            ? '/v1/support'
            : event.metric === 'expectation'
              ? `/v1/expectations/${encodeURIComponent(event.entityId)}`
              : '/v1/clicks'
        try {
          const response = await fetcher(`${base}${path}`, {
            method: 'POST',
            keepalive: true,
            signal: AbortSignal.timeout(8000),
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId: event.eventId,
              createdAt: event.createdAt,
              ...(['conference', 'city'].includes(event.metric)
                ? { entityType: event.metric, entityId: event.entityId }
                : {}),
            }),
          })
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            queue.value.shift()
            persist()
            problem.value = '这次操作未保存，请重新点击'
            continue
          }
          const value: unknown = await response.json()
          if (
            !response.ok ||
            !record(value) ||
            value.eventId !== event.eventId ||
            value.metric !== event.metric ||
            value.entityId !== event.entityId ||
            !count(value.total)
          )
            throw new Error('write')
          if (event.metric === 'support')
            state.value.support = Math.max(state.value.support, value.total)
          else {
            const target = metricMap(state.value, event.metric)
            target[event.entityId] = Math.max(target[event.entityId] ?? 0, value.total)
          }
          if (typeof value.updatedAt === 'string') state.value.updatedAt = value.updatedAt
          queue.value.shift()
          persist()
          problem.value = ''
        } catch {
          problem.value = '部分操作等待同步，请重试'
          if (event.attempts < 3)
            retryTimer = setTimeout(
              () => {
                void flush()
              },
              event.attempts === 1 ? 1500 : 10000,
            )
          break
        }
      }
    } finally {
      writing = false
    }
  }
  function submit(metric: AnalyticsMetric, entityId: string): boolean {
    if (!base || (!ready.value && metric !== 'city' && metric !== 'conference')) {
      problem.value = '全站统计尚未连接，请稍后重试'
      return false
    }
    if (queue.value.length >= 200) {
      problem.value = '操作正在同步，请稍候'
      return false
    }
    queue.value.push({
      eventId: crypto.randomUUID(),
      createdAt: Date.now(),
      metric,
      entityId,
      attempts: 0,
    })
    persist()
    void flush()
    return true
  }
  function retry() {
    for (const event of queue.value) event.attempts = 0
    persist()
    void refresh().then(flush)
  }
  function dispose() {
    closed = true
    clearTimeout(retryTimer)
  }
  return {
    enabled,
    state: readonly(state),
    ready: readonly(ready),
    loading: readonly(loading),
    problem: readonly(problem),
    pending,
    refresh,
    flush,
    submit,
    retry,
    dispose,
  }
}
