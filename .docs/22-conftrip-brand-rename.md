# 22 — ConfTrip 品牌改名

2026-10-21，用户确认品牌大小写为 **ConfTrip**；程序后台新标识采用小写 `conftrip`。

## 展示范围

- 页头、页脚、首页链接的可访问名称、浏览器标题及描述统一使用 ConfTrip。
- 中英文 README、项目与设计文档同步新名称；保留既有地图图标与视觉风格。
- npm 包名与锁文件根包名使用 `conftrip`，不变更依赖版本。
- GitHub 仓库已改为 `yinwen2019/conftrip`，仓库 ID 保持 `1254876650`，仓库简介与主页链接同步更新。

## 兼容范围

本次无需修改或迁移 D1，不执行数据库操作。以下标识继续沿用：

- Worker：`ai-travel-ddl`，API 地址仍为 `https://ai-travel-ddl.yinwen1999.workers.dev`。
- D1：`ai-travel-ddl-stats`，绑定 `DB`，既有数据库 ID 不变。
- 本地测试 Worker / D1 的原有配置。
- 浏览器社区状态键 `ai-travel-ddl:community:v1` 与统计重试队列 `ai-travel-ddl:outbox:...`，避免本地累计与待同步操作丢失。
- 正式网站继续使用 `https://aitravel.gonsun.com/`，不在本次更换域名。

Worker 与 D1 的名称是既有资源标识，不是前台品牌名。仓库改名不会改变数据库绑定；Cloudflare Builds 的 GitHub 来源需要在改名后检查是否仍跟随同一仓库，不能为改名重新创建 Worker 或 D1。

## GitHub Pages

仓库改名后，GitHub 项目站点路径会从 `/ai-travel-ddl/` 变为 `/conftrip/`，旧项目站点路径不保证重定向。自定义域名应保持 `aitravel.gonsun.com`；前端继续使用相对资源路径与 Hash 路由。

参考：[GitHub 仓库改名说明](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)。

## 执行与验证

2026-10-22 完成品牌提交 `90bf215` 并推送；GitHub Pages 部署任务 `39631063385` 成功。随后通过 GitHub API 完成仓库改名，返回同一仓库 ID；自定义域名保持 `aitravel.gonsun.com`，本地 origin 同步新地址。

前端类型检查、涉及组件的 ESLint、构建（包含数据校验）通过。桌面与 375px 手机检查确认页头、页脚、浏览器标题与可访问名称均为 ConfTrip，无页面横向溢出。README 六张界面截图从本地预览重新截取，明确说明本机模式，未向正式统计服务提交测试点击。

`wrangler.jsonc`、D1 绑定、Worker 代码和浏览器存储键均未修改。历史交付文档保留当时的旧名称，不对历史记录中的资源标识进行全局替换。
