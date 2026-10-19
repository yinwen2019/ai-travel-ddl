import { readFile, writeFile } from 'node:fs/promises'
const root = new URL('../../../', import.meta.url)
const { conferences } = JSON.parse(await readFile(new URL('data/conferences.json', root), 'utf8'))
const { locations } = JSON.parse(await readFile(new URL('data/locations.json', root), 'utf8'))
// 与城市目录保持相同的重音、大小写与 slug 规则，不读写展示层。
const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
const key = (city, country) => normalize(`${city}, ${country}`)
const cities = new Map(locations.map((city) => [key(city.city, city.country), city.id]))
for (const conference of conferences) {
  for (const entry of conference.years) {
    const city = entry.city?.trim()
    const country = entry.country?.trim()
    if (!city || !country || normalize(city) === 'virtual' || normalize(country) === 'online')
      continue
    const identity = key(city, country)
    if (!cities.has(identity))
      cities.set(
        identity,
        normalize(`${city}-${country}`)
          .replace(/[^\p{L}\p{N}]+/gu, '-')
          .replace(/^-|-$/g, ''),
      )
  }
}
const entities = {
  conferences: conferences.map((item) => item.id).sort(),
  cities: [...new Set(cities.values())].sort(),
}
await writeFile(
  new URL('services/analytics/src/entities.json', root),
  JSON.stringify(entities, null, 2) + '\n',
)
console.log(
  `Analytics entities: ${entities.conferences.length} conferences, ${entities.cities.length} cities`,
)
