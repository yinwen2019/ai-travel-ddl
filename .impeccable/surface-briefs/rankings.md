# Rankings — `#/rankings`

Mode: Operate。研究者比较城市举办记录、会议与城市热度，并为希望承办会议的城市投票。

## Direction contract

**THESIS:** 用可解释的榜单连接已发生的学术足迹与下一次出发的意愿。真实举办记录先行，未开启的热度统计明确留空。

**OWN-WORLD:** 沿用已确认的冷蓝灰地图册、系统字体、开放式行与细分隔线。名次、实体名称、关联会议和数值形成稳定阅读轴；不新增字体、图片或动效依赖。

**STORY:** 首页轮播发现四类榜单，进入 Rankings 后选榜、搜索、查看完整记录；期待通过独立按钮表达。热度与期待的数据来源始终可理解。

**FIRST VIEWPORT:** 标题与简介，下接四个可切换榜单入口；左侧完整排名列表与搜索，右侧窄栏解释当前统计口径。手机按榜单、搜索、口径摘要、列表顺序排列，表格转紧凑行。

**FORM:** 既有视觉系统的代码扩展；seed: none (unavailable)。标志性交互为首页榜单切换与爱心支持的短促确认；首页仅采用内容两侧箭头手动切榜，不显示顶部四项导航，不自动轮播。

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Motion thesis

- Focal moment：支持按钮的爱心短弹与浮动 +1；本机数值真实递增。
- Continuity：首页四榜切换使用短淡入，不推移地球或简介；面板高度保持稳定。
- Feedback：榜单选中、暂停状态与期待按钮即时反馈，快速重复操作可中断。
- Budget：仅 CSS transform / opacity；无需 GSAP，减少动态效果保留数值和文字确认。

## Scope and pending decisions

2026-10-16 用户确认：热度按主动对象点击累计，真实重复点击分别计数，组件自动状态变化不计；全部累计，不分近期。城市期待是希望城市承办会议，允许重复 +1、不撤销；支持采用爱心连续 +1。小红书默认链接为 `https://xhslink.cn/o/5YIh8OKvkvn`。

本轮为本机交互和统计推进方案；Cloudflare Worker + D1 免费档方向已确认，实际账户资源和服务接入留待下一阶段。期待与支持先标为本机记录，不冒充全站汇总。静态会议 JSON 保持只读。
