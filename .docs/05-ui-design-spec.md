# 05 — UI 设计规范

## 色彩系统

### DDL 紧迫度

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--color-expired` | `#9CA3AF` | `#6B7280` | 已过期 |
| `--color-travel` | `#6366F1` | `#818CF8` | 旅等（DDL 截止,未开会） |
| `--color-urgent` | `#EF4444` | `#F87171` | ≤7 天 |
| `--color-near` | `#F59E0B` | `#FBBF24` | ≤30 天 |
| `--color-ample` | `#10B981` | `#34D399` | >30 天 |

### 链接样式

- 地点链接：会议卡片中的 `city, country` 文本整体作为链接，使用琥珀 → 玫红 → 靛蓝渐变文字，新标签页打开地点页。
- 官网链接：地点后展示 `官网 ↗`，使用中性灰色文字，新标签页打开该年份 `url` 对应的第三方官网页面。

### 进度条专用色

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--color-progress-bg` | `#E5E7EB` | `#374151` | 底色 |
| `--color-progress-done` | `#9CA3AF` | `#6B7280` | 已过段 |
| `--color-progress-node` | `#6B7280` | `#9CA3AF` | 节点 |
| `--color-progress-node-future` | `#D1D5DB` | `#4B5563` | 未来节点 |

## 核心组件

### ProgressBar（多节点倒计时进度条）

年份视图卡片核心组件。节点：摘要截止 → 正文截止 → 开会 → 结束。

- 已过节点：实心灰色；当前阶段：紧迫度着色；未来节点：空心浅灰边框
- 未过期节点标签：「还剩 X 天」；已过期：「已截止 X 天」
- 会议已结束：全灰 + opacity-60 +「已结束」标签
- 节点缺失：跳过该节点
- 响应式：桌面完整、平板 2 节点、移动端 2 节点简化

### ConferenceCard（年份视图用）

- 左上角分类 Badge，左侧 DDL 紧迫度色条（`border-l-4`）
- 显示：会议名 + 年份、全称、城市（渐变地点链接）、官网外链、ProgressBar
- Hover：`shadow-md` + `translateY(-2px)`
- 已结束卡片：opacity-60

### ConferenceColumn（会议维度视图用）

- 列头：会议缩写 + 全称 + 分类 Badge，使用轻量边框、顶部渐变强调线和浅色层级背景
- 列内：upcoming 卡片按年份降序 → "— 历史 —" 分隔 → 历史卡片（默认折叠至 2 届）
- 列宽：min 280px / max 400px，自适应
- 未选取会议时显示引导文案

### MultiSelectNav（多级联动导航）

桌面端左侧竖向面板，两级复选框（5 父类 + 子级会议）。父级全选/半选/空选联动。底部已选计数 + 清除按钮。

移动端：顶部横向 chip → 点击弹出 BottomSheet。

### YearSelector

横向可滚动 Tab，当前年份高亮。年份从数据动态计算。

### LocationPage

城市名 + 国家 + 简介 → 基本信息卡片（季节/语言/货币）→ 美食列表 → 景点列表 → 气候图表（12 月温度柱状 + 降水折线，纯 CSS）→ 旅行贴士 → 关联会议列表。地点页由会议卡片新标签页打开，正常详情页不显示返回按钮。

响应式：桌面双列，移动端单列。

## 响应式断点

| 断点 | 宽度 | 会议维度视图 | 年份视图 |
|---|---|---|---|
| Mobile | <768px | 单列滑动，导航 BottomSheet | 1 列 |
| Tablet | 768–1023px | 2 列，导航顶部 chip | 2 列 |
| Desktop | ≥1024px | 左侧导航 + N 列 | 3 列 |
| Wide | ≥1280px | 同上，max-width 1200px | 4 列 |

## 深色模式适配

- 策略：Tailwind `darkMode: 'class'`，`<html>` 元素切换
- 防闪烁：`<head>` 内联脚本同步读 localStorage
- 进度条深色：底色 `bg-gray-700`，已过段 `bg-gray-500`，紧迫 `bg-red-500`

## 世界视图

### 地图容器

- 高度：65vh，最低 480px。移动端降至 50vh，最低 320px
- 圆角 `--radius-lg`，1px 边框
- 图例浮于左下角，z-index: 1000，毛玻璃半透明背景
- 缩放控件位于右上角
- 底图使用本地静态 GeoJSON 陆地轮廓，不请求外部地图 API 或瓦片服务

### 光点规则

**底图（`--world-map-*` CSS 变量）**

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--world-map-water` | `#DBEAFE` | `#0F172A` | 海洋背景 |
| `--world-map-land` | `#F8FAFC` | `#1F2937` | 陆地填充 |
| `--world-map-border` | `#CBD5E1` | `#4B5563` | 陆地边界 |

**颜色**

| 来源 | Light | Dark | 条件 |
|---|---|---|---|
| `--world-dot-history` | `#9CA3AF` | `#6B7280` | 仅有历史举办 |
| `CATEGORY_COLORS.CV` | `#EF4444` | `#EF4444` | upcoming 计算机视觉 |
| `CATEGORY_COLORS.NLP` | `#8B5CF6` | `#8B5CF6` | upcoming 自然语言处理 |
| `CATEGORY_COLORS.ML` | `#10B981` | `#10B981` | upcoming 机器学习 |
| `CATEGORY_COLORS.AI` | `#3B82F6` | `#3B82F6` | upcoming AI 综合 |
| `CATEGORY_COLORS.DM` | `#F59E0B` | `#F59E0B` | upcoming 数据挖掘 |

同一城市存在多个 upcoming 会议时，地图光点使用最早 upcoming 年份对应会议的分类色。

**大小（5 档半径）**

| 场次 | 半径 | Tier |
|---|---|---|
| 1 | 8px | 1 |
| 2–3 | 12px | 2 |
| 4–6 | 16px | 3 |
| 7–10 | 20px | 4 |
| 11+ | 25px | 5 |

### 交互动画

- Tooltip 显示：Leaflet 原生 `direction: 'auto'` 自动翻转
- Tooltip 中 upcoming 条目显示当前阶段日期：`Abstract` / `Submission` / `Travel`
- 光点 Hover 高亮：半径 ×1.5，z-index 提升，fillOpacity → 1，stroke-width → 3
- 地图飞行：`flyToBounds` 1.2s 缓动，40px padding
- 城市居中：`flyTo` 0.8s 缓动，最小 zoom 6

### 年份-会议二维表

- 年份列：sticky left（z-index: 2），降序排列，64px 最小宽度
- 分类组表头：横跨该分类所有列，使用分类色小圆点指示器
- CV=红, NLP=紫, ML=绿, AI=蓝, DM=橙
- 单元格：「城市 + 国旗」或「—」（空），完整「城市, 国家」保留在 title tooltip。Hover 浅色背景
- upcoming 行：橙色半透明背景 + 左侧橙色 3px 强调线
- 表格外容器：圆角边框 + 横向滚动

### 分类筛选栏

- 5 个分类色 chip 按钮，使用与表格列头分类小圆点一致的颜色
- 活跃态：分类色文字 + 分类色边框 + 10% 透明分类色背景
- 非活跃态：中性浅灰背景，保留分类色小圆点
- 最后一个活跃分类禁用点击（至少保留 1 个）
- 筛选项仅影响表格列，不影响地图光点

### 深色模式底图适配

- 本地 GeoJSON 底图通过 `--world-map-*` 变量切换海洋、陆地、边界颜色
- 深色 Zoom 控件：深色背景 + 浅色文字
- MutationObserver 监听 `<html>` class 变更，动态刷新底图和光点颜色

> 版本：v0.3.0 | 2026-05-30
