# 城市微缩景观：实现与维护

交付日期：2026-10-15。对应 [REQ-C11](01-requirements.md#req-c11--世界地图光点-p1)，沿用 [世界视图设计规范](05-ui-design-spec.md#世界视图)。本次是既有地图的局部扩展；不建立新的全站设计系统或颜色权威。前期路线与资产比较见 [城市地标 3D 资源调研](14-landmark-model-research.md)，该调研早于本次制作，其候选资源未用于这些模型。

## 已实现范围

巴黎、香港、温哥华采用同一套暖色低多边形黏土风格，由 Three.js 几何体原创组合。六座城市目前有模型，其中这三座有区域与近景两档组合；悉尼歌剧院、西雅图太空针塔、新加坡滨海湾金沙保留原有简化模型。其他城市继续显示普通会议统计光点。

| 城市 | 区域主地标 | 近景组合 |
|---|---|---|
| 巴黎 | 埃菲尔铁塔 | 铁塔、凯旋门、卢浮宫金字塔、街屋、塞纳河、桥段与树木 |
| 香港 | 中银大厦 | 中银大厦、国际金融中心二期、钟楼、天星小轮、电车、街楼与水岸 |
| 温哥华 | 加拿大广场 | 加拿大广场、海港中心、科学世界、山峰、松树与水岸 |

组合表达城市意象，**不表示真实相对地理位置或会议场馆**；选中城市的面板保留这项说明。本次没有引入外部模型、纹理服务、购买资产、AI 生成调用，也没有修改会议或城市 JSON 数据。

## 展示与交互

- 保留现有浅色暖纸／鼠尾草、深色炭灰／深青底图。模型使用暖白、石色、陶土、低饱和蓝绿玻璃和植被；粗糙材质与随镜头的光源统一立体观感。
- 镜头高度由 `0.58` 接近 `0.18` 时，通过 `smoothstep` 混合简化与近景两档，同时平滑放大。高度不小于 `0.58` 时为简化档，不大于 `0.18` 时为完整近景；有固定城市时，仅该城市参与近景展开。
- 模型使用独立屏幕尺寸预算，区域档 `44px`；完整近景桌面 `168px`、手机全屏 `116px`、手机嵌入 `88px`。实现按画布宽度 `<768px` 判断紧凑布局，再以画布高度 `<650px` 区分两档手机预算；这些是尺寸预算，不是各建筑的实际高度。
- 布局为左侧微缩模型、中央统计点、右侧城市名。模型归一化后使用统一倾角，标签避让包含模型范围；统计点仍表达累计场次，不因模型放大而改变其五档语义。
- 左上巴黎／香港／温哥华入口开启地标并定位近景，再次点击当前城市可重新定位。入口有选中状态与辅助名称，加载时禁用，触达区域至少 `44×44px`。城市标签、入口和模型说明沿用 `12px` 字号；入口组标题为 `11px`，紧凑布局隐藏。

## 代码入口与成本

| 文件 | 维护职责 |
|---|---|
| [cityMiniatures.ts](../src/utils/cityMiniatures.ts) | 城市构图、共享建模工具与材质、合批、包围盒归一化、统一倾角、两档透明度切换 |
| [globeLandmarks.ts（注册表）](../src/data/globeLandmarks.ts) | 城市键、模型种类、展示名称、快捷入口与特色说明 |
| [globe.ts](../src/types/globe.ts) | `LandmarkKind` 与地标注册类型 |
| [createConferenceGlobe.ts](../src/utils/createConferenceGlobe.ts) | 原创组合／旧模型回退、LOD、尺寸预算、标签避让和着色器预编译 |
| [globeMarkerLayout.ts](../src/utils/globeMarkerLayout.ts) | 模型相对光点的屏幕偏移、相机朝向和像素尺度换算 |
| [WorldMap.vue](../src/components/world/WorldMap.vue)、[globe.css](../src/styles/globe.css) | 三城入口、城市定位、说明文字与响应式浮层 |

每档按材质共享并合并几何体，减少绘制网格数量；两档在创建时一起生成，接近城市时切换可见性与透明度，并非运行时下载或按城市懒加载。首次就绪流程使用 `compileAsync` 预编译近景材质。

| 城市 | 简化档三角形 / 合并网格 | 近景档三角形 / 合并网格 |
|---|---:|---:|
| 巴黎 | 2,504 / 4 | 5,364 / 10 |
| 香港 | 1,092 / 3 | 4,968 / 9 |
| 温哥华 | 752 / 3 | 9,566 / 7 |

本机 Node 几何创建检查中，三城两档合计创建约 `59ms`。这只反映该机器上的几何构建测量，不能作为浏览器首帧、帧率或手机性能达标结论；扩展城市数量时需重新测量实际场景。

## 新增或替换城市

1. 在 `cityMiniatures.ts` 中编写原创城市 builder，分别提供清楚的主地标和完整城市构图，接入 `createCityMiniature`。复用现有材质、合批和归一化流程，保持同一倾角与屏幕尺寸预算。
2. 在 `LandmarkKind` 中加入种类，并在注册表使用地图已归一化的 `CityKey`；需要快捷入口时补 `previewLabel`，同时维护名称和特色说明。新地标不需要改动会议 JSON。
3. 检查几何坐标、法线与包围盒均有限，核对两档端点可见性、混合时透明度、材质与三角形数量；确认没有盖住统计点或标签，再检查桌面、手机嵌入、全屏及两种主题。

目前需要修改代码来扩展模型；没有自助模型编辑器、GLB 上传／导入流程或真实街道地理系统。本次仅完成三座完整城市组合，不将覆盖六座模型城市理解为六座完整微缩城市。

## 验证与证据

隔离预览工程 `/private/tmp/ds-web-miniature-preview` 已通过 Schema 校验、类型检查、构建及本次修改范围的 ESLint；校验仍提示既有缺失日期，不将其视为本次新增数据。另检查了有限几何坐标、模型统计与 LOD 端点。独立视觉复核结论为 `ship`，没有需修复的实质问题。自动检测器因本地引擎／缓存不可用而未运行，不记录为通过。

已核对上述实现源码、[桌面 1440×900](/Users/vanesky/.codex/visualizations/2026/10/14/01a13930-9f8a-7e11-a8af-8243ef7383c3/city-miniatures-paris-desktop.png)、[实际窗口 632×827](/Users/vanesky/.codex/visualizations/2026/10/14/01a13930-9f8a-7e11-a8af-8243ef7383c3/city-miniatures-user-632.png)、[区域视角](/Users/vanesky/.codex/visualizations/2026/10/14/01a13930-9f8a-7e11-a8af-8243ef7383c3/city-miniatures-regional.png)，以及手机 375×812 的[嵌入浅色](/Users/vanesky/.codex/visualizations/2026/10/14/01a13930-9f8a-7e11-a8af-8243ef7383c3/city-miniatures-mobile-embedded.png)和[全屏深色](/Users/vanesky/.codex/visualizations/2026/10/14/01a13930-9f8a-7e11-a8af-8243ef7383c3/city-miniatures-mobile-dark.png)真实截图。最终构图细节见[巴黎](/Users/vanesky/.codex/visualizations/2026/10/14/01a13930-9f8a-7e11-a8af-8243ef7383c3/city-miniatures-paris-detail.png)、[香港](/Users/vanesky/.codex/visualizations/2026/10/14/01a13930-9f8a-7e11-a8af-8243ef7383c3/city-miniatures-hongkong-detail.png)、[温哥华](/Users/vanesky/.codex/visualizations/2026/10/14/01a13930-9f8a-7e11-a8af-8243ef7383c3/city-miniatures-vancouver-detail.png)；不以 `round1` 图片代表交付。复核副本位于 `/private/tmp/ds-web-miniature-preview/.impeccable/review`，这些本地证据不属于网站运行资源。
