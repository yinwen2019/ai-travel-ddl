import { createAnalyticsClient } from './analyticsClient'
import type { AnalyticsMetric } from './analyticsClient'
import { useConferences } from '@/composables/useConferences'
import { useCityDirectory } from '@/composables/useCityDirectory'

let endpoint = String(import.meta.env.VITE_ANALYTICS_API_URL ?? '').trim()
// 本地预览只允许本地统计服务，避免测试点击污染正式数据。
if (
  import.meta.env.DEV &&
  endpoint &&
  !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(endpoint)
)
  endpoint = ''
let storage: Storage | null = null
try {
  if (typeof window !== 'undefined') storage = window.sessionStorage
} catch {
  /* 内存队列仍可用。 */
}
export const analytics = createAnalyticsClient({ endpoint, storage })
export function trackEntityClick(type: 'conference' | 'city', id: string): void {
  if (analytics.enabled) analytics.submit(type, id)
}

/** Install one delegated activation listener; rendering and navigation never count. */
export function installAnalytics(): () => void {
  if (!analytics.enabled) return () => {}
  const { conferences } = useConferences()
  const { cities } = useCityDirectory()
  function activate(event: MouseEvent) {
    if (
      !event.isTrusted ||
      event.defaultPrevented ||
      (event.type === 'click' ? event.button !== 0 : event.button !== 1)
    )
      return
    const target = event.target instanceof Element ? event.target : null
    const action = target?.closest<HTMLElement>('a[href],button[data-analytics-type]')
    if (!action) return
    let type = action.dataset.analyticsType as AnalyticsMetric | undefined
    let id = action.dataset.analyticsId
    if (!type && action instanceof HTMLAnchorElement) {
      const url = new URL(action.href, location.href)
      if (url.origin !== location.origin) return
      const match = /^#\/(conference|cities)\/([^/?#]+)(?:[?#].*)?$/.exec(url.hash)
      if (!match) return
      type = match[1] === 'conference' ? 'conference' : 'city'
      try {
        id = decodeURIComponent(match[2])
      } catch {
        return
      }
    }
    if (type !== 'conference' && type !== 'city') return
    const valid =
      type === 'conference'
        ? conferences.value.some((item) => item.id === id)
        : cities.value.some((item) => item.id === id)
    if (valid && id) trackEntityClick(type, id)
  }
  const refresh = () => {
    if (!document.hidden) {
      void analytics.refresh()
      void analytics.flush()
    }
  }
  const online = () => analytics.retry()
  document.addEventListener('click', activate, true)
  document.addEventListener('auxclick', activate, true)
  document.addEventListener('visibilitychange', refresh)
  window.addEventListener('online', online)
  const interval = setInterval(refresh, 60000)
  void analytics.refresh().then(analytics.flush)
  return () => {
    clearInterval(interval)
    document.removeEventListener('click', activate, true)
    document.removeEventListener('auxclick', activate, true)
    document.removeEventListener('visibilitychange', refresh)
    window.removeEventListener('online', online)
    analytics.dispose()
  }
}
