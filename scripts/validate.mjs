import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DATA_DIR = resolve(ROOT, 'data')

// 颜色输出
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREEN = '\x1b[32m'
const RESET = '\x1b[0m'

let hasError = false
let hasWarning = false

function loadJSON(filepath) {
  const raw = readFileSync(filepath, 'utf-8')
  return JSON.parse(raw)
}

// ============ Ajv Schema 校验 ============
const schema = loadJSON(resolve(DATA_DIR, 'schema.json'))
const data = loadJSON(resolve(DATA_DIR, 'conferences.json'))
const locations = loadJSON(resolve(DATA_DIR, 'locations.json'))

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(schema)
const valid = validate(data)

if (!valid) {
  hasError = true
  console.log(`${RED}✗ JSON Schema 校验失败:${RESET}`)
  validate.errors.forEach((e) => {
    const path = e.instancePath || '(root)'
    console.log(`  ${RED}${path}: ${e.message}${RESET}`)
  })
} else {
  console.log(`${GREEN}✓ JSON Schema 校验通过${RESET}`)
}

// ============ 自定义校验 ============
const conferences = data.conferences
const now = new Date()
const currentYear = now.getFullYear()

// 1. id 唯一性
const ids = new Set()
for (const c of conferences) {
  if (ids.has(c.id)) {
    console.log(`${RED}✗ 重复 id: "${c.id}"${RESET}`)
    hasError = true
  }
  ids.add(c.id)
}

// 2. year 范围与 type 逻辑
for (const c of conferences) {
  const name = c.name || c.id

  for (const y of c.years || []) {
    if (y.year < 1900 || y.year > 2100) {
      console.log(`${RED}✗ ${name}: year ${y.year} 超出 1900–2100${RESET}`)
      hasError = true
    }
    if (y.type === 'history' && y.year >= currentYear) {
      console.log(`${YELLOW}⚠ ${name}: type=history 但 year=${y.year} >= ${currentYear}，应为 upcoming${RESET}`)
      hasWarning = true
    }
    if (y.type === 'upcoming' && y.year < currentYear) {
      console.log(`${YELLOW}⚠ ${name}: type=upcoming 但 year=${y.year} < ${currentYear}，应为 history${RESET}`)
      hasWarning = true
    }
  }
}

// 3. 枚举值
const VALID_CATEGORIES = ['CV', 'NLP', 'ML', 'AI', 'DM']
for (const c of conferences) {
  if (!VALID_CATEGORIES.includes(c.category)) {
    console.log(`${RED}✗ ${c.name}: 非法 category "${c.category}"${RESET}`)
    hasError = true
  }
}

// 4. location_id 在 locations.json 中存在性
const locationIds = new Set((locations.locations || []).map((l) => l.id))
for (const c of conferences) {
  for (const y of c.years || []) {
    if (y.location_id && !locationIds.has(y.location_id)) {
      console.log(
        `${YELLOW}⚠ ${c.name} (${y.year}): location_id "${y.location_id}" 在 locations.json 中不存在${RESET}`,
      )
      hasWarning = true
    }
  }
}

// ============ 警告（不阻断） ============

// 5. upcoming 为空
for (const c of conferences) {
  const hasUpcoming = (c.years || []).some((y) => y.type === 'upcoming')
  if (!hasUpcoming) {
    console.log(`${YELLOW}⚠ ${c.name}: 无 upcoming 年份${RESET}`)
    hasWarning = true
  }
}

// 6. abstract_ddl / paper_ddl 为空数组
for (const c of conferences) {
  for (const y of c.years || []) {
    if (y.type !== 'upcoming') continue
    if (y.abstract_ddl && y.abstract_ddl.length === 0) {
      console.log(`${YELLOW}⚠ ${c.name} (${y.year}): abstract_ddl 为空数组${RESET}`)
      hasWarning = true
    }
    if (y.paper_ddl && y.paper_ddl.length === 0) {
      console.log(`${YELLOW}⚠ ${c.name} (${y.year}): paper_ddl 为空数组${RESET}`)
      hasWarning = true
    }
  }
}

// 7. status 为 unverified
for (const c of conferences) {
  for (const y of c.years || []) {
    if (y.type === 'upcoming' && y.status === 'unverified') {
      console.log(`${YELLOW}⚠ ${c.name} (${y.year}): status 为 unverified${RESET}`)
      hasWarning = true
    }
  }
}

// ============ 结果汇总 ============
console.log('')
if (hasError) {
  console.log(`${RED}校验失败：存在阻断性错误，构建将终止。${RESET}`)
  process.exit(1)
} else if (hasWarning) {
  console.log(`${YELLOW}校验通过（有警告）。${RESET}`)
} else {
  console.log(`${GREEN}校验完全通过。${RESET}`)
}
