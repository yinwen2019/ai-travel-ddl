# 13 — 世界地图底图与候选

> 2026-10-14 · 用户已确认并实现 A 默认、开关切换 B；C / D / E 保留为未实现候选。

## 已修正的近景问题

原镜头最低高度 0.45 且光点采用固定世界坐标大小，导致港澳深等相邻城市即使放大也互相遮挡。现最低高度为球体半径的 0.025，城市定位高度为 0.08；光点按相机空间深度换算为固定屏幕像素大小，保留累计场次五档。城市名改为固定字号的 HTML 标签，在视口内避让。桌面与手机近景均验证香港、澳门、深圳分别显示，未改动会议数据或坐标。

## 引擎能力与当前实现

现有 Three.js + Globe.GL 已支持球面图片、凹凸贴图、GeoJSON 面填充与按缩放加载的栅格瓦片，无须更换框架或地球引擎。网站当前已接入本地连续矢量陆地（A 默认）、Natural Earth II 地形（B 开关），以及国界和经纬网。点阵填充已移除。

官方能力说明：[Globe.GL API](https://globe.gl/)。A / B 已接入，以下 C / D / E 仍为候选。

| 编号 | 底图 | 视觉与适配建议 | 资源和近景边界 |
|---|---|---|---|
| A | 清爽矢量色块 | 连续陆地填色、细国界、纯色海洋；推荐默认，方便叠加会议点和卡通地标；可设计深浅两个配色 | 本地 GeoJSON 可实现；矢量边缘清晰，但地理细节取决于原始数据，近景应换更细海岸数据 |
| B | 柔和地形图 | Natural Earth I / II 风格，带山脉与地势纹理，更有旅行地图感 | 优化后的本地纹理可实现；单张纹理放大后清晰度有上限 |
| C | 真实蓝色地球 | NASA Blue Marble，自然海陆色，接近从太空观察地球 | 可使用优化后的本地纹理；属于合成影像，不是实时卫星画面；近景清晰度受纹理分辨率限制 |
| D | 城市夜景 | NASA Black Marble，夜间城市灯光，科技感强 | 可使用优化后的本地纹理；资料页包含 2016 年合成图，非实时；背景灯光可能与会议光点争抢注意力 |
| E | 精细地图瓦片 | 深色、浅色或彩色地图；随缩放加载更细海岸、道路和地名 | Globe.GL 有栅格瓦片接口；需自托管或外部地图服务。当前 REQ-C11 禁止运行时第三方瓦片服务，选择外部服务须先明确修改该约束；完整世界高缩放瓦片不宜直接全部放入静态项目 |

推荐 A 为默认、B 为可切换备选；如果用户更重视科技感，可选 D；如果更重视近景地理细节，可选 E。风格判断属于本项目的设计建议。

## 官方资料与预览

- A：[Globe.GL 面填充示例](https://globe.gl/example/choropleth-countries/)。仅参考连续面填充能力，不采用示例中的 GDP 配色、数据或凸起高度。[Natural Earth 地理数据](https://www.naturalearthdata.com/downloads/)提供 1:10m、1:50m、1:110m 等比例尺；这里的 10m 是 1:10,000,000，非 10 米精度。
- B：[Natural Earth 栅格图预览](https://www.naturalearthdata.com/downloads/10m-raster-data/)，包含 Natural Earth I、II、灰阶及地形晕渲等。
- C：[NASA Blue Marble 底图](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/)。
- D：[NASA Black Marble 夜景图](https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/)。
- E：[Globe.GL 官方瓦片示例源码](https://github.com/vasturiano/globe.gl/blob/master/example/tile-engine/index.html)、[CARTO 官方样式预览及使用说明](https://github.com/CartoDB/basemap-styles)。CARTO 的 Positron / Dark Matter / Voyager 可作浅色、深色、彩色候选，但当前栅格服务也要求 API key，不应当成无需配置的免费无限服务。Globe.GL 接口接受栅格瓦片 URL，不直接接受地图矢量样式 JSON。

## 当前实施与边界

用户选择 A 默认，并以「柔和地形」开关启用 B，同一时刻显示一种底图。切换保留镜头、选中城市、会议点大小和分类色，以及地标、动画与年表联动；当前未增加国界、经纬网、城市名的独立开关。

A 使用本地 1:50m GeoJSON，替换原粗略轮廓以改善区域海岸。B 为 Natural Earth II with Shaded Relief and Water 3.2.0，桌面 4096×2048 WebP（约 1 MB），手机 2048×1024（约 174 KB）。首次切换才请求对应本地纹理；成功后复用，切回 A 不再请求，销毁场景时释放 GPU 纹理和位图。加载失败保留 A，允许重试，不影响年表。光点增加深色细边以适配浅色地形。资源来源与处理方式见 `src/assets/maps/README.md`。

保持既有世界视图年表与会议数据流程。B 在极近景有纹理清晰度上限；C / D / E 未接入，不新增外部服务。
