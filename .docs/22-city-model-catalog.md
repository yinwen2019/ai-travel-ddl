# 全部城市与 3D 模型覆盖清单

更新时间：2026-10-21。来源为 `buildCityDirectory(conferences, locations)` 与 `buildCityIndex(conferences)` 的实际只读聚合。目录 **73 城**，地图有坐标 **72 城**；**10 城**有主地标／完整近景双档模型，另 **62 城**为普通统计点。京都有会议记录但缺少地图坐标，本次未补造坐标或修改会议 JSON。

本次补做悉尼、西雅图、新加坡、北京、首尔、澳门、旧金山 7 套完整组合；其中前 3 城从原单体地标升级，其余 4 城新增。连同原有巴黎、香港、温哥华，完整模型总数为 10，不是新增 7 座后保留 3 个额外单体。

## 十城模型

| 城市 | 区域主地标 | 近景标志性景观 | 本轮处理 |
|---|---|---|---|
| 巴黎（Paris） | 埃菲尔铁塔 | 埃菲尔铁塔、凯旋门、卢浮宫金字塔、塞纳河 | 保留原组合 |
| 香港（Hong Kong） | 中银大厦 | 中银大厦、国际金融中心二期、钟楼、天星小轮 | 保留原组合 |
| 温哥华（Vancouver） | 加拿大广场 | 加拿大广场、海港中心、科学世界、海岸山林 | 保留原组合 |
| 悉尼（Sydney） | 悉尼歌剧院 | 悉尼歌剧院、悉尼海港大桥、悉尼塔、海港渡轮 | 由单体升级 |
| 西雅图（Seattle） | 太空针塔 | 太空针塔、西雅图摩天轮、派克市场、常青海岸 | 由单体升级 |
| 新加坡（Singapore） | 滨海湾金沙 | 滨海湾金沙、鱼尾狮、艺术科学博物馆、滨海湾超级树 | 由单体升级 |
| 北京（Beijing） | 天坛祈年殿 | 天坛祈年殿、故宫午门、央视总部大楼、中式园林 | 新增 |
| 首尔（Seoul） | N 首尔塔 | N 首尔塔、景福宫光化门、乐天世界塔、汉江 | 新增 |
| 澳门（Macao） | 大三巴牌坊 | 大三巴牌坊、新葡京酒店、东望洋灯塔、议事亭前地 | 新增 |
| 旧金山（San Francisco） | 金门大桥 | 金门大桥、泛美金字塔、科伊特塔、彩绘仕女与缆车 | 新增 |

所有模型是原创程序化城市意象，非真实相对布局、会议场馆或精确建筑复刻。使用现有暖白、石色、陶土、低饱和玻璃与植被材质；地图仍为全站冷蓝灰深浅主题。区域／近景尺寸与逐级展示、相邻城市自动收缩规则不变。

## 全部 73 城

城市及国家名称沿用源数据。场次为当前已收录的全部会议届次，含数据中标记为 upcoming 的记录，不是旅游热度或未来承诺。

| 城市 | 国家／地区（按数据） | 大洲 | 收录场次 | 模型状态 |
|---|---|---|---:|---|
| Abu Dhabi | United Arab Emirates | 亚洲 | 1 | 普通统计点 |
| Albuquerque | United States | 北美洲 | 1 | 普通统计点 |
| Amsterdam | Netherlands | 欧洲 | 2 | 普通统计点 |
| Anchorage | United States | 北美洲 | 1 | 普通统计点 |
| Austin | United States | 北美洲 | 2 | 普通统计点 |
| Baltimore | United States | 北美洲 | 1 | 普通统计点 |
| Bangkok | Thailand | 亚洲 | 2 | 普通统计点 |
| Barcelona | Spain | 欧洲 | 2 | 普通统计点 |
| Beijing | China | 亚洲 | 1 | 完整双档模型 |
| Berlin | Germany | 欧洲 | 1 | 普通统计点 |
| Boston | United States | 北美洲 | 1 | 普通统计点 |
| Bremen | Germany | 欧洲 | 1 | 普通统计点 |
| Brisbane | Australia | 大洋洲 | 1 | 普通统计点 |
| Brussels | Belgium | 欧洲 | 1 | 普通统计点 |
| Budapest | Hungary | 欧洲 | 1 | 普通统计点 |
| Buenos Aires | Argentina | 南美洲 | 1 | 普通统计点 |
| Chengdu | China | 亚洲 | 1 | 普通统计点 |
| Copenhagen | Denmark | 欧洲 | 1 | 普通统计点 |
| Denver | United States | 北美洲 | 2 | 普通统计点 |
| Dublin | Ireland | 欧洲 | 2 | 普通统计点 |
| Florence | Italy | 欧洲 | 1 | 普通统计点 |
| Glasgow | United Kingdom | 欧洲 | 1 | 普通统计点 |
| Halifax | Canada | 北美洲 | 1 | 普通统计点 |
| Hong Kong | China | 亚洲 | 2 | 完整双档模型 |
| Honolulu | United States | 北美洲 | 4 | 普通统计点 |
| Jeju | South Korea | 亚洲 | 2 | 普通统计点 |
| Kigali | Rwanda | 非洲 | 1 | 普通统计点 |
| Kyoto | Japan | 亚洲 | 2 | 缺少地图坐标 |
| Las Vegas | United States | 北美洲 | 1 | 普通统计点 |
| Lille | France | 欧洲 | 1 | 普通统计点 |
| Lisbon | Portugal | 欧洲 | 2 | 普通统计点 |
| London | United Kingdom | 欧洲 | 1 | 普通统计点 |
| Long Beach | United States | 北美洲 | 4 | 普通统计点 |
| Macao | China | 亚洲 | 2 | 完整双档模型 |
| Malmo | Sweden | 欧洲 | 1 | 普通统计点 |
| Melbourne | Australia | 大洋洲 | 3 | 普通统计点 |
| Mexico City | Mexico | 北美洲 | 1 | 普通统计点 |
| Miami | United States | 北美洲 | 1 | 普通统计点 |
| Milan | Italy | 欧洲 | 1 | 普通统计点 |
| Minneapolis | United States | 北美洲 | 1 | 普通统计点 |
| Montreal | Canada | 北美洲 | 6 | 普通统计点 |
| Mountain View | United States | 北美洲 | 1 | 普通统计点 |
| Munich | Germany | 欧洲 | 1 | 普通统计点 |
| Nashville | United States | 北美洲 | 2 | 普通统计点 |
| New Orleans | United States | 北美洲 | 6 | 普通统计点 |
| New York | United States | 北美洲 | 3 | 普通统计点 |
| Nice | France | 欧洲 | 1 | 普通统计点 |
| Ottawa | Canada | 北美洲 | 1 | 普通统计点 |
| Paris | France | 欧洲 | 1 | 完整双档模型 |
| Philadelphia | United States | 北美洲 | 1 | 普通统计点 |
| Phoenix | United States | 北美洲 | 1 | 普通统计点 |
| Punta Cana | Dominican Republic | 北美洲 | 1 | 普通统计点 |
| Rio de Janeiro | Brazil | 南美洲 | 2 | 普通统计点 |
| Salt Lake City | United States | 北美洲 | 1 | 普通统计点 |
| San Diego | United States | 北美洲 | 5 | 普通统计点 |
| San Francisco | United States | 北美洲 | 4 | 完整双档模型 |
| San Juan | Puerto Rico | 北美洲 | 1 | 普通统计点 |
| Santiago | Chile | 南美洲 | 1 | 普通统计点 |
| Seattle | United States | 北美洲 | 6 | 完整双档模型 |
| Seoul | South Korea | 亚洲 | 3 | 完整双档模型 |
| Shenzhen | China | 亚洲 | 1 | 普通统计点 |
| Singapore | Singapore | 亚洲 | 4 | 完整双档模型 |
| Stockholm | Sweden | 欧洲 | 2 | 普通统计点 |
| Suzhou | China | 亚洲 | 1 | 普通统计点 |
| Sydney | Australia | 大洋洲 | 3 | 完整双档模型 |
| Tel Aviv | Israel | 亚洲 | 1 | 普通统计点 |
| Toronto | Canada | 北美洲 | 2 | 普通统计点 |
| Toulon | France | 欧洲 | 1 | 普通统计点 |
| Vancouver | Canada | 北美洲 | 8 | 完整双档模型 |
| Venice | Italy | 欧洲 | 1 | 普通统计点 |
| Vienna | Austria | 欧洲 | 3 | 普通统计点 |
| Washington | United States | 北美洲 | 2 | 普通统计点 |
| Yokohama | Japan | 亚洲 | 1 | 普通统计点 |

完整可筛选清单见 [city-model-catalog.csv](city-model-catalog.csv)。旧的 `landmark-city-inventory.csv` 是 2026-10-15 的第三方资产调研快照，不代表当前实现状态。

## 建模与验证

共享建模与合批工具在 `src/utils/cityMiniatureStudio.ts`；原三城在 `cityMiniatures.ts`，太平洋城市在 `cityMiniaturesPacific.ts`，亚洲新增组合在 `cityMiniaturesAsia.ts`。注册表 `src/data/globeLandmarks.ts` 为名称与模型覆盖的实现源。全部模型的几何数组、法线、UV、归一化包围盒、双档透明度与释放检查通过；每档按材质合批。

| 城市 | 区域三角形／网格 | 近景三角形／网格 |
|---|---:|---:|
| 巴黎 | 2,504 / 4 | 5,364 / 10 |
| 香港 | 1,092 / 3 | 4,968 / 9 |
| 温哥华 | 752 / 3 | 9,566 / 7 |
| 悉尼 | 1,224 / 3 | 5,400 / 9 |
| 西雅图 | 1,024 / 3 | 5,652 / 7 |
| 新加坡 | 1,180 / 6 | 4,588 / 10 |
| 北京 | 1,528 / 5 | 4,392 / 10 |
| 首尔 | 648 / 4 | 3,388 / 9 |
| 澳门 | 2,096 / 2 | 5,352 / 8 |
| 旧金山 | 3,260 / 3 | 4,624 / 9 |

本机 Node 中，10 城两档创建、几何检查及释放合计约 127ms。此数字不是浏览器首帧、帧率或手机性能结论。

## 官方形态参考

仅借鉴建筑的公开外观特征，未下载或改编第三方 3D 文件。形状、材质和组合由本项目代码生成：

- [悉尼歌剧院：球壳形态](https://www.sydneyoperahouse.com/our-story/the-spherical-solution)。
- [太空针塔：碟形观景层](https://www.spaceneedle.com/about/)。
- [金沙与莲花形艺术科学博物馆](https://www.marinabaysands.com/guides/exceptional-experiences/marina-bay-sands-architecture.html)。
- [北京天坛：三重檐圆形祈年殿](https://english.visitbeijing.com.cn/article/47ONy6AX0b3)。
- [首尔景福宫](https://english.visitseoul.net/PalaceArea/Gyeongbokgung-GyeongbokPalace/ENN000608)、[乐天世界塔的收分轮廓](https://www.kpf.com/project/lotte-world-tower)。
- [澳门大三巴牌坊：保留教堂前立面](https://www.macaotourism.gov.mo/en/sightseeing/churches/ruins-of-st-pauls)。
- [金门大桥：双塔、主缆与悬索结构](https://www.goldengate.org/exhibits/how-the-bridge-spans-the-golden-gate/)。

## 页面验证与效果图

2026-10-21，类型检查、Schema 校验、构建及本次源码 ESLint 通过。已在真实 Three.js 渲染中统一对照十城主地标与完整近景、浅色与深色背景；实际地图逐一验证本轮七城的选择器定位与四项景观名称。桌面地图检查澳门／香港邻城收缩和旧金山近景，另检查 375×812 浏览器窄屏中的新加坡夜间近景；窄屏模拟不代表实机性能或手势验收。

- [十城近景对照](/Users/vanesky/.codex/visualizations/2026/10/14/01a13930-9f8a-7e11-a8af-8243ef7383c3/ten-city-miniatures-near.png)。
- [十城区域主地标](/Users/vanesky/.codex/visualizations/2026/10/14/01a13930-9f8a-7e11-a8af-8243ef7383c3/ten-city-miniatures-regional.png)。
- [十城夜间背景](/Users/vanesky/.codex/visualizations/2026/10/14/01a13930-9f8a-7e11-a8af-8243ef7383c3/ten-city-miniatures-dark.png)。
- [澳门实际地图](/Users/vanesky/.codex/visualizations/2026/10/14/01a13930-9f8a-7e11-a8af-8243ef7383c3/ten-city-map-macao.png)、[旧金山实际地图](/Users/vanesky/.codex/visualizations/2026/10/14/01a13930-9f8a-7e11-a8af-8243ef7383c3/ten-city-map-san-francisco.png)。

对照页是本地验证工具，读取与地图相同的模型代码；不作为网站的新导航或微缩景观独立入口。
