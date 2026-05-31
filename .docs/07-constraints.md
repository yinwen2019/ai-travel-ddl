# 07 — 开发约束

## 模块化

### 三层解耦（铁则）

```
src/       → 只读 import JSON，禁止修改数据、禁止 import scripts/
scripts/   → 读写 data/，禁止访问 src/
data/      → 纯 JSON，无逻辑
```

跨层直接调用禁止。scripts/ 对 src/ 零依赖。

### 组件单一职责

- Props 类型从 `src/types/` 导入
- Emits 仅向直接父组件通信
- 组件不直接 import JSON（通过 composable 或 props 传入）
- 组件内禁止硬编码会议名称、日期、分类等业务数据

## 数据约束

- 历史数据（`year < current_year`）：只读，修改需在 PR 中提供来源链接
- 日期：ISO 8601 `YYYY-MM-DD`；`last_updated` 含 UTC 时间 `2026-05-14T08:30:00Z`
- 时区：IANA 格式（`"America/New_York"`），禁止缩写（`"PST"`）
- 国家名：英文全称（`"United States"`，非 `"USA"`）

## 命名规范

| 类型 | 规范 | 示例 |
|---|---|---|
| Vue 组件 | PascalCase | `ConferenceCard.vue` |
| 视图页面 | PascalCase + Page | `CountdownPage.vue` |
| Composable | use + PascalCase | `useTheme.ts` |
| TypeScript 类型文件 | camelCase | `conference.ts` |
| Python 脚本 | snake_case | `update_conferences.py` |
| JSON 数据 | kebab-case | `conferences.json` |
| 目录 | kebab-case | `src/components/` |

## 注释规范

| 内容 | 语言 |
|---|---|
| 业务逻辑注释 | 中文 |
| JSDoc / TSDoc | 英文 |
| Git commit message | 英文 |

## Commit 格式

```
type(scope): description
```

| type | 用途 |
|---|---|
| feat | 新功能 |
| fix | Bug 修复 |
| data | 数据更新 |
| docs | 文档变更 |
| style | 格式调整 |
| refactor | 重构 |
| chore | 构建/工具 |
| ci | CI/CD |
| test | 测试 |

## TypeScript 严格规则

- `strict: true`
- `@typescript-eslint/no-explicit-any`: **error**，禁止 `any` 和 `as any`

> 版本：v0.2.0 | 2026-05-14
