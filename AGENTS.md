# AGENTS.md

## Project: AI Travel DDL

AI 顶会信息聚合展示平台 — 当前数据包含 13 个 AI 会议，展示其历年举办地、投稿 DDL、开会时间。
纯静态站点，Vue 3 + Vite + Tailwind CSS，部署至 GitHub Pages。

---

## Context Protocol

开发任务前，按任务类型精读对应 .docs/ 文件：
- 写 UI → `.docs/05-ui-design-spec.md`
- 改数据/Schema → `.docs/04-data-schema.md`
- 写 AI 脚本 → `.docs/08-ai-update-pipeline.md`
- 部署 → `.docs/09-deployment.md`
- 任何功能 → `.docs/01-requirements.md`（查需求编号）
- 代码规范 → `.docs/07-constraints.md`

不需要通读全部文件。

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Vue 3.4+ (Composition API, `<script setup>`) + TypeScript 5.x strict |
| Build | Vite 5.x, HMR on :5173 |
| CSS | Tailwind CSS 3.4, `darkMode: 'class'` |
| Globe | Three.js + Globe.GL, lazy-loaded, local GeoJSON and procedural landmarks |
| Router | Vue Router (Hash mode) — required for GitHub Pages |
| Data | Static JSON at `data/conferences.json` + `data/locations.json`, build-time import |
| Validation | Ajv, `npm run validate` before every build |
| AI Script | Python 3.11+, `scripts/update_conferences.py` |
| Deploy | GitHub Pages via `actions/upload-pages-artifact` + `actions/deploy-pages` |

---

## Directory Layout

```
ai-travel-ddl/
├── .docs/                          # Project context
├── .github/workflows/              # deploy.yml, update-data.yml
├── data/
│   ├── conferences.json            # Core conference data
│   ├── schema.json                 # JSON Schema for conferences
│   └── locations.json              # City travel encyclopedia
├── scripts/
│   ├── validate.mjs                # Schema validation
│   ├── update_conferences.py       # AI data update
│   ├── requirements.txt
│   └── lib/                        # api_client, prompt_builder, parser, merger, validator, logger
├── src/
│   ├── main.ts / App.vue / router.ts
│   ├── types/                      # conference.ts, location.ts, view.ts
│   ├── composables/                # useConferences, useLocations, useCityDirectory, useHomeOverview, useTheme, useDDLStatus, useMultiSelect
│   ├── utils/                      # cityDirectory.ts、homeRanking.ts（只读聚合）等
│   ├── components/
│   │   ├── layout/                 # AppHeader, AppFooter
│   │   ├── home/                   # HomeGlobe（静态 SVG）, HomeCityRanking
│   │   ├── conference/             # ConferenceCard, ConferenceRow, ConferenceTimelineItem, ConferenceDetail
│   │   ├── navigation/             # MultiSelectNav, CategoryGroup, YearSelector
│   │   ├── location/               # LocationPage, CityCard, CityLink, ClimateCard, FoodList, AttractionList
│   │   ├── common/                 # SearchInput, BadgeTag, ProgressBar, EmptyState, SkeletonCard, ErrorBanner, ThemeToggle, ScrollToTop
│   │   └── views/                  # HomePage, CountdownPage, YearPage, ConferencePage, WorldViewPage, CityViewPage
│   └── styles/                     # main.css, cities.css, home.css 等
├── public/favicon.svg
├── index.html / vite.config.ts / tailwind.config.js / package.json
└── .env.example
```

---

## Key Constraints

### Three-Layer Decoupling (Iron Rule)
```
展示层 (src/)        →  Read-only JSON import, never mutate data
数据层 (data/)       →  Pure JSON, no logic
脚本层 (scripts/)    →  Read/write data/, never touch src/
```

### Data Rules
- History (`year < current_year`): **read-only** for AI scripts
- All dates: ISO 8601 `YYYY-MM-DD`
- Timezones: IANA format (`America/New_York`), never abbreviations
- Country names: full English (`"United States"`, not `"USA"`)
- Missing fields → display "待公布", never crash

### Code Rules
- `@typescript-eslint/no-explicit-any`: **error**
- Components: PascalCase, Composables: `use` prefix
- Business logic comments: Chinese, Interface/JSDoc: English
- Commit: `type(scope): description`

---

## Commands

```bash
npm run dev          # Vite dev server (5173)
npm run build        # validate → vite build → dist/
npm run validate     # JSON Schema validation
npm run preview      # Preview build (4173)
npm run lint         # ESLint check + fix
npm run format       # Prettier format
npm run type-check   # vue-tsc --noEmit

python scripts/update_conferences.py  # AI data update (requires .env)
```

---

## DDL Color System

| Status | Condition | Color | Tailwind |
|---|---|---|---|
| Expired | DDL < today | `#9CA3AF` | `text-expired` |
| Travel | 投稿 DDL 已截止、待开会或正在开会 | `#6366F1` | `text-travel` |
| Urgent | ≤ 7 days | `#EF4444` | `text-danger` |
| Near | ≤ 30 days | `#F59E0B` | `text-warning` |
| Ample | > 30 days | `#10B981` | `text-success` |

---

## Routes

| Path | View | Description |
|---|---|---|
| `#/` | HomePage | 介绍型首页，静态地球、历史城市榜与四个功能入口 |
| `#/conference` | CountdownPage | 会议维度视图（每会议一行，历年卡片轮播） |
| `#/year` | YearPage | 年份视图（卡片网格 + 进度条） |
| `#/world` | WorldViewPage | 世界地图 + 年份会议二维表 |
| `#/cities` | CityViewPage | 城市目录，搜索、大洲和旅行指南筛选 |
| `#/cities/:id` | LocationPage | 城市旅行详情 + 全部关联会议 |
| `#/conference/:id` | ConferencePage | 单个会议详情 + 时间轴 |
| `#/location/:id` | redirect | 兼容重定向至 `#/cities/:id` |

---

## Pre-commit Checklist

- [ ] `npm run validate` passes
- [ ] `npm run build` passes
- [ ] `meta.last_updated` updated if data changed
- [ ] No `any` type anywhere
- [ ] No hardcoded conference data in components
- [ ] Commit follows `type(scope): description` format

## UI 实现基线

UI 重构前参阅 `.docs/10-ui-audit.md`；需求与实际实现的偏差单独记录，不修改需求来迁就既有缺陷。当前筛选位于各视图顶部工具栏，AppHeader 仅保留品牌、导航和主题；当前样式基线见 `.docs/05-ui-design-spec.md`，交付记录见 `.docs/11-ui-refactor-result.md`。
