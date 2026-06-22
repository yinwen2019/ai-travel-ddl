# 06 — 错误处理与降级策略

## 前端字段缺失降级

**铁则**：字段缺失永不导致渲染异常、空白区域、控制台报错。

| 字段缺失 | 显示 |
|---|---|
| city / country | 「待公布」 |
| venue / url / camera_ready | 不显示整行 |
| abstract_ddl / paper_ddl（空或 null） | 「待公布」 |
| notification_date | 「录用通知: 待公布」 |
| start_date / end_date | 「会期: 待公布」 |
| conference 对象损坏 | 跳过，不渲染 |

## JSON 加载失败

- 构建时：`validate.mjs` 校验失败 → 构建终止 → stderr 输出错误详情
- 运行时：`useConferences` 中 try-catch，失败返回空数组 → EmptyState 组件
- 日期解析：`new Date(dateStr + 'T00:00:00Z')`，失败视为 null → 走降级规则

## 世界视图 — 地图模块错误场景

### 坐标缺失

- **部分城市缺少坐标**：跳过该城市光点，`console.warn` 输出 `[geoDataProcessor] Missing coordinates for city: ...`（同一城市仅警告一次）。表格单元格仍正常显示该城市文本
- **全部坐标缺失**：`cityIndex.size === 0`，隐藏地图容器，仅显示表格 + 提示横幅「位置坐标数据不可用，仅显示表格」
- **虚拟/线上城市**：`buildCityIndex` 自动跳过 `city === 'Virtual'` 或 `country === 'Online'` 的条目，不生成光点。表格中这些单元格显示「—」

### Leaflet 加载失败

- `L.map()` 初始化异常：显示地图占位区域（世界地图错误样式），展示「地图加载失败」文案 + 重试按钮。表格正常渲染
- 本地世界底图 GeoJSON 加载失败：同样显示「地图加载失败」文案 + 重试按钮。表格正常渲染
- 世界视图不得依赖外部地图 API 或第三方瓦片服务，因此不设置远程瓦片降级路径

### 缺少城市/国家字段的年份条目

- `buildCityIndex` 跳过 `!y.city || !y.country` 的条目
- `buildYearTable` 对无城市/国家的条目填充空单元格（显示「—」）

## 空状态

| 场景 | 组件 |
|---|---|
| conferences 为空 | EmptyState: "暂无会议数据" |
| 筛选无结果 | EmptyState: "没有符合条件的会议" + "清除筛选"按钮 |
| 世界视图无数据 | EmptyState: "暂无会议数据" |
| 所有分类已隐藏 | 表格提示: "所有分类均已隐藏，请至少选择一个分类" |

## AI 脚本错误处理

**网络请求重试**：指数退避，最大 3 次（2s → 4s → 8s）。429/5xx/超时 可重试；401/403/400/402 不可重试。

**解析失败**：
- JSON 解析失败 / 字段类型错误 → 保留旧数据，记日志
- 部分字段缺失 → 保留已知字段，缺失字段保持 null 或空数组
- 日期格式不标准 → 尝试标准化，失败则 null

**历史数据只读**：`year < current_year` 的 history 条目禁止 AI 脚本修改。与旧数据不一致时保留旧值。

## 前端运行时兜底

- `onErrorCaptured` 在 App.vue 顶层捕获未处理错误 → ErrorBanner 替代 router-view
- localStorage 写入失败 → 静默降级，主题状态仅内存保存
- `matchMedia` 不支持 → 默认浅色模式

> 版本：v0.3.0 | 2026-05-30
