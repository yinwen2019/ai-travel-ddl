# Analytics Worker

独立 Cloudflare Worker + D1 全站累计服务。部署步骤与产品口径见 [完整接入说明](../../.docs/21-analytics-service-result.md)。

入口 `src/index.ts`；正式绑定位于仓库根目录 `wrangler.jsonc`；SQL 在 `migrations/0001_counters.sql`。

- `npm run analytics:prepare`：从静态资料生成实体白名单。
- `npm run analytics:type-check`：Worker 类型检查。
- `npm run analytics:client-test`：客户端重试与累计测试。
- `npm run analytics:test`：临时本地 D1 并发与接口集成测试，不写正式库。
- `npm run analytics:db:local` / `npm run analytics:dev`：本地 test 环境。
- `npm run analytics:db:remote`：在已登录账户初始化正式库。
- `npm run analytics:deploy`：发布正式 Worker，不负责发布 GitHub Pages。

GET `/health`、`/v1/state`；POST `/v1/support`、`/v1/expectations/:cityId`、`/v1/clicks`。每次 POST 需要 UUID v4 `eventId` 与 毫秒时间戳 `createdAt`；clicks 还需要 `entityType`、`entityId`。仅接受配置来源与现有实体，所有增量由服务器固定为 1。
