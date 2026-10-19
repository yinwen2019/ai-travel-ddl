import assert from 'node:assert/strict'
import { createAnalyticsClient } from '../../../src/services/analyticsClient.ts'
import { setTimeout as wait } from 'node:timers/promises'
const snapshot = {
  support: 0,
  expectations: {},
  cityClicks: {},
  conferenceClicks: {},
  startedAt: '2026-10-17T00:00:00Z',
  updatedAt: null,
}
const saved = new Map()
const storage = {
  getItem: (key) => saved.get(key) ?? null,
  setItem: (key, value) => saved.set(key, value),
}
let calls = []
let fail = false
let missingAck = false
const accepted = new Set()
const fetcher = async (url, options = {}) => {
  if (!options.method) return Response.json(snapshot)
  const event = JSON.parse(options.body)
  calls.push(event.eventId)
  if (fail) throw new Error('offline')
  const metric = url.endsWith('/support') ? 'support' : 'expectation'
  const entityId = metric === 'support' ? 'project' : 'vancouver-canada'
  if (!accepted.has(event.eventId)) {
    accepted.add(event.eventId)
    if (metric === 'support') snapshot.support++
    else snapshot.expectations[entityId] = (snapshot.expectations[entityId] ?? 0) + 1
  }
  if (missingAck) {
    missingAck = false
    throw new Error('ack lost')
  }
  return Response.json({
    eventId: event.eventId,
    metric,
    entityId,
    total: metric === 'support' ? snapshot.support : snapshot.expectations[entityId],
    updatedAt: '2026-10-17T00:00:00Z',
  })
}
async function settled(client) {
  for (let i = 0; i < 100; i++) {
    if (!client.pending.value) return
    await wait(5)
  }
  assert.equal(client.pending.value, 0)
}
const client = createAnalyticsClient({ endpoint: 'https://api.example', fetch: fetcher, storage })
try {
  assert.equal(client.submit('support', 'project'), false, 'must not show unknown totals as zero')
  await client.refresh()
  assert(client.ready.value)
  for (let i = 0; i < 3; i++) assert(client.submit('support', 'project'))
  await settled(client)
  assert.equal(client.state.value.support, 3)
  assert.equal(new Set(calls).size, 3, 'real repeated clicks have distinct event IDs')
  fail = true
  assert(client.submit('support', 'project'))
  await wait(5)
  assert.equal(client.state.value.support, 3, 'offline clicks do not inflate confirmed count')
  const failedId = calls.at(-1)
  fail = false
  client.retry()
  await settled(client)
  assert.equal(calls.at(-1), failedId, 'retry uses original identity')
  assert.equal(client.state.value.support, 4)
  missingAck = true
  client.submit('support', 'project')
  await wait(5)
  assert.equal(client.state.value.support, 4)
  client.retry()
  await settled(client)
  assert.equal(client.state.value.support, 5, 'lost acknowledgment must not double count')
  client.submit('expectation', 'vancouver-canada')
  client.submit('expectation', 'vancouver-canada')
  await settled(client)
  assert.equal(client.state.value.expectations['vancouver-canada'], 2)
  snapshot.support = 2
  await client.refresh()
  assert.equal(
    client.state.value.support,
    5,
    'stale read cannot decrease a confirmed cumulative total',
  )
  fail = true
  client.submit('support', 'project')
  await wait(5)
  const restoreId = calls.at(-1)
  client.dispose()
  fail = false
  const reloaded = createAnalyticsClient({
    endpoint: 'https://api.example',
    fetch: fetcher,
    storage,
  })
  try {
    assert.equal(reloaded.pending.value, 1)
    reloaded.retry()
    await settled(reloaded)
    assert.equal(calls.at(-1), restoreId)
  } finally {
    reloaded.dispose()
  }
  const invalid = createAnalyticsClient({
    endpoint: 'https://user:secret@api.example',
    fetch: fetcher,
  })
  assert(invalid.enabled && !invalid.ready.value)
  assert(invalid.problem.value)
  invalid.dispose()
  console.log(
    'Client checks passed: repeated clicks, honest failure, same-ID retry, lost acknowledgment, reload outbox, stale reads, configuration validation.',
  )
} finally {
  client.dispose()
}
