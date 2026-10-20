<div align="center">

# AI Travel DDL ✈️

### 从一场会议，出发看世界。

面向 AI 研究者与学生的会议日程与目的地导航。<br />
查投稿 DDL、看会议时间，也提前认识下一座学术城市。

<p>
  <a href="./README.md"><img src=".github/assets/readme/lang-zh-active.svg" alt="简体中文（当前语言）" width="112" height="34" /></a>
  <a href="./README.en.md"><img src=".github/assets/readme/lang-en.svg" alt="Switch to English" width="112" height="34" /></a>
</p>

**[打开网站 →](https://yinwen2019.github.io/ai-travel-ddl/)** · [查看会议 DDL](https://yinwen2019.github.io/ai-travel-ddl/#/conference) · [探索世界地图](https://yinwen2019.github.io/ai-travel-ddl/#/world)

无需注册 · 浏览器直接使用 · 支持手机与深色模式

</div>

[![AI Travel DDL 首页：会议入口、学术城市与历年举办榜](.github/assets/readme/home.png)](https://yinwen2019.github.io/ai-travel-ddl/)

## 写完论文，也期待下一次出发

准备投稿时，我们关心摘要和正文什么时候截止；准备参会时，又开始关心会议在哪座城市、什么时候举办、附近有什么值得看看。

AI Travel DDL 把这些信息串在一起：从关注一场会议，到安排一年的研究日程，再到探索会议背后的城市。希望它既能成为你的投稿参考，也能为下一次学术旅行带来一点期待。

## 你想从哪里开始？

| 你想做的事 | 从这里进入 | 可以看到什么 |
| --- | --- | --- |
| 关注某个会议，查看下一届安排 | [会议视图](https://yinwen2019.github.io/ai-travel-ddl/#/conference) | 按会议搜索、分类筛选；逐行浏览历年届次、日期节点、举办地与官网 |
| 把一年的投稿安排放在一起看 | [年份视图](https://yinwen2019.github.io/ai-travel-ddl/#/year) | 按年份浏览会议卡片，查看摘要、正文、开会与结束等节点及倒计时 |
| 看看 AI 会议把研究者带到了哪里 | [世界视图](https://yinwen2019.github.io/ai-travel-ddl/#/world) | 交互式三维地球、会议城市分布与历年举办城市表，支持城市定位 |
| 提前了解参会目的地 | [城市视图](https://yinwen2019.github.io/ai-travel-ddl/#/cities) | 搜索城市与国家，按大洲或旅行指南筛选，查看关联会议与已收录的旅行资料 |

## 实际界面

### 在世界地图上，追寻学术足迹

拖动地球、定位城市，查看会议在世界各地的分布。放大后，部分城市还可以探索原创微缩地标。

[![世界视图：三维地球、会议城市分布与定位控件](.github/assets/readme/world.png)](https://yinwen2019.github.io/ai-travel-ddl/#/world)

<details>
<summary><strong>查看会议视图：从下一次投稿，到下一个目的地</strong></summary>

每个会议独占一行，左右切换不同年份；搜索和分类筛选帮助你聚焦关注的会议。

[![会议视图：会议筛选、历年卡片与日期里程碑](.github/assets/readme/conference.png)](https://yinwen2019.github.io/ai-travel-ddl/#/conference)

</details>

<details>
<summary><strong>查看城市视图：看景点、季节与当地美食</strong></summary>

从会议举办地进入城市详情，查看已有的气候、景点、美食、旅行贴士与全部关联会议。旅行指南目前覆盖部分城市，其余城市仍可查看会议记录。

[![城市视图：目的地搜索、大洲筛选与旅行指南](.github/assets/readme/cities.png)](https://yinwen2019.github.io/ai-travel-ddl/#/cities)

</details>

截图为当前版本的展示快照；会议日期、倒计时与覆盖范围以网站实时展示为准。

## 收录会议

目前收录以下 13 个 AI 会议，包含历年举办信息与已公布的未来届次信息：

| 领域 | 会议 |
| --- | --- |
| 计算机视觉 | CVPR · ICCV · ECCV |
| 自然语言处理 | ACL · EMNLP · NAACL |
| 机器学习 | NeurIPS · ICML · ICLR |
| AI 综合与多媒体 | AAAI · IJCAI · ACM MM |
| 数据挖掘 | KDD |

欢迎通过 [Issue](https://github.com/yinwen2019/ai-travel-ddl/issues) 提议补充会议，或纠正日期与举办地点。

## 数据与功能说明

- **信息维护**：会议数据保存在版本管理中的 JSON 文件中；GitHub Actions 定期运行 AI 辅助检索与校验，有变更时创建更新 PR，审核合并后发布。
- **日期核对**：会议安排可能调整，投稿截止日期及其时区、注册与出行信息请以对应会议官网为准。尚未确认的信息显示「待公布」。
- **旅行资料**：旅行指南仅覆盖部分城市；原创三维地标是城市意象，不代表真实布局或会议场馆。
- **语言支持**：README 支持中英文切换，网站界面目前以中文为主。

计划逐步补充日历导出、Deadline 提醒、会议收藏、网站中英文切换及更多旅行信息。**这些功能目前尚未提供**，欢迎在 Issue 中告诉我们最需要哪一项。

## 本地运行与贡献

只想查会议信息？直接[打开网站](https://yinwen2019.github.io/ai-travel-ddl/)即可，无需安装或配置 API Key。

如需本地开发，使用 Node.js 24（与本项目 GitHub Actions 一致）及 npm：

```bash
git clone https://github.com/yinwen2019/ai-travel-ddl.git
cd ai-travel-ddl
npm ci
npm run dev
```

打开终端显示的本地地址，默认为 `http://localhost:5173`。

<details>
<summary><strong>开发说明：技术栈、项目结构与常用命令</strong></summary>

**技术栈**：Vue 3 · TypeScript · Vite · Tailwind CSS · Vue Router（Hash 路由）· Three.js / Globe.GL · JSON Schema / Ajv · Python · GitHub Actions / Pages。

```text
data/           会议数据、城市旅行资料与校验 Schema
src/            页面、组件、只读数据聚合与样式
scripts/        数据校验与 AI 辅助更新脚本
public/         网站静态资源
.github/        自动更新、部署流程与 README 图片
.docs/          需求、架构与实现说明
```

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地开发服务 |
| `npm run validate` | 校验会议与城市 JSON 数据 |
| `npm run type-check` | TypeScript 类型检查 |
| `npm run build` | 数据校验并构建生产版本 |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | ESLint 检查并自动修复 |
| `npm run format` | 格式化前端代码 |

前端本地运行不需要 AI 服务密钥。若要运行数据更新脚本，请参阅 [AI 更新流程](.docs/08-ai-update-pipeline.md) 与 [.env.example](.env.example)，使用 Python 3.11+ 并配置所需服务。

</details>

欢迎修正会议信息、补充城市资料，或改进界面。提交数据变更时，请附上官方来源链接、核对日期与时区，并运行：

```bash
npm run validate
npm run type-check
npm run build
```

开发约定见 [AGENTS.md](AGENTS.md)，数据格式见 [数据 Schema 说明](.docs/04-data-schema.md)。

---

如果它帮你安排了下一次投稿，或让你开始期待下一座城市，欢迎收藏[网站](https://yinwen2019.github.io/ai-travel-ddl/)，也欢迎给项目一个 ⭐。

**Finish the paper, catch the flight, and explore the world.**
