import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'
import { randomUUID } from 'node:crypto'

const root = new URL('../../../', import.meta.url)
const temp = await mkdtemp(join(tmpdir(), 'ai-travel-analytics-'))
const cli = new URL('node_modules/wrangler/bin/wrangler.js', root).pathname
const env = {
  ...process.env,
  XDG_CONFIG_HOME: join(temp, 'config'),
  WRANGLER_SEND_METRICS: 'false',
  CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false',
}
const run = (args) => {
  const result = spawnSync(process.execPath, [cli, ...args], { cwd: root, env, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr + result.stdout)
}
run(['d1', 'migrations', 'apply', 'DB', '--local', '--env', 'test', '--persist-to', temp])
const child = spawn(
  process.execPath,
  [cli, 'dev', '--env', 'test', '--ip', '127.0.0.1', '--port', '8788', '--persist-to', temp],
  { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] },
)
let output = ''
child.stdout.on('data', (chunk) => {
  output += chunk
})
child.stderr.on('data', (chunk) => {
  output += chunk
})
const base = 'http://127.0.0.1:8788'
const origin = 'http://127.0.0.1:5173'
const event = () => ({ eventId: randomUUID(), createdAt: Date.now() })
async function post(path, data, from = origin) {
  return fetch(base + path, {
    method: 'POST',
    headers: { Origin: from, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
try {
  let healthy = false
  for (let attempt = 0; attempt < 150; attempt++) {
    try {
      if ((await fetch(base + '/health')).ok) {
        healthy = true
        break
      }
    } catch {
      /* 等待本地 Worker。 */
    }
    if (child.exitCode !== null) break
    await wait(100)
  }
  assert(healthy, output)
  const initial = await (await fetch(base + '/v1/state')).json()
  assert.equal(initial.support, 0)
  const repeated = event()
  const responses = await Promise.all(
    Array.from({ length: 16 }, () => post('/v1/support', repeated)),
  )
  assert(responses.every((response) => response.ok))
  assert.equal(
    (await (await fetch(base + '/v1/state')).json()).support,
    1,
    'network retries must be idempotent',
  )
  await Promise.all(Array.from({ length: 12 }, () => post('/v1/support', event())))
  assert.equal(
    (await (await fetch(base + '/v1/state')).json()).support,
    13,
    'separate clicks all count',
  )
  const city = 'vancouver-canada'
  for (let i = 0; i < 3; i++)
    assert.equal((await post(`/v1/expectations/${city}`, event())).status, 200)
  const heat = { ...event(), entityType: 'conference', entityId: 'cvpr' }
  assert.equal((await post('/v1/clicks', heat)).status, 200)
  assert.equal(
    (await post('/v1/clicks', { ...heat, entityId: 'icml' })).status,
    409,
    'one event cannot be reassigned',
  )
  assert.equal(
    (await post('/v1/clicks', { ...event(), entityType: 'city', entityId: 'fake-city' })).status,
    400,
  )
  assert.equal((await post('/v1/support', { ...event(), delta: 100 })).status, 400)
  assert.equal(
    (await post('/v1/support', { ...event(), createdAt: Date.now() - 8 * 86400000 })).status,
    400,
  )
  assert.equal((await post('/v1/support', event(), 'https://unapproved.example')).status, 403)
  const preflight = await fetch(base + '/v1/support', {
    method: 'OPTIONS',
    headers: { Origin: origin, 'Access-Control-Request-Method': 'POST' },
  })
  assert.equal(preflight.status, 204)
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin)
  const state = await (await fetch(base + '/v1/state')).json()
  assert.equal(state.support, 13)
  assert.equal(state.expectations[city], 3)
  assert.equal(state.conferenceClicks.cvpr, 1)
  assert.equal(state.conferenceClicks.icml, undefined)
  // 清理幂等记录时不能减少累计。
  run([
    'd1',
    'execute',
    'DB',
    '--local',
    '--env',
    'test',
    '--persist-to',
    temp,
    '--command',
    'DELETE FROM analytics_events;',
  ])
  assert.equal((await (await fetch(base + '/v1/state')).json()).support, 13)
  const entities = JSON.parse(
    await readFile(new URL('../src/entities.json', import.meta.url), 'utf8'),
  )
  assert.equal(entities.conferences.length, 13)
  console.log(
    'Worker integration passed: actual local D1, concurrency, idempotency, repeated votes, validation, CORS, cleanup.',
  )
} finally {
  child.kill('SIGTERM')
  if (child.exitCode === null)
    await Promise.race([new Promise((resolve) => child.once('exit', resolve)), wait(3000)])
  if (child.exitCode === null) child.kill('SIGKILL')
  await rm(temp, { recursive: true, force: true })
}
