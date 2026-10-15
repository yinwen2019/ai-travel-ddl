# Home — `#/`

Mode: Persuade。让首次访问者理解会议日程与城市旅行之间的联系，并进入四个功能视图。

## Direction contract

**THESIS:** 从一场会议出发看世界；用产品说明、真实城市举办记录和明确入口表达价值，不将会议列表继续用作默认首页。

**OWN-WORLD:** 冷蓝灰画布、墨蓝标题、系统字体、细线与开放排版；本地正投影地球作淡背景，国家色比例条与数字在前。

**STORY:** 先理解投稿与城市的联系，再由历史线下举办榜看见实际足迹；主行动进入 World，次行动进入 Conference，底部补齐 Year 与 City。

**FIRST VIEWPORT:** 桌面左侧两行标题「从一场会议，出发看世界。」、简介、两入口及覆盖数量；右侧 540px 静态地球叠前八城市榜；下方四个无框入口。手机依次排介绍、榜单、2×2 入口。

**FORM:** seed: none (unavailable)

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Authority and evidence

- 用户已确认蓝色原型并授权首页实现。原型：`/Users/vanesky/.codex/visualizations/2026/10/15/01a13eef-73fb-70a1-b038-4a792ba4ef1f/homepage-direction/atlas-homepage.html`；后续用户确认及当前组件、CSS 优先于原型中的旧尺寸。
- 当前实现：`HomePage.vue`、`HomeGlobe.vue`、`HomeCityRanking.vue`、`home.css`、`main.css`；截图：`.impeccable/review/{desktop,mobile,narrow,tablet,dark}.png`。交付记录见 `.docs/16-homepage-result.md`。
- 本轮没有正式概念 seed、QUALITYBAR、card 或生成的 decision comp；context launcher 曾因权限拒绝未运行，改读既有 `.docs`。这些是流程证据边界，不是产品页面文案。
- 视觉与响应式审阅未发现实质问题；唯一待修复项为方向和产品背景未持久化。补齐文档后，复核该 persistence finding 已解决，documentation-only verdict 为 `ship`；此复核范围仅覆盖文档修复，不表示重新执行全部视觉检查。
