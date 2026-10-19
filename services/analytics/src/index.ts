import entities from './entities.json'

type Metric = 'support' | 'expectation' | 'conference' | 'city'
interface Env {
  DB: D1Database
  ALLOWED_ORIGINS: string
}
interface Counter {
  metric: Metric
  entity_id: string
  total: number
  updated_at: string
}
const conferences = new Set(entities.conferences)
const cities = new Set(entities.cities)
const EVENT_TTL = 7 * 24 * 60 * 60 * 1000
const bursts = new Map<string, { count: number; until: number }>()

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  })
}
function error(code: string, status: number): Response {
  return json({ error: code }, status)
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
async function boundedBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader()
  if (!reader) throw new Error('body')
  let size = 0
  const chunks: Uint8Array[] = []
  let chunk = await reader.read()
  while (!chunk.done) {
    const value = chunk.value
    size += value.byteLength
    if (size > 4096) {
      await reader.cancel()
      throw new Error('body')
    }
    chunks.push(value)
    chunk = await reader.read()
  }
  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.length
  }
  return JSON.parse(new TextDecoder().decode(body)) as unknown
}
async function burstAllowed(request: Request): Promise<boolean> {
  const ip = request.headers.get('CF-Connecting-IP')
  if (!ip) return true
  // 仅作单实例的异常洪泛软保护；不保存原始 IP，不作为精确配额或独立人数。
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${Math.floor(Date.now() / 60000)}:${ip}`),
  )
  const key = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  const now = Date.now()
  const current = bursts.get(key)
  if (current && current.until > now) {
    current.count++
    return current.count <= 600
  }
  if (bursts.size >= 10000) {
    for (const [id, bucket] of bursts) if (bucket.until <= now) bursts.delete(id)
    if (bursts.size >= 10000) bursts.delete(bursts.keys().next().value!)
  }
  bursts.set(key, { count: 1, until: now + 60000 })
  return true
}

async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  if (request.method === 'OPTIONS') {
    if (
      request.headers.get('Access-Control-Request-Method') !== 'POST' &&
      request.headers.get('Access-Control-Request-Method') !== 'GET'
    )
      return error('method_not_allowed', 405)
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    })
  }
  if (request.method === 'GET' && url.pathname === '/health') {
    await env.DB.prepare('SELECT key FROM analytics_metadata LIMIT 1').all()
    return json({ ok: true, service: 'ai-travel-ddl-analytics' })
  }
  if (request.method === 'GET' && url.pathname === '/v1/state') {
    const results = await env.DB.batch([
      env.DB.prepare('SELECT metric, entity_id, total, updated_at FROM analytics_counters'),
      env.DB.prepare("SELECT value FROM analytics_metadata WHERE key = 'started_at'"),
    ])
    const support = { total: 0 }
    const cityClicks: Record<string, number> = {}
    const conferenceClicks: Record<string, number> = {}
    const expectations: Record<string, number> = {}
    let updatedAt: string | null = null
    for (const row of results[0].results as unknown as Counter[]) {
      if (row.metric === 'support') support.total = row.total
      else if (row.metric === 'city') cityClicks[row.entity_id] = row.total
      else if (row.metric === 'conference') conferenceClicks[row.entity_id] = row.total
      else expectations[row.entity_id] = row.total
      if (!updatedAt || row.updated_at > updatedAt) updatedAt = row.updated_at
    }
    return json({
      support: support.total,
      cityClicks,
      conferenceClicks,
      expectations,
      startedAt: (results[1].results[0] as { value: string } | undefined)?.value ?? null,
      updatedAt,
    })
  }
  if (request.method !== 'POST') return error('not_found', 404)
  const origin = request.headers.get('Origin')
  if (
    !origin ||
    !env.ALLOWED_ORIGINS.split(',')
      .map((item) => item.trim())
      .includes(origin)
  )
    return error('origin_not_allowed', 403)
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))
    return error('json_required', 415)
  if (!(await burstAllowed(request)))
    return new Response(JSON.stringify({ error: 'too_many_requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
        'Cache-Control': 'no-store',
      },
    })
  let input: unknown
  try {
    input = await boundedBody(request)
  } catch {
    return error('invalid_body', 400)
  }
  if (
    !record(input) ||
    typeof input.eventId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.eventId)
  )
    return error('invalid_event', 400)
  if (
    typeof input.createdAt !== 'number' ||
    !Number.isSafeInteger(input.createdAt) ||
    input.createdAt < Date.now() - EVENT_TTL ||
    input.createdAt > Date.now() + 300000
  )
    return error('expired_event', 400)
  if ('delta' in input || 'total' in input) return error('invalid_event', 400)
  let metric: Metric
  let entityId: string
  if (url.pathname === '/v1/support') {
    metric = 'support'
    entityId = 'project'
  } else if (url.pathname.startsWith('/v1/expectations/')) {
    metric = 'expectation'
    try {
      entityId = decodeURIComponent(url.pathname.slice('/v1/expectations/'.length))
    } catch {
      return error('invalid_entity', 400)
    }
    if (!cities.has(entityId)) return error('invalid_entity', 400)
  } else if (url.pathname === '/v1/clicks') {
    if (input.entityType !== 'city' && input.entityType !== 'conference')
      return error('invalid_entity', 400)
    metric = input.entityType
    if (
      typeof input.entityId !== 'string' ||
      !(metric === 'city' ? cities : conferences).has(input.entityId)
    )
      return error('invalid_entity', 400)
    entityId = input.entityId
  } else return error('not_found', 404)
  const result = await env.DB.batch([
    env.DB.prepare(
      'INSERT INTO analytics_events (event_id, metric, entity_id) VALUES (?, ?, ?) ON CONFLICT(event_id) DO NOTHING',
    ).bind(input.eventId, metric, entityId),
    env.DB.prepare('SELECT metric, entity_id FROM analytics_events WHERE event_id = ?').bind(
      input.eventId,
    ),
    env.DB.prepare(
      'SELECT metric, entity_id, total, updated_at FROM analytics_counters WHERE metric = ? AND entity_id = ?',
    ).bind(metric, entityId),
  ])
  const original = result[1].results[0] as { metric: Metric; entity_id: string }
  if (original.metric !== metric || original.entity_id !== entityId)
    return error('event_conflict', 409)
  const counter = result[2].results[0] as unknown as Counter
  return json({
    metric,
    entityId,
    total: counter.total,
    updatedAt: counter.updated_at,
    eventId: input.eventId,
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin')
    const allowed =
      !!origin &&
      env.ALLOWED_ORIGINS.split(',')
        .map((value) => value.trim())
        .includes(origin)
    let response: Response
    if (origin && !allowed) response = error('origin_not_allowed', 403)
    else {
      try {
        response = await handle(request, env)
      } catch {
        response = error('statistics_unavailable', 503)
      }
    }
    if (allowed) response.headers.set('Access-Control-Allow-Origin', origin!)
    response.headers.set('Vary', 'Origin')
    return response
  },
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    // 清理幂等明细不会减少累计计数；客户端也拒绝重放超过七天的事件。
    await env.DB.prepare('DELETE FROM analytics_events WHERE received_at < ?')
      .bind(Math.floor((Date.now() - EVENT_TTL) / 1000))
      .run()
  },
}
