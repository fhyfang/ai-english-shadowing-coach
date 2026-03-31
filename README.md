
👉 **[Try the Live Demo Here! 在线体验请点击这里](https://ais-pre-xpqzywc5zjh64n2wgrekbz-122397365735.us-west1.run.app)** 👈  

> 本项目面向以中文为母语、希望系统提升英语口语与听力的学习者，通过「真实场景 + 高频词汇 + 跟读 + 多模态发音纠错」打造一个完整的英语口语学习闭环。

---

## English Overview

Daily Dictation & Shadowing is an **AI-powered English learning app** for Chinese native speakers.  
It provides scenario-based dictation, shadowing practice, and pronunciation evaluation, built with React, TypeScript, and the Google Gemini API.

You can:

- Generate custom scenarios (e.g. “Ordering coffee at Starbucks”)
- Listen to native-like TTS audio and shadow it repeatedly
- Get context-aware explanations for any word or phrase
- Record your own reading and get AI pronunciation evaluation
- Read detailed grammar and vocabulary breakdown for each lesson

---

## 功能一览 / Features

> 可以把它理解为一个「场景式英语口语训练机」：前台是你看到的页面和音频，后台是一整套「生成 → 听 → 说 → 纠错 → 讲解」的闭环引擎。

### 🎯 场景定制（Custom Scenario Generation）

- 输入任何你需要的场景，例如：  
  - 「在咖啡馆点单」、 「在面试中自我介绍」、 「电话里向客户解释延期」
- AI 会根据场景生成 50–100 词的英语短文或对话，使用高频、实用的表达。
- 文本复杂度适合日常交流和职场沟通，不是考试体。

### 🎧 原声听力 & Shadowing（Immersive Reading & Audio）

- 使用 Gemini 2.5 Flash TTS 生成高质量 TTS 音频，接近母语者语音。
- 提供 **「Play 5 Times」自动连播**，专门为 shadowing 练习设计，帮助建立发音「肌肉记忆」。

### 📖 划词精讲（Contextual Word Explanation）

- 高亮文中任何单词或短语（最长 5 词），即可获得：
  - IPA 音标  
  - 词性  
  - 中文释义  
  - 常见搭配 / 固定表达  
  - 在当前语境中的用法说明  
- 不是简单「查词」，而是上下文驱动的讲解。

### 🗣️ 发音指南（Pronunciation Guide）

- 基于整段文本，生成个性化**发音攻略**：
  - 连读（linking）  
  - 重音（stress）  
  - 爆破音弱化（loss of plosion）  
  - 语流节奏（rhythm）  
- 可以理解为「老师提前告诉你，这段话哪些地方中国人最容易读错」。

### 🎙 跟读练习（Shadowing Practice）

- 在浏览器内直接录音，跟读整段文本。
- 不依赖本地应用，无需安装额外软件。

### 💯 多模态发音评估（AI Pronunciation Evaluation）

- 提交录音后，AI 会从文本 + 语音两个维度进行评估：
  - 100 分制总分  
  - 总体反馈（优点 + 需要改进的方向）  
  - 针对具体单词 / 短语的纠错建议  
  - 每个纠错点都配有**正确发音音频回放**

### 👩🏫 深度讲解（In-depth Explanation）

- 对生成文本进行「老师级别」的拆解，包括：
  - 语法结构  
  - 关键句型  
  - 高频词 & 搭配  
  - 可迁移到其他场景的表达方式  
- 适合作为你自己做 Anki 卡片或笔记的原材料。

---

## 技术架构总览 / Architecture

可以粗略把系统理解为两层：

- **前端应用（学习界面）**
  - 场景输入 & 课程生成界面  
  - 文本展示 + 高亮选词解释  
  - 音频播放 & 「Play 5 Times」循环  
  - 录音控制 & 评估结果展示  

- **AI 服务层（Gemini API 封装）**
  - 场景文本生成（`gemini-3-flash-preview`）  
  - 讲解 & 发音指导生成  
  - 发音多模态评估  
  - TTS 语音生成（`gemini-2.5-flash-preview-tts`）  

代码层面的大致目录结构：

- `src/components`  
  - 场景设置、音频播放器、录音器、评估结果面板等 UI 组件  
- `src/hooks`  
  - 与录音、播放状态、请求状态相关的 React Hooks  
- `src/services` / `src/lib`  
  - 与 Google Gemini API 的交互封装  
- `src/types`  
  - 各类请求 / 响应的 TypeScript 类型定义  

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite  
- **Styling**: Tailwind CSS  
- **Icons**: Lucide React  
- **Markdown Rendering**: React Markdown  
- **AI & Backend Services**: Google Gemini API  
  - `gemini-3-flash-preview` 用于生成场景文本、讲解、评估  
  - `gemini-2.5-flash-preview-tts` 用于生成 TTS 音频  

---

## 🚀 快速开始（Quick Start）

> 如果你只想快速跑起来，按下面几步执行即可。

### 环境准备

- Node.js（v18 或以上）  
- npm 或 yarn  
- 一个 **Google Gemini API Key**

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/fhyfang/ai-english-shadowing-coach.git

# 2. 进入项目目录
cd ai-english-shadowing-coach

# 3. 安装依赖
npm install

# 4. 配置环境变量（推荐使用 .env 文件）
cp .env.example .env
# 然后在 .env 中填入你的 Gemini API Key：
# VITE_GEMINI_API_KEY=your_api_key_here

# 5. 启动本地开发服务器
npm run dev
```

在浏览器中访问：`http://localhost:5173`（Vite 默认端口）  
如果你希望使用 `http://localhost:3000`，可以在 `vite.config.ts` 中调整端口配置。

---

## 🔐 API Key & 安全说明（Important）

本项目作为**教学 / 个人学习**项目，当前架构是前端直接调用 Gemini API。

这意味着：如果你将项目部署到公网，前端代码中暴露的 API Key 有被滥用的风险。

建议：

- 不要将真实的高权限 API Key 用于公开 Demo。  
- 生产环境请使用**后端代理服务**封装对 Gemini 的调用，在后端持有 API Key。  
- 如果只是本地学习和自用，可以接受一定风险，但仍建议设置调用限额（比如通过账单和配额控制）。

---

## 📝 使用指南 / Usage Flow

> 可以把它想象成你每天的「口语训练流程模板」。

1. 在 **「Scenario Setup」场景输入区** 输入你想练习的场景（中文或英文都可以）。  
2. 点击 **「Generate Lesson」** 生成一段英语文本和对应音频。  
3. 先**纯听 1–2 遍**，大致感受语速、语调和节奏。  
4. 使用 **「Play 5 Times」**，跟着音频做 shadowing 跟读：  
   - 第 1–2 遍：对照文本，允许看着读  
   - 第 3–5 遍：尽量脱稿模仿语调和节奏  
5. 遇到不理解的单词或短语，**划词查看精讲**。  
6. 阅读 **Pronunciation Guide**，对照提示再跟读几遍。  
7. 点击 **「Start Recording」**，通读整段文本，读完后点击 **「Stop Recording」**。  
8. 点击 **「Evaluate My Pronunciation」** 获取发音评分和纠错建议。  
9. 对照每个纠错点的**参考音频**，单点突破，再读一遍。

建议你把这个流程当成「日更模版」：每天只换场景，但训练路径保持一致。

---

## 🤝 如何贡献（Contributing）

欢迎任何形式的贡献：修 bug、加 feature、优化文案、改学习流程都可以。

### 本地开发建议

```bash
# 代码检查
npm run lint

# 类型检查（如果已配置）
npm run type-check

# 构建产物
npm run build
```

### 贡献流程（建议）

1. Fork 此仓库。  
2. 从 `main` 创建新分支（例如 `feature/add-record-history`）。  
3. 在本地实现并自测（包括基本功能和 ESLint / Type Check）。  
4. 提交时使用简洁的英文 Commit 信息。  
5. 发起 Pull Request，简单说明：
   - 改了什么？  
   - 为什么要改？  
   - 如何验证？  

未来会在仓库中补充更详细的 `CONTRIBUTING.md` 和代码规范说明。

---

## 🔭 设计理念 & Roadmap

### 为什么要做这个项目？

- 很多中国学习者的英语问题，不在「不会做题」，而在「缺乏真实语境 + 口腔肌肉没训练过」。  
- 传统学习路径是：**单词 → 语法 → 句子 → 课文 → 情景**；  
  而本项目的路径是：**情景 → 表达 → 跟读 → 纠错 → 拆解**，更接近真实使用场景。  
- 目标是：让你每天花 10–20 分钟，**在接近真实语境的内容里练到「能开口、开得自然」**。

### Roadmap（规划中的方向）

- 学习记录持久化：保存每次生成的场景、评分和纠错记录  
- 难度分级：支持按 CEFR 等级或自定义「难度标签」生成文本  
- 场景模版库：预置常用场景（旅行、职场会议、面试、Presentation 等）  
- 导出能力：一键导出为 Anki 卡片或 Markdown 笔记  
- PWA / 移动端优化：更方便在手机上做跟读练习  
- 后端代理版本：提供更安全的生产级架构示例  

如果你对其中某一项感兴趣，也欢迎直接提 Issue 或 PR 一起来打磨。

---

## 📸 截图（Screenshots）

> 占位说明：当你准备好图片时，将下方文本替换为真实截图链接。

- 主界面：场景输入 + 文本 + 音频播放  
- 评估结果页面：总分 + 纠错列表 + 音频回放  

（将来可上传到 `docs/` 或 `assets/` 目录，并在此处用 Markdown 图片引用。）

---

## 📄 License

本项目使用 **MIT License**。  
你可以自由地使用、修改和分发本项目，但请保留原始版权声明。
