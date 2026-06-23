# AI Travel DDL ✈️

> Track AI conference deadlines and explore where research can take you.

AI Travel DDL 是一个面向 AI 研究者和学生的顶会信息与学术旅行导航网站。

项目集中展示人工智能领域主要会议的投稿截止时间、会议日期和举办地点，并通过会议视图、年份视图和世界地图，帮助研究者快速了解近期投稿计划与未来会议目的地。同时，我们希望将科研计划与学术旅行连接起来——在提醒你准备下一篇论文的同时，也让你提前看到论文之外的目的地。

> Finish the paper, catch the flight, and explore the world. ✈️

🌐 **在线访问：**
https://yinwen2019.github.io/ai-travel-ddl/

📦 **项目仓库：**
https://github.com/yinwen2019/ai-travel-ddl



## 项目特色

AI Travel DDL 不只是一个会议 Deadline 列表，也希望成为一个轻量化的 AI 学术会议与旅行信息入口。

你可以通过本项目：

* 查看主要 AI 顶会的投稿截止时间
* 查看会议日期与举办地点
* 按会议或年份浏览会议信息
* 在世界地图上查看会议分布
* 浏览会议举办地的气候、美食和景点
* 快速搜索和筛选关注的会议



## 当前版本更新

当前版本主要完成了以下更新：

* [x] 使用 GitHub Actions 定时自动更新会议信息
* [x] 补充和更新遗漏的会议举办地点及相关信息
* [x] 解决不同会议在 Upcoming 状态下对应年份不一致的逻辑问题



## 已完成功能

* [x] AI 顶会 Deadline、会议日期与举办地点展示
* [x] 会议视图、年份视图和世界地图视图
* [x] 会议搜索、分类筛选与年份切换
* [x] 会议详情、历史举办地点与地点信息展示
* [x] 会议数据自动更新、数据校验与 GitHub Pages 自动部署
* [x] 深色模式与移动端响应式布局



## 待办需求

* [ ] ⭐⭐完成旅行地需求：完善举办地交通、签证、住宿和旅行规划信息
* [ ] ⭐支持用户本地时区转换、日历导出和 Deadline 提醒
* [ ] ⭐增加会议收藏、个性化筛选与订阅功能
* [ ] 完善会议信息来源、数据更新时间与错误反馈机制
* [ ] 优化自动更新策略（当前已通过 GitHub Actions 实现基础自动更新）
* [ ] 增加中英文切换、PWA 与更多移动端体验优化



## 技术栈

* **Vue 3**：前端应用框架
* **TypeScript**：类型安全
* **Vite**：开发与构建工具
* **Vue Router**：页面路由
* **Tailwind CSS**：界面样式
* **Leaflet**：地图展示与地点交互
* **JSON Schema**：会议数据结构校验
* **Python**：会议数据维护脚本
* **GitHub Actions**：定时更新与自动部署
* **GitHub Pages**：静态网站托管



## 本地运行

确保本地已经安装 Node.js 和 npm。

```bash
# 克隆项目
git clone https://github.com/yinwen2019/ai-travel-ddl.git

# 进入项目目录
cd ai-travel-ddl

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动后，在浏览器中打开终端显示的本地地址即可访问。



## 常用命令

```bash
# 启动开发环境
npm run dev

# 校验会议与地点数据
npm run validate

# TypeScript 类型检查
npm run type-check

# 代码检查
npm run lint

# 格式化代码
npm run format

# 构建生产版本
npm run build

# 本地预览生产版本
npm run preview
```



## 数据结构

项目的主要数据位于：

```text
data/
├── conferences.json   # 会议及历年 Deadline 数据
├── locations.json     # 城市、气候、美食和景点数据
└── schema.json        # JSON 数据结构定义
```

修改会议或地点数据后，请运行：

```bash
npm run validate
```

确保数据通过校验后再进行提交。


## 项目结构

```text
ai-travel-ddl/
├── .github/
│   └── workflows/        # 自动部署与数据更新
├── data/                 # 会议和地点数据
├── public/               # 公共静态资源
├── scripts/              # 数据维护与校验脚本
├── src/
│   ├── assets/           # 地图等资源
│   ├── components/       # Vue 页面与组件
│   ├── composables/      # 状态与业务逻辑
│   ├── data/             # 前端数据模块
│   ├── styles/           # 全局样式
│   ├── types/            # TypeScript 类型
│   └── utils/            # 工具函数
└── package.json
```



## 贡献指南

欢迎通过 Issue 或 Pull Request 参与项目维护，例如：

* 补充新的 AI 会议
* 修正错误或过期的 Deadline
* 更新会议举办时间和地点
* 补充城市、气候、美食和景点信息
* 改进页面设计和交互体验
* 提出新的功能建议

提交会议信息时，请尽量：

1. 使用会议官方网站作为信息来源。
2. 核对 Deadline 日期和时区。
3. 保持现有 JSON 数据格式。
4. 提交前运行：``npm run validate``

5. 在 Pull Request 中注明信息来源。



## 数据说明

会议时间、投稿截止日期和举办地点可能随时发生变化。

本项目会尽力保持数据准确，但所有信息仅供参考。正式投稿、注册或预订行程前，请务必前往会议官方网站进行最终确认。



## Star

如果这个项目对你的科研计划或学术旅行有所帮助，欢迎点亮一个 ⭐。

你的支持将帮助项目持续维护更多会议与目的地信息。
