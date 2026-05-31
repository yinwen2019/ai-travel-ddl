# 02 — 技术栈

| 层 | 技术 | 版本 | 说明 |
|---|---|---|---|
| 前端框架 | Vue 3 (Composition API, `<script setup>`) | ≥3.4 | 数据驱动多视图展示 |
| 类型系统 | TypeScript | ≥5.0 | strict mode |
| 构建工具 | Vite | ≥5.0 | HMR + 生产构建 |
| CSS | Tailwind CSS | 3.4.x | `darkMode: 'class'`, 原子化样式 |
| 路由 | Vue Router (Hash mode) | ≥4.0 | `createWebHashHistory`，兼容 GitHub Pages |
| 数据格式 | JSON | — | 构建时 import，不 fetch |
| 数据校验 | Ajv | ≥8.0 | JSON Schema 校验 |
| 代码检查 | ESLint + Prettier | — | 格式化 + 规范检查 |
| AI 脚本 | Python + OpenAI SDK | ≥3.11 | 兼容 Perplexity / OpenAI API |
| 部署 | GitHub Pages + Actions | — | `peaceiris/actions-gh-pages` |

### 关键决策

- **不用 Pinia/Vuex**：数据流简单（JSON → composable → 组件），`provide/inject` + `computed` 足够
- **不用 SSR/SSG 框架**：纯静态 JSON 驱动，Vite 构建产物直接部署
- **Hash 路由**：GitHub Pages 不支持服务端重写，必须 `createWebHashHistory`
- **JSON 构建时内联**：不需独立 API 服务器，更新频率为周级别，重新构建即可
- **世界底图本地化**：世界视图使用仓库内静态 GeoJSON 底图，不依赖外部地图 API 或第三方瓦片服务

> 版本：v0.2.0 | 2026-05-14
