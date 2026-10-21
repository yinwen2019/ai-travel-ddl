# 22 — ConfTrip 品牌改名

2026-10-21，用户确认品牌大小写为 **ConfTrip**；程序后台新标识采用小写 `conftrip`。

## 展示范围

- 页头、页脚、首页链接的可访问名称、浏览器标题及描述统一使用 ConfTrip。
- 中英文 README、项目与设计文档同步新名称；保留既有地图图标与视觉风格。
- npm 包名与锁文件根包名使用 `conftrip`，不变更依赖版本。
- GitHub 仓库目标名称为 `yinwen2019/conftrip`；仓库改名及远端状态在完成后记录。

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
