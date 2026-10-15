# 01 — 功能需求

> 版本：v0.3.0 | 2026-05-30

> 本文描述需求目标，不代表全部已实现；2026-10-14 的实现偏差见 [UI 审阅记录](./10-ui-audit.md)，未通过修改需求来掩盖缺陷。

需求编号格式：`REQ-{模块}{序号}`，模块 A=数据展示 B=数据管理 C=UI交互 D=本地开发 E=部署。优先级 P0=必须 P1=优先 P2=二期。

---

## 模块 A：会议数据展示

### REQ-A01 — 三视图切换 [P0]

- **会议维度视图**：以会议名称为列。每选取一个会议增加一列，卡片按年份降序，优先展示「未开始」或「已发布但未截稿」的实例。展示未来年份（如 AAAI 2026 已召开则展示 AAAI 2027）
- **年份视图**：以年份分组，展示所选年份所有会议的卡片网格，含多节点倒计时进度条
- **世界视图**：地图与年份-会议二维表，详见 REQ-C10～C17
- 默认展示会议维度视图

### REQ-A02 — 历史数据字段 [P0]

缺失字段显示「待公布」。字段：year, city, country, continent, venue?, url?

### REQ-A03 — upcoming 数据字段 [P0]

包含 A02 字段 + abstract_ddl, paper_ddl, notification_date, camera_ready, start_date, end_date。可包含未来多年数据。字段未知时保留键并使用 `null` 或空数组表示「待公布」。

### REQ-A04 — DDL 紧迫度颜色 [P0]

| 状态 | 条件 | 颜色 |
|---|---|---|
| 已过期 | DDL < 今天 & 会议已结束 | `#9CA3AF` |
| 旅等 | DDL 已截止 & 会议未开始 | `#6366F1` |
| 紧迫 | ≤ 7 天 | `#EF4444` |
| 临近 | ≤ 30 天 | `#F59E0B` |
| 充裕 | > 30 天 | `#10B981` |

多 DDL 取最早日期判定。Travel 状态下隐藏举办地信息，展示距离开会倒计时。

### REQ-A05 — 字段缺失降级 [P0]

缺失字段显示「待公布」，不中断渲染、不报错、不显示空白。

### REQ-A06 — 会议搜索 [P1]

按会议名称（含别名、全称）实时筛选，大小写不敏感，两种视图均生效。

### REQ-A07 — 年份切换 [P1]

年份视图提供横向 Tab 年份选择器，年份范围从数据动态计算。

### REQ-A08 — 多级联动分类导航 [P0]

会议维度视图左侧导航，两级结构（5 个父分类 → 子级会议）：
- 父级联动：勾选父级 → 全选子级；取消父级 → 全清子级
- 半选状态：部分子级选中时父级显示 indeterminate
- 独立选取：不勾父级直接勾子级 → 仅加该会议
- 未选取任何会议时，默认显示所有会议列

### REQ-A09 — 列自适应宽度 [P0]

单列 min 280px / max 400px。列宽 = 容器宽度 / 列数。溢出时横向滚动。移动端单列全宽滑动。过渡动画 300ms。

### REQ-A10 — 倒计时动态进度条 [P0]

年份视图卡片含多节点进度条：`现在 → 摘要截止 → 正文截止 → 开会 → 结束`。
- 已过节点：灰色实心；当前阶段：紧迫度着色；未来节点：空心
- 未过期节点显示相对天数，已过期显示「已截止 X 天」
- 会议已结束：全灰 + opacity-60 +「已结束」标签
- 节点数据缺失：跳过该节点；全部缺失：显示「日期待公布」

---

## 模块 B：数据管理

### REQ-B01 — 静态 JSON 数据源 [P0]

所有数据在 `data/conferences.json`，构建时 ES import 注入，无后端 API。

### REQ-B02 — AI 数据更新脚本 [P1]

`scripts/update_conferences.py`，调用 AI API 搜索最新会议信息，结构化写回 JSON。详见 08-ai-update-pipeline.md。

### REQ-B03 — 构建前校验 [P0]

`npm run build` 先校验 conferences.json + locations.json，失败终止构建。

### REQ-B04 — 手动校验 [P0]

`npm run validate` 仅执行 JSON Schema 校验。

### REQ-B05 — Git 版本管理 [P1]

conferences.json + locations.json 纳入 Git，每次更新附带明确 commit。

### REQ-B06 — 地点数据管理 [P1]

`data/locations.json` 存储城市旅游百科：气候、美食、景点、旅行贴士。通过 location_id 与会议关联。

---

## 模块 C：UI 交互与导航

### REQ-C01 — 会议维度视图：会议卡片列 [P0]

多列布局，每列一个会议。列内卡片按年份降序（未来/进行中在前，已结束在后）。卡片展示：全称、年份、举办地（地点文本使用渐变链接，新标签页打开地点详情）、官网外链（优先使用该年份 `url`）、最近 DDL + 紧迫度色条、分类标签、相对天数。

### REQ-C02 — 年份视图：卡片网格 + 进度条 [P0]

响应式网格（移动端 1 列 / 平板 2 列 / 桌面 3 列 / 宽屏 4 列）。卡片含多节点进度条。排序：最紧迫未过期 DDL 在前，已结束在后。

### REQ-C03 — 会议详情页 [P2]

`#/conference/:id`，时间轴展示单会议所有年份（history + upcoming）。

### REQ-C04 — 多级联动导航 [P0]

桌面端：左侧竖向多选面板。移动端：顶部 chip + BottomSheet。

### REQ-C05 — 响应式布局 [P0]

三档断点：≥1024px / 768–1023px / <768px。

### REQ-C06 — 深色/浅色模式 [P0]

跟随系统偏好，手动切换持久化到 localStorage。切换无闪烁。

### REQ-C07 — 加载与空状态 [P0]

首次加载：骨架屏。数据为空：EmptyState。筛选无结果：EmptyState + 清除按钮。导航未选取：显示所有会议列。

### REQ-C08 — 返回顶部按钮 [P2]

滚动超过一屏显示。

### REQ-C09 — 地点旅游百科页 [P1]

`#/location/:id`，展示城市气候（12 月温度/降水）、美食、景点、旅行贴士。会议卡片中的地点文本链接以新标签页打开该详情页，正常详情页不提供返回按钮，底部自动关联曾在此举办的会议。

### REQ-C10 — 世界视图页面 [P1]

`#/world` 路由，集成 Three.js / Globe.GL 三维地球与年份-会议二维表。地球在上、年表在下；提供页面全屏、城市定位、缩放、复位、动画暂停和地标显示开关。桌面场景高度为 clamp(530px, 74svh, 820px)，手机为 560px，全屏为 100dvh。支持真实加载占位、空状态与失败重试。2026-10-14 经用户确认将原二维地图升级为科技感地球，保留既有会议展示逻辑。

### REQ-C11 — 世界地图光点 [P1]

基于 Three.js / Globe.GL + 本地静态 GeoJSON 绘制球面、连续陆地色块与国界，使用简洁矢量底图（A）；2026-10-15 经用户查看效果后移除地形底图（B）及切换开关；2026-10-14 经用户确认取消大陆点阵。以球面三维光点标示举办城市。光点核心大小按该城市累计举办场次分 5 档（1/2-3/4-6/7-10/11+ 场）。仅历史举办地点使用灰色；包含 upcoming 的地点按 upcoming 会议分类着色（CV 红、NLP 紫、ML 绿、AI 蓝、DM 橙），与分类筛选栏和年表列头颜色一致。若同一城市存在多个 upcoming 会议，使用最早 upcoming 年份对应会议的分类色。世界视图运行时不得依赖外部地图 API 或第三方瓦片服务。地标按缩放逐步出现，首版包含巴黎、悉尼、西雅图、新加坡的原创几何模型，注明是城市意象而非会议场馆；其他城市仍自动生成普通光点。

### REQ-C12 — 地图 Tooltip 交互 [P2]

Hover 光点显示城市名称、国家与累计场次预览。点击后显示可关闭的会议信息面板（会议列表含年份与类型、upcoming 条目的当前阶段日期）。upcoming 阶段优先显示最早未截止的 `Abstract` 或 `Submission`；投稿 DDL 均截止但会议尚未结束时显示 `Travel` 与开会日期。点击光点或选择城市后地球转向对应经纬度；再次点击同一光点关闭。背面点由球体遮挡。城市选择器与年表按钮提供键盘等价入口。

### REQ-C13 — 地图图例 [P1]

地球左下角图例按钮展开颜色说明（历史举办 + 各分类即将举办）与五档大小说明。分类色与筛选栏/年表列头一致，历史点为灰蓝；场景使用固定深色科技感配色，周边页面继续适配深浅主题。呼吸只改变外围光晕，核心保持统计大小；提供暂停，遵循减少动态效果偏好，离屏或后台暂停渲染。

### REQ-C14 — 年份-会议二维表 [P1]

地图下方的年表：年份列 sticky 左固定、降序排列；会议列按 CV→NLP→ML→AI→DM 分组并组内字母序。单元格展示「城市 + 国旗」或无数据「—」，完整「城市, 国家」保留在 title tooltip。upcoming 行橙色背景。列头带分类颜色指示圆点。

### REQ-C15 — 地图-表格联动 [P2]

表格单元格 Hover → 对应城市光点放大 1.5 倍；表格列头点击 → 地球根据该会议城市范围调整视角；同一球面无法同时显示正反两面，全球分布时保留远景。年表城市按钮点击 → 转向对应城市并打开详情。地图光点点击固定 → 表格无需自动滚动。

### REQ-C16 — 分类筛选联动 [P1]

页面顶部 WorldCategoryBar（5 个分类 chip 按钮）控制表格列的显隐。至少保留一个活跃分类。筛选项不影响地图光点（地图始终展示全量城市）。

### REQ-C17 — 地图错误降级 [P1]

坐标缺失：跳过该城市光点，`console.warn` 一次。WebGL 不可用、上下文丢失或本地世界轮廓加载失败：显示三维地球不可用提示与重试按钮，年表始终可用。全部坐标缺失：隐藏地图，仅显示表格与提示横幅。

---

## 模块 D：本地开发

### REQ-D01 — Vite Dev Server [P0]

`:5173`，HMR 热更新。

### REQ-D02 — 构建命令 [P0]

`npm run build`：校验 → 构建 → dist/。

### REQ-D03 — 校验命令 [P0]

`npm run validate`：JSON Schema 校验。

### REQ-D04 — AI 脚本本地运行 [P1]

`python scripts/update_conferences.py`，读取 `.env`。

---

## 模块 E：部署

### REQ-E01 — GitHub Actions 自动部署 [P0]

Push main → deploy.yml（checkout → install → validate → build → deploy to gh-pages）。

### REQ-E02 — 定时维护 upcoming 会议数据 [P1]

GitHub Actions 定时运行 AI 数据更新脚本（`scripts/update_conferences.py`），自动维护 `data/conferences.json` 中每个会议的 upcoming 条目。脚本职责：

- 将已经结束的 upcoming 转为 history。
- 当某会议没有 active upcoming 时，根据会议周期（`schedule.frequency`）创建下一届 upcoming。
- 对字段不完整的 upcoming 联网查询并更新。
- 没有实际 JSON diff 时不提交 commit、不创建 PR。
- 有数据变化时创建 Pull Request，人工审核后合并。

#### 核心规则

- 脚本只主动创建或更新 `type="upcoming"` 的条目。
- 唯一允许修改非 upcoming 状态的行为：当 upcoming 会议已经结束时，将 `type` 从 `"upcoming"` 改为 `"history"`（归档）。
- 历史条目的地点、DDL、官网等字段不由 AI 自动改写。
- “过期”指会议 `end_date` 已早于 `today`，**不是** DDL 截止。
- DDL 已截止但会议尚未结束时仍保持 upcoming，用于 Travel 状态展示。
- `end_date` 缺失的 upcoming 不自动归档。

#### active upcoming 定义

`type="upcoming"` 且（`end_date` 缺失或 `end_date >= today`）。

#### 下一届创建规则

- `annual`：`next_year = last_known_year + 1`
- `biennial`：`next_year = last_known_year + 2`
- `irregular`：使用 `schedule.next_expected_year`；未配置则不自动创建。
- 无 `schedule` 时默认 `annual`。
- 创建的占位条目包含前端会读取的 upcoming 字段；未知字符串/日期字段使用 `null`，DDL 列表使用空数组，不写假地点。

#### 已有 upcoming 查询规则

- 新创建的 upcoming 需要查询（通常为占位条目）。
- 任意 upcoming 只要关键字段不完整就需要查询补全。
- 任意 upcoming 只要关键字段完整就不查询，避免浪费 AI/API 资源。

#### 关键字段完整定义

一个 upcoming 视为「关键字段完整」当且仅当以下全部满足：

- `city`、`country`、`continent` 均存在
- `start_date`、`end_date` 均存在
- `url` 或 `conference.website` 至少存在一个
- 至少存在一个 `paper_ddl` 或 `abstract_ddl` 条目
- 每个 DDL entry 都有 `date` 和 `timezone`

#### 运行摘要

脚本在 `meta` 中记录本次运行的 `archived / created / queried / skipped / updated` 计数。

### REQ-E03 — 构建失败通知 [P2]

CI 失败通过 GitHub 原生通知。

---

## 需求矩阵

| 编号 | 模块 | 名称 | 优先级 |
|---|---|---|---|
| REQ-A01 | 展示 | 三视图切换 | P0 |
| REQ-A02 | 展示 | 历史数据字段 | P0 |
| REQ-A03 | 展示 | upcoming 数据字段 | P0 |
| REQ-A04 | 展示 | DDL 紧迫度颜色 | P0 |
| REQ-A05 | 展示 | 字段缺失降级 | P0 |
| REQ-A06 | 展示 | 会议搜索 | P1 |
| REQ-A07 | 展示 | 年份切换 | P1 |
| REQ-A08 | 展示 | 多级联动导航 | P0 |
| REQ-A09 | 展示 | 列自适应宽度 | P0 |
| REQ-A10 | 展示 | 倒计时进度条 | P0 |
| REQ-B01 | 数据 | 静态 JSON 数据源 | P0 |
| REQ-B02 | 数据 | AI 更新脚本 | P1 |
| REQ-B03 | 数据 | 构建前校验 | P0 |
| REQ-B04 | 数据 | 手动校验 | P0 |
| REQ-B05 | 数据 | Git 版本管理 | P1 |
| REQ-B06 | 数据 | 地点数据管理 | P1 |
| REQ-C01 | UI | 会议维度视图卡片列 | P0 |
| REQ-C02 | UI | 年份视图卡片网格 | P0 |
| REQ-C03 | UI | 会议详情页 | P2 |
| REQ-C04 | UI | 多级联动导航 | P0 |
| REQ-C05 | UI | 响应式布局 | P0 |
| REQ-C06 | UI | 深色/浅色模式 | P0 |
| REQ-C07 | UI | 加载与空状态 | P0 |
| REQ-C08 | UI | 返回顶部 | P2 |
| REQ-C09 | UI | 地点旅游百科页 | P1 |
| REQ-C10 | UI | 世界视图页面 | P1 |
| REQ-C11 | UI | 世界地图光点 | P1 |
| REQ-C12 | UI | 地图 Tooltip 交互 | P2 |
| REQ-C13 | UI | 地图图例 | P1 |
| REQ-C14 | UI | 年份-会议二维表 | P1 |
| REQ-C15 | UI | 地图-表格联动 | P2 |
| REQ-C16 | UI | 分类筛选联动 | P1 |
| REQ-C17 | UI | 地图错误降级 | P1 |
| REQ-D01 | 开发 | Dev Server | P0 |
| REQ-D02 | 开发 | 构建命令 | P0 |
| REQ-D03 | 开发 | 校验命令 | P0 |
| REQ-D04 | 开发 | AI 脚本本地运行 | P1 |
| REQ-E01 | 部署 | 自动部署 | P0 |
| REQ-E02 | 部署 | 定时维护 upcoming 数据 | P1 |
| REQ-E03 | 部署 | 构建失败通知 | P2 |
