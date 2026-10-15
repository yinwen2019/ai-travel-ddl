---
name: AI Travel DDL
description: 用冷蓝灰地图语言连接 AI 会议日程与城市旅行。
colors:
  brand: "#295b73"
  brand-light: "#dce8ed"
  brand-dark: "#244e63"
  canvas: "#f1f5f6"
  surface: "#fcfefe"
  surface-secondary: "#e6edef"
  surface-hover: "#dce6ea"
  border: "#cedbdf"
  text-primary: "#183442"
  text-secondary: "#526b78"
  text-inverse: "#fcfefe"
  dark-brand: "#a1c8d8"
  dark-brand-light: "#253f4d"
  dark-brand-dark: "#c0dce8"
  dark-canvas: "#111e26"
  dark-surface: "#172832"
  dark-surface-secondary: "#192e3a"
  dark-surface-hover: "#243e4c"
  dark-border: "#344954"
  dark-text-primary: "#e5edf1"
  dark-text-secondary: "#a9bdc7"
  dark-text-inverse: "#152a35"
typography:
  display:
    fontFamily: "'Avenir Next', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(40px, 4.3vw, 56px)"
    fontWeight: 650
    lineHeight: 1.26
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'Avenir Next', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "26px"
    fontWeight: 650
    lineHeight: 1.35
    letterSpacing: "-0.025em"
  title:
    fontSize: "16px"
    fontWeight: 650
    lineHeight: 1.4
  body:
    fontSize: "16px"
    lineHeight: 1.9
  label:
    fontSize: "12px"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  card: "1rem"
  control-gap: "8px"
  layout-gap: "24px"
  section-gap: "32px"
components:
  home-primary-action:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
  home-primary-action-hover:
    backgroundColor: "{colors.brand-dark}"
  home-secondary-action:
    textColor: "{colors.brand}"
  control-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "9px 14px"
  control-button-hover:
    backgroundColor: "{colors.surface-hover}"
  nav-item:
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  nav-item-current:
    backgroundColor: "{colors.brand-light}"
    textColor: "{colors.brand-dark}"
  search-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 44px 10px 36px"
  category-badge:
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.sm}"
    padding: "3px 7px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
---

# Design System: AI Travel DDL

## Overview

**Creative North Star: "会议旅行地图册"**

冷蓝灰画布、深墨蓝文字与细分隔线承托会议与城市资料。品牌保留单色折线地图标识；系统字体兼顾中文阅读与英文城市名称，信息密度随任务调整。

地图带来旅行感，清晰的名称、日期、统计和入口承担操作。全站界面采用当前蓝色方向；世界视图的三维底图与全站冷蓝灰方向对齐，海陆色沿用首页地图的色相；地图浮层直接复用全站语义变量。会议分类色与 DDL 状态色保持独立语义。

**Key Characteristics:**

- 冷蓝灰底色与深墨蓝文字。
- 细边框、平面层次与克制圆角。
- 数据先行，品牌、分类和 DDL 各有独立语义。
- 系统字体、清晰焦点和响应式阅读顺序。

## Colors

前置色表提取自 `src/styles/main.css`；无前缀项对应浅色，`dark-` 项对应 `.dark` 的同名变量。CSS 是实现源，更新时同步本文与 sidecar。

### Primary

- **地图蓝**：`brand` 用于链接、焦点和品牌；`brand-light` 与 `brand-dark` 搭配表达选中导航或筛选。
- **墨蓝**：`text-primary` 承担主要文字，也用作首页主按钮底色；按钮文字使用 `text-inverse`。

### Neutral

- **冷雾画布**：`canvas` 为页面底色；`surface`、`surface-secondary` 和 `surface-hover` 分别区分内容、次级区域和控件悬停。
- **蓝灰分隔**：`border` 分开相邻资料；`text-secondary` 承担说明和辅助信息。首页在 `home.css` 内将浅色辅助文字局部加深。

**The Semantic Color Rule.** 品牌色、会议分类色、DDL 状态色和首页国家色分别表达不同信息；不因品牌换色而重映射业务颜色。DDL 指示与正文颜色沿用 `main.css` 的状态变量，会议分类沿用 `src/constants.ts`；首页国家色仅在首页榜单中使用。

## Typography

**Display Font / Body Font:** Avenir Next、Segoe UI、PingFang SC、Microsoft YaHei、sans-serif；不请求外部字体。

展示标题使用紧凑字距和适中的粗度，正文保留中文行距。前置 `display` 是首页桌面标题，`headline` 是常规页标题，`title` 是会议卡片标题，`body` 是首页介绍，`label` 是常用辅助字号；其余细节以对应组件为准。日期和统计使用等宽数字。

首页标题在中等宽度逐级收至（44px / 36px），手机使用（clamp(34px, 9.5vw, 46px)）。常规页手机标题为（24px），导航为（13px）；首页榜单国家、注释和图例为（11px）。

## Layout

会议和世界页最大宽度（1440px），年份、城市目录和首页（1280px），详情（1120px）。共享页面边距桌面（24px）、手机（16px）；首页独立采用桌面（48px）、≤1100px（32px）、<640px（20px）。

共享顶栏吸顶，仅包含品牌、主导航与主题按钮。桌面导航跟随品牌横排；<768px 时品牌与主题在第一行，五项导航位于第二行。各视图自行承载筛选工具栏。

普通内容采用行、网格与局部分隔；具体密度跟随任务。首页的双栏叙事、静态地球和四入口组合属于首页策略，见 `.impeccable/surface-briefs/home.md`，不作为所有页面模板。

## Elevation & Depth

默认靠背景色阶与细边框区分层级，普通卡片不悬浮上移。轮播箭头使用已有中等阴影强调其叠加位置（`--shadow-md`）；不把该阴影推广到首页榜单或门户。精确阴影与动效值记录在 sidecar，主页入场只运行一次，减少动态效果偏好下无入场动画。

## Shapes

控件和导航为轻圆角（8px），普通卡片为（12px），小标签与首页主按钮为（6px）。圆形用于点状编码和轮播箭头。首页榜单与四个入口使用细线和开放排版；不套入普通卡片容器。

## Components

### Buttons

首页主按钮以深文字色实底、反色文字和右上箭头提供明确入口，最小高度（48px）；悬停转为深品牌色。次按钮为品牌色文字与底线。普通工具按钮最小高度（44px），使用表面色与细边框，悬停加深表面，展开或选中使用品牌浅底。

### Chips

操作 chip 沿用普通控件结构。分类 badge 为中性底与文字、细边框及分类色小圆点；始终保留可读分类名称。

### Cards / Containers

普通卡片使用表面底、细边框、卡片圆角与内边距。已结束会议使用次级表面和状态文字；会议轮播的当前卡片用品牌边框，非当前卡片的缩小与弱化只用于预览。

### Inputs / Fields

搜索框为表面底、细边框、控件圆角，文字（16px），最小高度（44px）；预留左侧搜索图标和右侧清除按钮。占位文字使用次文字色，清除按钮有名称。

### Navigation

Home、World、Conference、Year、City 保持该顺序。当前项为品牌浅底与深品牌文字；会议详情归属 Conference，城市详情归属 City。导航与首页门户同页切换，城市详情链接新标签页打开并说明去向。

### Home City Ranking

历史城市举办榜使用开放式行、比例条、国家图例与等宽数字；真实并列名次保留等号，数值始终可读。静态地球作为背景，不承担交互；无历史记录时显示明确空状态。

## Do's and Don'ts

### Do:

- **Do** 沿用实际 CSS 变量与系统字体，深浅主题成对检查。
- **Do** 为交互保留可见焦点（2px 轮廓、3px 偏移）与普通入口至少（44px）的触控区域。
- **Do** 保留分类、DDL、国家色的文字说明与数据语义。

### Don't:

- **Don't** 把首页的背景地球、榜单或四入口布局推广为所有页面的模板。
- **Don't** 用品牌蓝覆盖会议分类或 DDL 状态色；地图底图与浮层须同时适配全站深浅主题。
- **Don't** 给普通卡片增加悬浮位移，或为首页增加循环动画与远程字体依赖。
