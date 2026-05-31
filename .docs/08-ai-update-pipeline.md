# 08 — AI 数据更新管线

## 触发方式

- **手动**：`python scripts/update_conferences.py`（需 `.env` 中的 API Key）
- **自动**：GitHub Actions cron 每周一 UTC 00:00，或 `workflow_dispatch` 手动触发

## API 选型

推荐 Perplexity API（兼容 OpenAI SDK），模型 `llama-3.1-sonar-large-128k-online`，自带联网搜索。

备选：OpenAI SDK + 自行集成搜索 API。

环境变量：`PERPLEXITY_API_KEY` 或 `OPENAI_API_KEY`，可选 `AI_API_BASE_URL` / `AI_MODEL`。

## 搜索策略

逐会议搜索，每会议一次 API 调用。搜索内容：举办地、DDL（含时区）、审稿日期、会期、官网。仅限当年及未来年份。

## 处理流程

```
1. 读取旧 conferences.json
2. 遍历每个 conference → 构造 Prompt → 调用 AI API（含重试）
3. 解析 AI 返回的 JSON → 字段校验 → 日期标准化
4. 历史数据只读保护（year < current_year 保留旧值）
5. 按 (id, year) 去重合并 → 更新 meta.last_updated
6. 写入 JSON → 调用 validate.mjs 校验
7. 校验失败 → 回滚旧数据，记错误日志
8. 写入运行日志到 scripts/update_logs/
```

## Prompt 要点

- System prompt：要求严格 JSON 输出，日期 ISO 8601，时区 IANA 格式，国家名全称
- User prompt：按模板填充会议名、全称、id、当前年份、已知官网
- 输出结构：`{ id, history: [...], upcoming: [...] }`

## 增量更新规则

- 唯一键：`(conference.id, entry.year)`
- history（year < current_year）：保留旧数据，只读保护
- upcoming（year >= current_year）：以新数据为准
- AI 脚本不主动删除数据
- 合并后 `meta` 记录 `last_ai_run` 和 `ai_run_summary`

## 重试与容错

- 网络请求：指数退避，最大 3 次（2s → 4s → 8s），429/5xx/超时可重试
- JSON 解析失败：保留旧数据，该会议标记 `status: "retained"`
- 部分字段缺失：写入但标记 `status: "partial"`
- 连续 3 次 workflow 失败：创建 issue 标记

## 脚本结构

```
scripts/
├── update_conferences.py      # 主入口
├── requirements.txt           # openai, requests, python-dotenv
├── update_logs/               # JSON Lines 日志
└── lib/
    ├── api_client.py          # API 调用 + 重试
    ├── prompt_builder.py      # Prompt 构造
    ├── parser.py              # 响应解析 + 字段校验
    ├── merger.py              # 合并 + 去重 + 只读保护
    ├── validator.py           # 调用 validate.mjs
    └── logger.py              # JSON Lines 日志
```

> 版本：v0.2.0 | 2026-05-14
