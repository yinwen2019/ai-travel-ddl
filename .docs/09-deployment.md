# 09 — 部署规范

## 本地开发

### 环境要求

Node.js 18+ / npm 9+，Python 3.11+（仅 AI 脚本）。

### 初始化

```bash
npm install
npm run dev           # → localhost:5173
cp .env.example .env  # 填入 API Key（AI 脚本用）
pip install -r scripts/requirements.txt
```

### npm scripts

| 命令 | 行为 |
|---|---|
| `npm run dev` | Vite Dev Server + HMR (:5173) |
| `npm run build` | validate → vite build → dist/ |
| `npm run preview` | 预览构建产物 (:4173) |
| `npm run validate` | JSON Schema 校验 |
| `npm run lint` | ESLint + fix |
| `npm run format` | Prettier 格式化 |
| `npm run type-check` | vue-tsc --noEmit |

## GitHub Pages 部署

### 仓库设置

- Settings → Pages → Source: `gh-pages` branch
- Settings → Secrets → Actions: 添加 `PERPLEXITY_API_KEY`（AI 更新用）

### deploy.yml 流程

```
push to main → checkout → npm ci → npm run validate → npm run build
→ peaceiris/actions-gh-pages@v3 (deploy dist/ to gh-pages branch)
```

仅 `src/`, `data/`, `public/`, `index.html`, `package.json`, `vite.config.ts` 变更时触发。

### Vite base path

- 本项目使用 Hash 路由，推荐 `base: './'`，让 JS/CSS/本地 GeoJSON 等静态资源按当前 GitHub Pages 路径相对加载
- 若未来切换到非 Hash 路由或需要固定 CDN 根路径，再按部署位置显式设置：用户站点 (`username.github.io`) 用 `base: '/'`，项目站点 (`username.github.io/repo`) 用 `base: '/repo/'`

配置错误会导致 JS/CSS/本地地图资源 404。

### 首次部署检查

- [ ] `vite.config.ts` 中 `base` 已正确配置
- [ ] `package-lock.json` 已提交
- [ ] `npm run build` + `npm run validate` 本地通过
- [ ] Vue Router 使用 `createWebHashHistory`
- [ ] 世界视图底图资源已随构建产物发布，不依赖外部地图 API
- [ ] `.env` 在 `.gitignore` 中

## Workflow 文件

| 文件 | 用途 | 触发 |
|---|---|---|
| `.github/workflows/deploy.yml` | 构建 + 部署 | push to main / manual |
| `.github/workflows/update-data.yml` | AI 数据更新 + 创建 PR | cron weekly / manual |

> 版本：v0.2.0 | 2026-05-14
