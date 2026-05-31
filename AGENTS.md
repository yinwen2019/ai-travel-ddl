# AGENTS.md

## Project: AI Travel DDL

AI 顶会信息聚合展示平台 — 展示 15+ AI 顶会的历年举办地、投稿 DDL、开会时间。
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
| Router | Vue Router (Hash mode) — required for GitHub Pages |
| Data | Static JSON at `data/conferences.json` + `data/locations.json`, build-time import |
| Validation | Ajv, `npm run validate` before every build |
| AI Script | Python 3.11+, `scripts/update_conferences.py` |
| Deploy | GitHub Pages via `peaceiris/actions-gh-pages` |

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
│   ├── composables/                # useConferences, useLocations, useTheme, useDDLStatus, useMultiSelect
│   ├── components/
│   │   ├── layout/                 # AppHeader, AppFooter
│   │   ├── conference/             # ConferenceCard, ConferenceColumn, ConferenceTimelineItem, ConferenceDetail
│   │   ├── navigation/             # MultiSelectNav, CategoryGroup, YearSelector
│   │   ├── location/               # LocationPage, ClimateCard, FoodList, AttractionList
│   │   ├── common/                 # SearchInput, BadgeTag, ProgressBar, EmptyState, SkeletonCard, ErrorBanner, ThemeToggle, ScrollToTop
│   │   └── views/                  # CountdownPage, YearPage, ConferencePage
│   └── styles/main.css
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
| Urgent | ≤ 7 days | `#EF4444` | `text-danger` |
| Near | ≤ 30 days | `#F59E0B` | `text-warning` |
| Ample | > 30 days | `#10B981` | `text-success` |

---

## Routes

| Path | View | Description |
|---|---|---|
| `#/` | CountdownPage | 会议维度视图（多列布局） |
| `#/year` | YearPage | 年份视图（卡片网格 + 进度条） |
| `#/conference/:id` | ConferencePage | 单个会议详情 + 时间轴 |
| `#/location/:id` | LocationPage | 城市旅游百科 |

---

## Pre-commit Checklist

- [ ] `npm run validate` passes
- [ ] `npm run build` passes
- [ ] `meta.last_updated` updated if data changed
- [ ] No `any` type anywhere
- [ ] No hardcoded conference data in components
- [ ] Commit follows `type(scope): description` format
