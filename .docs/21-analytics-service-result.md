# 21 — 全站统计接入与上线

2026-10-17：Worker、D1 结构、前端接入已完成本地验证；尚未推送或部署正式服务。

## 架构与规则

GitHub Pages 继续托管 Vue 静态网站；独立 Cloudflare Worker 负责统计 API，D1 保存累计总数，不修改 data/ 的会议和城市资料。无需登录，也不判断访客唯一性。

- 点赞、承办期待、城市／会议主动点击均可反复累计，每次有效动作 +1。
- 链接激活集中监听；地图选择和世界表格按钮单独适配。挂载、刷新、筛选、切年、轮播、自动路由不计数。
- 每次动作生成新事件 ID；同一请求的重试沿用 ID。D1 唯一键与触发器保证并发重试不重复累计。
- 显示服务器确认的总数；失败保留待重试状态，不假报成功，也不切换为本机总数。待同步队列仅保留当前标签页会话，最多 200 条、24 小时；关闭标签页可能丢失尚未确认的操作。
- 正式统计从零开始；此前本机点赞和投票不上传。未设置 API 的本地预览保留本机模式。
- 事件明细保留 7 天用于幂等，定时清理不会减少累计总数。没有访客身份表，不持久化 IP；内存中的分钟哈希仅用于基本限速。
- 来源校验与每实例软限速用于减少误用，不是身份认证或严格防刷；这些数值是互动次数，不能解释为独立人数。

## 已配置资源

| 项目 | 值 |
|---|---|
| Worker 名称 | ai-travel-ddl |
| D1 名称 | ai-travel-ddl-stats |
| D1 ID | 463f8ba3-3e06-498a-83d4-bf2314d9d2d8 |
| 绑定变量 | DB |
| 允许站点 | https://aitravel.gonsun.com、https://yinwen2019.github.io |

名称和 ID 来自用户确认。workers.dev 地址以 Cloudflare 部署结果为准。

## 上线顺序

1. 先将本次源代码更新推送至 GitHub；Cloudflare 无法读取尚未推送的本机文件。
2. 初始化 D1：打开数据库 `ai-travel-ddl-stats` 的 Console，执行 `services/analytics/migrations/0001_counters.sql` 全部内容。文件只创建所需表、索引、触发器，不删除旧数据。也可在已登录 Cloudflare 的本机运行 `npm run analytics:db:remote`；该命令作用于正式数据库，不能加 `--env test`。
3. Worker → Settings → Build：根目录 `/`，Build command 为 `npm run analytics:type-check && npm run analytics:prepare`，Deploy command 为 `npm run analytics:deploy`。部署 main 分支；暂不启用其他分支自动部署到同一正式服务。根目录 `wrangler.jsonc` 已明确入口与 DB 绑定，不再依赖框架自动识别，也无需升级现有 Vite。
4. 重新部署 Worker。打开部署显示的 HTTPS 地址加 `/health`，应返回 `ok: true`；`/v1/state` 应返回累计数据。若 `/health` 返回 503，优先检查数据库初始化和 DB 绑定；若无法访问域名，检查 workers.dev 是否启用。
5. GitHub 仓库 → Settings → Secrets and variables → Actions → Variables，新增 **Repository variable** `ANALYTICS_API_URL`，值为实际 Worker HTTPS 根地址（不加 `/health` 或 `/v1`）。这是公开 API 地址，不是密钥。
6. 重新运行 GitHub Pages 的 Deploy workflow，让地址写入前端构建。设置变量本身不会自动重建旧产物。
7. 正式网页点击一次点赞，刷新应保留全站总数；换浏览器可见相同总数。主动打开一个城市或会议应使对应累计 +1；刷新详情页不应增加。测试会进入正式累计，因此只做必要验收。

Worker 部署令牌仅由 Cloudflare 或本机登录管理，不能写入 `VITE_` 环境变量。增加正式域名时同步修改 ALLOWED_ORIGINS；CORS 失败不会影响静态会议浏览。

官方参考：[D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)、[Workers Builds 配置](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)。

## 本地隔离验证

Node.js 22.6+ 用于带 TypeScript 的客户端测试；Worker 工具链建议使用当前 Node.js LTS。

```bash
npm run analytics:db:local
npm run analytics:dev
# 另一终端，仅连接本地测试数据库
VITE_ANALYTICS_API_URL=http://127.0.0.1:8788 npm run dev -- --port 5174
```

开发模式拒绝向远程 API 发送统计；test 环境使用独立本地 DB 名称与占位 ID，不连接正式 D1。Wrangler 包装脚本禁止加载根目录 AI 脚本的 .env。

## 验证结果

- 静态数据校验、前端生产构建、前后端类型检查与相关代码 ESLint 通过。
- 正式配置 dry-run 打包成功，绑定为已确认的 DB，无远程发布。
- 73 个城市 ID 与前端目录完全一致，会议白名单 13 个。
- 真实本地 D1 测试：重复事件并发只 +1，不同事件连续累计；冲突 ID、假实体、过期请求、任意增量、非法来源被拒绝；清理事件不减少总数。
- 客户端测试：失败不虚增、相同 ID 重试、丢失响应不重复累计、恢复待同步请求、旧读取不降低总数。
- 浏览器联调：连续点赞、键盘点赞、承办期待、会议链接统计和详情刷新不重复计数通过。

尚待正式环境完成：数据库建表、Worker 发布、GitHub 变量配置、Pages 重建与正式验收。
