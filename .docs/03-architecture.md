# 03 — 项目架构

## 目录结构

```
ai-travel-ddl/
├── .github/workflows/          # deploy.yml, update-data.yml
├── data/                       # conferences.json, locations.json + schemas
├── scripts/                    # validate.mjs, update_conferences.py + lib/
├── src/
│   ├── main.ts / App.vue / router.ts
│   ├── types/                  # conference.ts, location.ts, view.ts, worldView.ts, home.ts
│   ├── data/                   # cityCoords.ts（城市经纬度映射）
│   ├── utils/                  # geoDataProcessor.ts, cityDirectory.ts, homeRanking.ts（只读数据聚合）
│   ├── composables/            # useConferences, useLocations, useCityDirectory, useHomeOverview, useTheme, useDDLStatus, useMultiSelect, useSearch, useBreakpoint, useYearSelect, useWorldView
│   ├── components/
│   │   ├── layout/             # AppHeader, AppFooter
│   │   ├── home/               # HomeGlobe, HomeCityRanking
│   │   ├── conference/         # ConferenceCard, ConferenceRow, ConferenceTimelineItem, ConferenceDetail
│   │   ├── navigation/         # MultiSelectNav, CategoryGroup, YearSelector
│   │   ├── location/           # LocationPage, CityCard, CityLink, ClimateCard, FoodList, AttractionList
│   │   ├── world/              # WorldMap, WorldLegend, WorldTable, WorldCategoryBar
│   │   ├── common/             # SearchInput, BadgeTag, ProgressBar, EmptyState, SkeletonCard, ErrorBanner, ThemeToggle, ScrollToTop
│   │   └── views/              # HomePage, CountdownPage, YearPage, ConferencePage, WorldViewPage, CityViewPage
│   ├── styles/                 # main.css, worldView.css, globe.css, cities.css, home.css
│   └── assets/                 # maps/（本地 GeoJSON + 地形 WebP）
├── public/favicon.svg
├── index.html / vite.config.ts / tailwind.config.js / package.json
└── .env.example
```

## 组件树

```
App.vue
├── AppHeader (BrandMark, ThemeToggle, Home / World / Conference / Year / City)
├── <router-view>
│   ├── HomePage (#/，name: home)
│   │   ├── 产品介绍、覆盖数量与四个功能入口
│   │   └── HomeGlobe（本地静态 SVG）+ HomeCityRanking
│   ├── CountdownPage (#/conference，name: countdown)
│   │   ├── SearchInput + ConferenceFilters
│   │   └── ConferenceRow (×N，每会议一行) > 年份轮播 > ConferenceCard (×M)
│   ├── YearPage (#/year)
│   │   ├── SearchInput + YearSelector
│   │   └── ConferenceCard (×N) > ProgressBar + BadgeTag
│   ├── ConferencePage (#/conference/:id)
│   │   └── ConferenceDetail > ConferenceTimelineItem (×N)
│   ├── CityViewPage (#/cities)
│   │   ├── SearchInput + 大洲筛选 + 仅看有指南
│   │   └── CityCard / 无指南目的地列表 > CityLink（新标签页）
│   ├── LocationPage (#/cities/:id；#/location/:id 兼容重定向)
│   │   ├── AttractionList / FoodList / ClimateCard
│   │   └── 季节、语言、货币、旅行贴士、待参会与全部关联会议
│   └── WorldViewPage (#/world)
│       ├── WorldCategoryBar
│       ├── WorldMap > WorldLegend + WorldCityPanel
│       │   └── Globe.GL / Three.js > 本地矢量 / 地形底图 + 三维光点 + 原创地标
│       └── WorldTable (年份-会议二维表)
├── ScrollToTop
└── AppFooter
```

## 数据流

```
conferences.json ──→ useConferences ──→ useWorldView ──→ geoDataProcessor ──→ WorldMap / WorldTable
                                                     ├── buildCityIndex() → Map<CityKey, CityData>
                                                     └── buildYearTable() → YearTable
locations.json  ──→ useLocations ──┐
useConferences ──────────────────┴─→ useCityDirectory → buildCityDirectory
                                       └─→ CityViewPage / LocationPage / CityLink
useConferences + useCityDirectory ──→ useHomeOverview → buildHomeRanking
                                       └─→ HomePage / HomeCityRanking
home-globe.svg ──→ HomeGlobe（静态背景，不加载 Globe.GL / Three.js）
useTheme         ──→ document.documentElement (dark mode class)
useDDLStatus     ──→ ProgressBar + BadgeTag (传入日期，返回颜色/状态)
useMultiSelect   ──→ ConferenceFilters ↔ CountdownPage (选取状态共享；MultiSelectNav/CategoryGroup 未接入当前页面)
cityCoords.ts    ──→ geoDataProcessor (经纬度查询，纯数据层)
world-land.geojson + 地形 WebP ──→ createConferenceGlobe → globeBasemap / globeLandscape（本地矢量陆地、地形、国界，无外部地图 API）
```

## 城市模块

`buildCityDirectory` 按规范化的城市与国家合并旅行指南和全部会议年份，排除线上及未公布地点，不依赖地图坐标或 `location_id`。指南沿用既有 ID，其余目的地生成城市与国家地址 ID；`CitySummary`、`CityConference` 是 `src/types/location.ts` 中的展示层派生类型，源 JSON 与 Schema 不变。

城市目录查询参数 `q`、`continent`、`guide=1` 由路由保存筛选状态。`CityLink` 供会议卡片、时间轴、世界年表和城市面板共用，新标签页进入城市详情。世界画布选中与年表地图定位按钮继续使用原有地图事件，不承担页面跳转。

## 首页模块

`useHomeOverview` 从现有会议与城市目录派生会议总数、有关联会议的实体城市数和历史举办榜。`buildHomeRanking` 只统计目录中 `type=history` 的届次，按数量降序、城市名排序，取前八城市并保留竞赛式并列名次；不改写城市目录或源 JSON。国家色稳定映射，榜单包含文字、数量、图例与空状态。

首页 `HomeGlobe` 只读导入本地正投影 SVG；世界三维引擎继续由世界路由异步加载。`HomeCityRanking` 的城市详情链接使用新标签页与 `noopener`，页面功能入口使用普通路由跳转。会议详情路由仍为 `#/conference/:id`，城市详情与旧地址重定向不变；主导航分别将详情归属 Conference 与 City。

## 三层解耦（铁则）

```
src/       → 只读 import JSON，不修改数据
data/      → 纯 JSON，无逻辑
scripts/   → 读写 data/，不访问 src/
```

跨层直接调用禁止。

> 版本：v0.3.0 | 2026-05-30
