# 16 — 首页交付记录

> 2026-10-15 · 对应 REQ-A01、REQ-C19。记录本地实现与验证；提交与部署状态以 Git 历史及 GitHub Actions 为准。

## 实现范围

- 默认 `#/` 为 HomePage；原会议行页移至 `#/conference`（name: countdown）。会议详情 `#/conference/:id`、城市地址及兼容重定向不变。主导航顺序为 Home、World、Conference、Year、City，详情保持所属入口高亮。
- 首页左侧为「从一场会议，出发看世界。」、简介、World 主入口、Conference 次入口与派生覆盖数；右侧为本地静态正投影地球背景与历史线下城市前八榜；底部为四个无框功能入口，手机排为 2×2。最终桌面主区实测高度 543.84px，地球宽 540px。
- `useHomeOverview`、`buildHomeRanking` 共用城市目录的实体地点与重音合并规则，只读派生数据。当前覆盖 13 个会议、72 座有关联会议的实体城市；前八数量为 8、6、5、5、5、4、4、4，名次为 1、2、3、3、3、6、6、6。数字是当前数据快照，页面未硬编码。榜单排除线上与未来届次，提供空状态、统计口径和国家图例。
- 城市行使用新标签页与 `noopener`；主导航、主次按钮、全部城市与门户同页切换。手机五项主导航位于第二行；窄屏各项宽度可随文字最小宽度变化。
- 全站共享变量采用已确认的冷蓝灰方向，保留 Avenir Next / Segoe UI / PingFang SC / Microsoft YaHei 系统字体栈。DDL、分类颜色未改，World 三维场景保留独立既有配色。
- 地球使用本地 SVG，首页不加载 Three.js、外部地图、字体或运行时 GSAP。简介 760ms、地球 1100ms 入场只运行一次；减少动态效果偏好下不播放。资源来源保留在 `src/assets/maps/README.md`。

## 验证结果

本轮实现阶段已通过 `npm run type-check`、src ESLint、`npm run build`（含 JSON validate）与 `git diff --check`。数据断言覆盖数量、并列名次、重音合并、空榜与源数据未修改。

浏览器检查覆盖 1440px 桌面、768px 平板、375px 与 320px 手机及 1440px 深色主题，无页面横向溢出。五项主导航均可到达；会议页显示 13 行，会议与城市详情正确高亮；Vancouver 城市链接已实际打开新标签页；键盘焦点为 2px 可见轮廓，浏览器无错误。

截图位于 `.impeccable/review/desktop.png`、`mobile.png`、`narrow.png`、`tablet.png`、`dark.png`；截图后未改动首页实现。

## 文档与审阅

已新增根目录 PRODUCT.md、DESIGN.md、`.impeccable/design.json` 与首页 surface brief，持久化已确认的产品、视觉、组件和首页方向；同步需求、架构、UI 基线与 AGENTS 中的首页路由及结构事实。此文档补齐过程未修改 src、data、scripts 或依赖，未执行提交等 Git 写操作。

文档检查已确认 sidecar 为 schemaVersion 2、颜色值与当前 CSS 一致、组件属性符合 frontmatter 范围、叙述与 DESIGN.md 同源，`git diff --check` 通过。

完整视觉与响应式审阅没有发现实质缺陷，最初唯一 finding 为产品与设计方向未持久化。文档补齐后的复核确认该 finding 已解决，最终 disposition 为 **ship**；此次结论仅针对文档持久化修复，沿用前次视觉审阅证据，不表示额外一轮全面视觉检查。

## 保留边界

现有校验仍提示当前年份 history 和未来投稿 DDL 为空的非阻断警告；构建仍提示异步 3D chunk 较大。未因此修改源数据或扩大本轮范围。

context launcher 曾因权限拒绝未运行，随后读取项目既有 `.docs`；没有正式概念 seed、QUALITYBAR、card 或生成的 decision comp。已确认原型位于 `/Users/vanesky/.codex/visualizations/2026/10/15/01a13eef-73fb-70a1-b038-4a792ba4ef1f/homepage-direction/atlas-homepage.html`，后续确认与当前代码优先于原型旧尺寸。上述为流程证据边界，不进入产品页面文案。
