# 04 — 数据 Schema 定义

## conferences.json

### 顶层结构
```json
{
  "meta": { "version", "last_updated", "description?", "data_source?", "last_ai_run?", "ai_run_summary?" },
  "conferences": [ ... ]
}
```

`ai_run_summary`（由 AI 更新脚本写入）：`{ archived, created, queried, skipped, updated }` 五个非负整数计数。

### conference 对象

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | 唯一标识，小写 `"neurips"` |
| name | string | 是 | 缩写 `"NeurIPS"` |
| full_name | string | 是 | 全称 |
| category | enum | 是 | `"CV"` / `"NLP"` / `"ML"` / `"AI"` / `"DM"` |
| subcategory | string | 否 | 子分类 |
| aka | string[] | 否 | 历史别名 |
| website | string | 否 | 官网 |
| schedule | object | 否 | 会议周期，见下方 schedule；缺失时脚本默认 annual |
| years | array | 是 | 历年举办信息（统一列表，按 year 升序） |

### schedule 对象

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| frequency | enum | 是 | `"annual"` / `"biennial"` / `"irregular"` |
| next_expected_year | number | 否 | 仅 `irregular` 使用；缺失则不自动创建下一届 |

### yearEntry 对象

每个年份条目包含一个 `type` 字段区分历史与未来：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| year | number | 是 | 举办年份，1900–2100 |
| type | enum | 是 | `"history"`（year < 当前年份）/ `"upcoming"`（year >= 当前年份） |
| city | string | history 必填 / upcoming 可选 | 举办城市 |
| country | string | history 必填 / upcoming 可选 | 国家全称 |
| continent | enum | history 必填 / upcoming 可选 | `"Asia"` / `"Europe"` / `"North America"` / `"South America"` / `"Africa"` / `"Oceania"` |

> 条件必填：JSON Schema 用 `if/then` 实现 —— `type=="history"` 时 city/country/continent 必填；
> `type=="upcoming"` 时允许缺失（占位条目，由 AI 脚本后续补全，见 REQ-E02）。
| venue | string | 否 | 场馆名称 |
| url | string | 否 | 该届会议链接 |
| location_id | string | 否 | 关联 locations.json 的外键 |

**仅 upcoming 条目的额外字段：**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| abstract_ddl | DDLEntry[] | 否 | Abstract 截止日期列表 |
| paper_ddl | DDLEntry[] | 否 | Full Paper 截止日期列表 |
| notification_date | string | 否 | 录用通知日期 ISO 8601 |
| camera_ready | string | 否 | Camera-ready 截止日期 |
| start_date | string | 否 | 会议开始日期 |
| end_date | string | 否 | 会议结束日期 |

### DDLEntry

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| date | string | 是 | ISO 8601 `YYYY-MM-DD` |
| timezone | string | 是 | IANA 格式 `"America/Los_Angeles"` |
| note | string | 否 | 补充说明 |

---

## locations.json

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| id | string | 是 | `"{city}-{country}"` 小写 |
| city | string | 是 | 城市名 |
| country | string | 是 | 国家名 |
| continent | enum | 是 | 所属洲 |
| description | string | 是 | 城市简介 |
| best_season | string | 是 | 最佳旅游季节 |
| climate | object | 是 | `{ monthly: [{ month, name, avg_temp_c, avg_rainfall_mm, note }] }` |
| food | array | 是 | `[{ name, description }]` |
| attractions | array | 是 | `[{ name, description, type? }]` |
| travel_tips | string | 否 | 旅行贴士 |
| language | string | 否 | 主要语言 |
| currency | string | 否 | 货币 |
| image_url | string | 否 | 城市图片链接 |

---

## 校验规则

**阻断（错误）**：必填字段缺失、类型不匹配、id 重复、枚举值非法、日期/时区/URL 格式非法、year 超出 1900–2100

**警告（不阻断）**：无 upcoming 年份、abstract_ddl/paper_ddl 为空数组、location_id 在 locations.json 中不存在、type 与 year 不一致（history 的 year >= 当前年份或 upcoming 的 year < 当前年份）

校验时机：`npm run build`（阻断）、`npm run validate`（仅校验）、GitHub Actions CI step

---

## conference ↔ location 关联

- `location_id` 可选外键 → 匹配到 locations.json 记录时，`city, country` 文本渲染为渐变地点链接，新标签页打开地点百科页
- `url` 可选外链 → 存在时会议卡片渲染 `官网 ↗`，新标签页打开该年份第三方会议页面
- 未匹配 → 纯文本展示
- 地点百科页底部反向匹配展示曾在此举办的所有会议

> 版本：v0.3.0 | 2026-05-19
