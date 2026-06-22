# 08 — AI 数据更新管线

## 触发方式

- **手动**：`python scripts/update_conferences.py`（需 `.env` 中的 API Key）
- **自动**：GitHub Actions cron 每周一 UTC 00:00，或 `workflow_dispatch` 手动触发

## API 选型

推荐 Perplexity API（兼容 OpenAI SDK），模型 `llama-3.1-sonar-large-128k-online`，自带联网搜索。

备选：OpenAI SDK + 自行集成搜索 API。

环境变量：`PERPLEXITY_API_KEY` 或 `OPENAI_API_KEY`，可选 `AI_API_BASE_URL` / `AI_MODEL`。

## 搜索策略

**逐个 upcoming 条目按需查询**，而非逐会议搜索。仅对「关键字段不完整」的 active upcoming
发起一次 API 调用；关键字段完整的 upcoming 直接跳过，避免浪费 API 资源。是否查询**只看
字段完整性**。查询内容：该届举办地、DDL（含时区）、审稿/会期/官网。

## 处理流程

详见 `.docs/01-requirements.md` REQ-E02，核心步骤：

```
A. 读取 conferences.json（深拷贝原始数据以备回滚）
B. 归档已结束 upcoming：type=upcoming 且 end_date<today → type 改为 history（保留 DDL）
C. 检查每个 conference 是否有 active upcoming
   active = type=upcoming 且（end_date 缺失或 end_date>=today）
D. 无 active upcoming 时按 schedule 创建下一届占位：
   annual→last+1, biennial→last+2, irregular→next_expected_year（无则跳过）
   占位包含前端读取的 upcoming 字段，未知字段为 null/空数组，不写假地点
E. 判定需查询的 upcoming：新创建的 或 关键字段不完整
F. 对需查询的 upcoming 调用 AI API（含重试），要求只返回该届 JSON
G. 合并：只合并到对应 upcoming；AI 空值不覆盖已有非空值；非空新值覆盖旧值
H. 有数据变更（archived+created+updated>0）时更新 meta.last_updated / last_ai_run / ai_run_summary
I. 写回 JSON → 运行 npm run validate；失败则回滚原始数据并退出非零
   无数据变更时不写文件（不产生 git diff → workflow 不创建 PR）
```

关键字段完整定义：city / country / continent / start_date / end_date 均存在，
url 或 conference.website 至少一个存在，至少一个非空 abstract_ddl/paper_ddl，
且每个 DDL entry 都有 date + timezone。

## Prompt 要点

- System prompt：要求严格 JSON 输出，日期 ISO 8601，时区 IANA 格式，国家名英文全称；
  不确定字段必须省略，禁止编造；只返回请求的 conference+year。
- User prompt：填充会议名、全称、id、目标年份、已知官网与该届已有字段。
- 输出结构：单个 JSON 对象，键为 city/country/continent/venue/url/start_date/end_date/
  notification_date/camera_ready/abstract_ddl/paper_ddl（不确定的键省略）。

## 增量更新规则

- 脚本只主动创建或更新 `type="upcoming"` 的条目。
- 唯一允许改非 upcoming 的行为：upcoming 已结束时 type 改为 history（归档）。
- history 的地点/DDL/官网等字段不由 AI 改写。
- “过期”指 end_date<today，不是 DDL 截止；DDL 截止但会议未结束仍保持 upcoming（Travel）。
- end_date 缺失的 upcoming 不自动归档。
- AI 空值不覆盖已有非空值；upcoming 非空新值以 AI 为准。
- 合并后 `meta` 记录 `last_ai_run` 与 `ai_run_summary`
  （archived/created/queried/skipped/updated 计数）。

## 重试与容错

- 网络请求：指数退避，最大 3 次（2s → 4s → 8s），429/5xx/超时可重试。
- 非重试型 HTTP 错误 / 响应解析失败：等价于无新数据，该 upcoming 保持原状。
- `npm run validate` 失败：回滚到运行前的原始数据，脚本退出非零（workflow 不创建 PR）。
- 无 API Key：使用 NullClient（跳过查询），仍执行归档与创建。

## 脚本结构

```
scripts/
├── update_conferences.py      # 主入口（run() 可注入 client，便于测试）
├── requirements.txt           # requests, python-dotenv
├── conftest.py                # pytest 路径配置
├── tests/test_update.py       # 核心逻辑单测（21 项）
├── update_logs/               # JSON Lines 日志 + latest_run.md（gitignored）
└── lib/
    ├── dates.py               # 日期/时间工具
    ├── completeness.py        # active upcoming + 关键字段完整性判定
    ├── schedule.py            # 会议周期与下一届年份
    ├── prompt_builder.py      # Prompt 构造
    ├── parser.py              # 响应解析 + 字段校验
    ├── merger.py              # 合并（不覆盖非空值）
    ├── api_client.py          # 联网 API 调用 + 重试（依赖 requests，延迟导入）
    ├── validator.py           # 调用 npm run validate
    └── logger.py              # JSONL 日志 + Markdown 摘要
```

> 版本：v0.3.0 | 2026-06-22
