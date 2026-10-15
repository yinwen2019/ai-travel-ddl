# 城市地标 3D 资源调研

调研日期：2026-10-15。范围：现成模型、城市微缩组合、自建与图片转 3D。此轮为候选收集与制作路线比较，未购买资产、下载网格、调用付费生成服务或更改线上地图。页面展示的面数、格式、价格属于作者声明，尚未用实际文件复核。价格以结算页为准。

## 建议方向

建议建立按城市管理的「微缩旅行模型库」：一处主地标，加两三个具有当地特征的小元素，例如水岸、桥段、街屋或树木。模型保持暖白、灰绿、陶土与少量当地识别色，轮廓明确，细节比当前代码模型更丰富。

模型库在组织上形成集合，每个城市独立输出资源，便于逐个替换和按需加载。不要把全部城市合成一个很大的 GLB。全球仍用统计圆点；区域视角显示简化地标，近景/选中城市再展示更丰富的微缩场景。当前模型只有约 30px 的展示预算，仅增加面数不会明显改善观感，后续需一起设计近景模型的展示尺寸和标签留白。

## 现成资源候选

下表链接可查看作者预览。`页面已核对` 表示核对了商品/许可说明，不代表文件已经可直接投产。`搜索摘要` 表示页面访问受限，仅有索引信息，需要进一步验收。

| ID | 资源与作者 | 已知内容与格式 | 对本项目的判断 |
|---|---|---|---|
| R01 | [World Map — ITHappy](https://ithappystudios.com/environment/world-map/) | 95 个资产，其中 23 个建筑；总计约 58K 三角形，提供 GLTF 等格式；页面标价 US$19.50，原价 US$39 | 可统一第一批地标风格；95 不是地标数量。作者列有巴黎、悉尼、纽约等可对应地标。页面已核对 |
| R02 | [Toon World Low Poly: 22 Sights — SandroDK](https://www.fab.com/listings/78b51536-a959-404b-8b84-a157d4a2447b) | 标称 22 处地标、总计 79,752 三角形、平涂色；页面列有 GLB/glTF 转换格式 | 更直接的卡通地标包。可对应巴黎、悉尼、伦敦、纽约、里约、柏林、多伦多、首尔等。清单存在重复名称，实际唯一件数和转换材质需检查；未获得可靠价格/许可档位 |
| R03 | [Landmarks of the World A to Z — mairem](https://www.cgtrader.com/3d-model-packs/landmarks-of-the-world-a-to-k) | 作者称覆盖 195 个国家；9 个分包，原生 Blender 149MB，GLTF 列为 8/9 分包；页面 US$44 | 国家地标参考库，不能理解成覆盖本网站 72 座城市。下载后需要拆分、检查缺少 glTF 的分包并优化 |
| R04 | [Hong Kong City Prop Pack — WDii](https://marketplace.unity.com/packages/3d/props/3d-low-poly-hong-kong-city-prop-pack-179357) | 作者包描述列出 27 件城市物件，含中银大厦、山顶凌霄阁、天星小轮、电车等；市场页面 US$11.99、包大小 1.1MB | 很接近「城市组合微缩景观」方向；Unity 包需确认能否取出独立网格、贴图并转为 GLB，不能把 Unity 包直接交给网页加载 |
| R05 | [City Kit Commercial — Kenney](https://kenney.nl/assets/city-kit-commercial) | 50 个文件，CC0 | 用作通用街屋和小楼组件。不是实际城市地标库，不应把通用楼直接冠名为真实建筑 |
| R06 | [City Kit Suburban — Kenney](https://kenney.nl/assets/city-kit-suburban) | 40 个文件，CC0 | 街区、屋舍配景组件，适合与自己制作的主地标组合 |
| R07 | [Golden Gate Bridge Stylized Low Poly — vitorsaito](https://sketchfab.com/3d-models/golden-gate-bridge-stylized-low-poly-b4e1a33675d746f0be8e991b3268407c) | 索引显示可下载、7,776 三角形、简单色彩、CC Attribution | 旧金山的优先单体候选。当前搜索摘要可核对，页面直读受限；下载前保存具体 CC 版本、作者及文件信息 |
| R08 | [Space Needle STL — Microsoft / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Space_Needle.stl) | 页面列出 Microsoft 为作者、STL 文件约 154KB、CC BY 4.0 | 明确开放许可的西雅图几何起点；STL 没有现成卡通材质，需要转为 GLB、分配材质并补小场景 |
| R09 | [Space Needle Low Poly — Deepak Sharma](https://sketchfab.com/3d-models/space-needle-low-poly-3d-model-ea926152ca314b70b465a5032a75af49) | 索引显示约 7.4K 三角形，带 NoAI 标签 | 可作候选浏览；下载和使用许可未确认。NoAI 标签意味着不能把此资源当作生成式 AI 输入 |
| R10 | [Singapore Marina Bay Sands — Willie Tan](https://sketchfab.com/3d-models/singapore-marina-bay-sands-61870f7da1884d41bc1e1ff73e64cc08) | 作者描述为 low poly；格式、面数、下载和许可尚未确认 | 新加坡单体候选，不标为「已取得可用模型」 |
| R11 | [Low Poly La Sagrada Familia — Avo Games](https://www.fab.com/listings/2e32f210-ab8a-49e8-934c-f2cf79dc3eed) | 作者标注 17,767 三角形、2048 贴图、4.3MB；源格式 FBX/OBJ/STL，平台另列转换 GLB/glTF | 巴塞罗那的细节型候选，需压缩和检验小尺寸识别度；价格/许可档位待确认 |
| R12 | [Shenzhen Ping An Cityscape](https://www.fab.com/listings/81a2771f-3f6a-4511-8c98-a456d4dc083b) | 平安金融中心及周边城区；作者列建筑约 57.6K polygons、道路约 94.7K polygons；FBX/OBJ | 城区级参考，原样加载不适合小地标。可考虑有授权后只取主塔；不能把 polygons 当作同等数量三角形 |
| R13 | [Worlds Islands — ITHappy](https://ithappystudios.com/environment/worlds-islands/) | 100 个主题小世界，带 GLTF 等格式 | 主要参考「小底座 + 主体 + 环境物件」的构图；没有核对出真实城市覆盖，不作为城市地标包宣传。作者面数统计含不同口径，不据此制定性能预算 |
| R14 | [Macau City Model — 3D-City-Models](https://www.cgtrader.com/3d-models/exterior/cityscape/macau-city-and-surroundings) | 整座城市，页面 US$399，glTF 约 8.4MB，另有大量纹理 | 暂不推荐：成本、范围与小地标用途不匹配。澳门大三巴/澳门塔建议另找单体或自建，不因为找到整城模型就认定地标已解决 |

对应机器可读清单：`landmark-model-sources.csv`。所有资源仍需做文件级验收，资源包大小不等于单个模型的浏览器传输体积。

## 与现有城市的对应

当前会议数据整理得到 72 座城市，去除了 Virtual/TBD，并将 Montréal 的重音差异归一，与当前地图数量一致。完整清单见 `landmark-city-inventory.csv`；首轮为 26 座城市整理建议地标，其中有来源的条目区分商品页、开放资源、搜索线索和不推荐的大场景。其余条目标为待检索，不假称已有模型。

第一批建议比较：巴黎、悉尼、西雅图、新加坡、旧金山、香港、巴塞罗那、温哥华。它们可同时测试经典塔楼、曲面建筑、桥梁、城市组合和自建补缺。优先级是本项目的设计建议，尚非用户确认的制作顺序。

城市对应必须准确：CN Tower 对应多伦多，不能拿来代替温哥华或蒙特利尔；国家级地标不能自动挪给该国家所有会议城市。任何模型都继续标为城市意象，不表示会议场馆。

## 自己设计与 AI 生成路线

| 路线 | 可以怎么做 | 适合与限制 |
|---|---|---|
| 程序化原创 | 根据建筑轮廓和参考资料，用曲线、挤出、倒角、重复构件及材质制作，再组合街区/水岸 | 我可以编写并迭代真实网格；适合塔楼、桥梁、门楼等结构明确的建筑。复杂雕像需要更多造型工作。无需依赖在线生成 API |
| [Meshy 图片转 3D](https://www.meshy.ai/features/image-to-3d) | 先设计统一视角与配色的概念图，必要时准备多视图，再生成、修网格、减面并导出 GLB | 官方支持多视图与 GLB；[API](https://docs.meshy.ai/en/api/image-to-3d) 可指定面数目标，但实际数量可能偏离。不能把生成结果直接当作准确建筑复原 |
| [Tripo](https://www.tripo3d.ai/) | 文本或参考图生成，导出 GLB，再进行模型检查和统一材质 | 官方提供 Studio 和[开发者平台](https://developers.tripo3d.ai/)。还需要账户/生成额度，本会话尚未调用 |
| [TRELLIS.2](https://github.com/microsoft/TRELLIS.2) | 自部署图片转三维网格与 PBR 材质 | 开源研究路线；官方要求 Linux、NVIDIA GPU 至少 24GB 显存，不能当作这台 Mac 已能直接运行的轻量工具 |
| [Hunyuan3D-2.1](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1) | 形状与 PBR 纹理分阶段生成，导出后优化 | 官方列出形状/纹理阶段较高显存需求；安装、平台适配及其模型许可需另行核对。本轮未安装 |

图片生成工具可以用来做统一风格参考图，本身输出的图片不等于可旋转的三维网格。图转 3D 是单独的一步。当前环境未发现 Blender 应用；后续采用 Blender 工作流时需要准备环境，不能声称已完成模型文件。

## 授权与公开仓库的实际影响

- Kenney 的上述两包明确为 CC0；Space Needle Commons 文件明确为 CC BY 4.0，后者需署名、保留许可链接并说明修改。
- [ITHappy 协议](https://ithappystudios.com/one-time-purchase-licence-agreement/)允许模型作为产品的一部分使用，限制独立再分发，并限制将资产作为生成式 AI 的输入。因此购买不等于可以把原始资源作为公开模型库提交到 GitHub，也不能拿买来的包直接送进图转 3D 服务。
- 本项目公开源码与网站资源发布要分别考虑：选开放许可/原创资产最省事；商业资源在确定可用前，应核对嵌入网页、资源可提取性及源码分发条件。这是交付方式的选择条件，非本轮法律意见或授权确认。
- [Meshy 官方说明](https://help.meshy.ai/en/articles/10137554-what-is-the-ownership-of-the-generated-models)：免费与付费生成的权利不同，免费方案为 CC BY 4.0；下载/API 可用范围还受套餐限制。
- [Tripo 官方说明](https://www.tripo3d.ai/help/privacy-policy/how-to-use-tripo-models-commercially)：免费用户未获商业使用权，付费用户拥有其说明中的商业权利。两家均不能替用户取得参考图的权利。

## 推荐的后续落地方式

建议采用「成品优先 + 原创补缺 + AI 辅助」：先选出一个统一视觉样板，再按城市补齐，避免从不同网站直接拼出风格、比例和材质完全不同的一套图标。

每座城市保留地标名、城市键、来源、作者、许可、原件/优化件、面数、纹理大小、预览图与修改记录。GLB 可以通过 [glTF Transform](https://gltf-transform.dev/cli) 做网格合并、减面与压缩。建议先试验以下预算，以下是工程目标而非已测结果：

- 地图简化件：约 1K–8K 三角形，目标 50–300KB。
- 近景微缩场景：约 8K–30K 三角形，目标 0.3–1.5MB；纹理优先 512/1024，减少材质数量。
- 相机进入区域/选择城市后才加载对应件，不一次下载 72 座城市。实际同时可见数量与预算需在手机上测定。

建议先做三个试样进行取舍：巴黎（升级现有塔楼）、香港（组合型城市小景）、温哥华（成品缺口，验证原创路线）。这是一项后续建议，本轮尚未开始制作或替换线上模型。
