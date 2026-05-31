# 03 — 项目架构

## 目录结构

```
ai-travel-ddl/
├── .github/workflows/          # deploy.yml, update-data.yml
├── data/                       # conferences.json, locations.json + schemas
├── scripts/                    # validate.mjs, update_conferences.py + lib/
├── src/
│   ├── main.ts / App.vue / router.ts
│   ├── types/                  # conference.ts, location.ts, view.ts, worldView.ts
│   ├── data/                   # cityCoords.ts（城市经纬度映射）
│   ├── utils/                  # geoDataProcessor.ts（纯数据处理函数）
│   ├── composables/            # useConferences, useLocations, useTheme, useDDLStatus, useMultiSelect, useSearch, useBreakpoint, useYearSelect, useWorldView
│   ├── components/
│   │   ├── layout/             # AppHeader, AppFooter
│   │   ├── conference/         # ConferenceCard, ConferenceColumn, ConferenceTimelineItem, ConferenceDetail
│   │   ├── navigation/         # MultiSelectNav, CategoryGroup, YearSelector
│   │   ├── location/           # LocationPage, ClimateCard, FoodList, AttractionList
│   │   ├── world/              # WorldMap, WorldLegend, WorldTable, WorldCategoryBar
│   │   ├── common/             # SearchInput, BadgeTag, ProgressBar, EmptyState, SkeletonCard, ErrorBanner, ThemeToggle, ScrollToTop
│   │   └── views/              # CountdownPage, YearPage, ConferencePage, WorldViewPage
│   ├── styles/                 # main.css, worldView.css
│   └── assets/                 # maps/world-land.geojson（本地世界底图）
├── public/favicon.svg
├── index.html / vite.config.ts / tailwind.config.js / package.json
└── .env.example
```

## 组件树

```
App.vue
├── AppHeader (SearchInput, ThemeToggle, ViewSwitch)
├── <router-view>
│   ├── CountdownPage (#/)
│   │   ├── MultiSelectNav > CategoryGroup (×5)
│   │   └── ConferenceColumn (×N) > ConferenceCard (×M)
│   ├── YearPage (#/year)
│   │   ├── YearSelector
│   │   └── ConferenceCard (×N) > ProgressBar + BadgeTag
│   ├── ConferencePage (#/conference/:id)
│   │   └── ConferenceDetail > ConferenceTimelineItem (×N)
│   ├── LocationPage (#/location/:id)
│   │   ├── ClimateCard / FoodList / AttractionList
│   │   └── 反向关联会议列表
│   └── WorldViewPage (#/world)
│       ├── WorldMap > WorldLegend
│       │   └── Leaflet local GeoJSON base map + CircleMarkers + Tooltips
│       └── WorldTable (年份-会议二维表)
├── ScrollToTop
└── AppFooter
```

## 数据流

```
conferences.json ──→ useConferences ──→ useWorldView ──→ geoDataProcessor ──→ WorldMap / WorldTable
                                                     ├── buildCityIndex() → Map<CityKey, CityData>
                                                     └── buildYearTable() → YearTable
locations.json  ──→ useLocations  ──→ LocationPage / 城市链接
useTheme         ──→ document.documentElement (dark mode class)
useDDLStatus     ──→ ProgressBar + BadgeTag (传入日期，返回颜色/状态)
useMultiSelect   ──→ MultiSelectNav ↔ CountdownPage (选取状态共享)
cityCoords.ts    ──→ geoDataProcessor (经纬度查询，纯数据层)
world-land.geojson ──→ WorldMap (本地静态世界国家边界底图，无外部地图 API；可替换为同格式 GeoJSON)
```

## 三层解耦（铁则）

```
src/       → 只读 import JSON，不修改数据
data/      → 纯 JSON，无逻辑
scripts/   → 读写 data/，不访问 src/
```

跨层直接调用禁止。

> 版本：v0.3.0 | 2026-05-30
