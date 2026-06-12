<p align="center">
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=220&color=0:1a1a2e,50:16213e,100:0f3460&text=AI%20Writing%20Assistant&fontColor=7ec8a0&fontSize=64" alt="AI Writing Assistant Banner" />
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-111827.svg?style=for-the-badge" alt="MIT" /></a>
  <img src="https://img.shields.io/badge/Runtime-Browser%20Only-0f766e.svg?style=for-the-badge" alt="Browser Only" />
  <img src="https://img.shields.io/badge/Privacy-Local%20Storage-1d4ed8.svg?style=for-the-badge" alt="Local Storage" />
  <img src="https://img.shields.io/badge/Stack-Vue%203%20|%20TipTap%20|%20Naive%20UI-7ec8a0.svg?style=for-the-badge" alt="Tech Stack" />
</p>

<p align="center">
  <a href="https://github.com/Geekmister/ai-writing-assistant/stargazers">
    <img src="https://img.shields.io/github/stars/Geekmister/ai-writing-assistant?style=flat-square&label=Stars&color=f59e0b" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/Geekmister/ai-writing-assistant/network/members">
    <img src="https://img.shields.io/github/forks/Geekmister/ai-writing-assistant?style=flat-square&label=Forks&color=0ea5e9" alt="GitHub Forks" />
  </a>
  <a href="https://github.com/Geekmister/ai-writing-assistant/issues">
    <img src="https://img.shields.io/github/issues/Geekmister/ai-writing-assistant?style=flat-square&label=Issues&color=ef4444" alt="GitHub Issues" />
  </a>
  <a href="https://github.com/Geekmister/ai-writing-assistant/commits">
    <img src="https://img.shields.io/github/last-commit/Geekmister/ai-writing-assistant?style=flat-square&label=Last%20Commit&color=22c55e" alt="Last Commit" />
  </a>
  <img src="https://visitor-badge.laobi.icu/badge?page_id=Geekmister.ai-writing-assistant" alt="Visitors" />
</p>

<br>

> 一个纯前端、本地运行的 AI 写作辅助工具。基于 TipTap 富文本编辑器 + OpenAI API，解决 AI 对话式写作中「生成后无法迭代修改」和「每次重复输入提示词」的两大痛点。

---

![Page preview](page-preview.png)

> 截图待补充。你可以截取编辑界面后替换此图片。

---

## ✨ 核心功能

| Emoji | 功能 | 说明 |
|-------|------|------|
| 📝 | 富文本编辑器 | 基于 TipTap，支持标题/加粗/斜体/列表/引用等常见格式 |
| 🎯 | 选区操控 | 选中任意段落或句子，悬浮工具栏一键操作 |
| ✍️ | AI 重写 | 完全改写选中内容，保持原意，改变表达方式 |
| 📏 | 句子微调 | 缩写/扩写/改语气(8种)/改人称/改句式，全部支持 |
| 🎨 | 多版本对比 | AI 一次生成 2~3 个版本，标签页切换，一键替换原文 |
| 📚 | 素材库 | 预置剧情/金句/梗库模板，支持手动注入和自动关键词匹配 |
| 🖌️ | 风格库 | 保存个人写作风格，支持手动填写、范文自动提取、AI 深化分析 |
| 🧠 | 智能推荐 | 基于当前文档前 500 字，调用 AI 推荐最匹配的写作风格 |
| 🔒 | 纯本地运行 | 所有数据存储在浏览器 IndexedDB，无需后端服务器 |
| ⚙️ | 数据管理 | 支持一键导出/导入全部数据 (JSON)，随时备份恢复 |
| 🌙 | 暗色工具台 | 深色工具台风格 UI，长时间写作不疲劳 |

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- 现代浏览器 (Chrome / Edge / Firefox / Safari 最近两个大版本)

### 安装与运行

```bash
git clone https://github.com/geekmister/ai-writing-assistant.git
cd ai-writing-assistant
npm install
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173) 即可使用。

### 配置 OpenAI

1. 获取 [OpenAI API Key](https://platform.openai.com/api-keys)
2. 在应用内点击右上角 ⚙️ → **AI 服务** Tab
3. 填入 API Key，选择模型 (GPT-3.5 Turbo / GPT-4)
4. 开始写作！

## 📁 项目结构

```plain
ai-writing-assistant/
├── src/
│   ├── components/          # 组件
│   │   ├── editor/          # 编辑器 + 悬浮工具栏 + 扩展
│   │   ├── panels/          # 右侧面板 (生成/素材/风格)
│   │   ├── document/        # 文档列表侧边栏
│   │   ├── settings/        # 设置弹窗
│   │   └── common/          # 通用组件 (图标/主题/加载等)
│   ├── stores/              # Pinia 状态管理 (6 个 store)
│   ├── services/            # 服务层
│   │   ├── ai/              # OpenAI API 调用 + 提示词模板
│   │   ├── storage/         # IndexedDB CRUD
│   │   └── nlp/             # 中文 NLP (jieba-wasm 分词)
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   ├── config/              # 主题配置
│   ├── router/              # Vue Router (Hash 模式)
│   └── views/               # 页面视图
├── docs/
│   └── v1.0.0 迭代（MVP）.md
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 + TypeScript |
| 富文本编辑器 | TipTap (ProseMirror) |
| UI 组件库 | Naive UI |
| 状态管理 | Pinia |
| 本地存储 | Dexie.js (IndexedDB) |
| 中文 NLP | jieba-wasm (结巴分词 WASM) |
| AI 调用 | 原生 fetch → OpenAI API |
| 构建工具 | Vite |
| 路由 | Vue Router 4 (Hash) |
| 图标 | Xicons (Ionicons 5) |

## 🤝 贡献指南

### 🐛 报告问题

- 提交 Issue 前请先搜索是否已有重复
- 清晰描述问题、复现步骤和预期行为
- 附上截图和环境信息更佳

### 🚀 提交 Pull Request

1. Fork 本仓库，从 `develop` 分支创建新分支
2. 遵循 Conventional Commits 规范提交
3. 确保代码通过 lint 检查和类型检查 (`npm run typecheck`)
4. 涉及功能变更时更新相关文档

### 🎨 代码风格

- 使用 Vue 3 Composition API + `<script setup>` 语法
- 遵循项目内置的 ESLint + Prettier 规则
- 组件保持单一职责，合理拆分
- 变量和函数名使用有意义的英文命名

### 📝 Commit 规范

严格遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档变更
- `style`: 格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `chore`: 构建/工具链变更

## 📊 项目看板

<p align="center">
  <a href="https://star-history.com/#Geekmister/ai-writing-assistant&Date">
    <img alt="Star History Chart" width="100%" src="https://api.star-history.com/svg?repos=Geekmister/ai-writing-assistant&type=Date" />
  </a>
</p>

<p align="center">
  <img alt="Commit Activity Graph" src="https://github-readme-activity-graph.vercel.app/graph?username=Geekmister&bg_color=ffffff&color=1f2937&line=7ec8a0&point=1a1a2e&area=true&hide_border=true" />
</p>

## 📄 License

[MIT License](LICENSE) — 允许商业使用，保留版权声明。

---

<p align="center">
  <a href="https://github.com/Geekmister/ai-writing-assistant">
    <img src="https://capsule-render.vercel.app/api?type=waving&height=120&color=0:0f3460,50:16213e,100:1a1a2e&section=footer&text=Happy%20Writing!&fontColor=7ec8a0&fontSize=28" alt="Footer" />
  </a>
</p>
