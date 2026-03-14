# AI 求职助手 — 最小改造方案

基于当前 ai-chat-web 项目，在不大改底层的前提下，先实现 3 个功能：**JD 分析**、**简历匹配分析**、**定向润色**。

---

## 1. 哪些文件可以复用（不改或只改引用）

| 文件 | 说明 |
|------|------|
| `src/main.js` | 入口，不动 |
| `src/App.vue` | 根组件，不动 |
| `src/stores/theme.js` | 主题，不动 |
| `src/stores/chat.js` | 仅给「自由对话」页用，本方案暂不拆 store，三个新功能页先不用 |
| `src/api/chat.js` | 流式请求，三个新页面都可直接调用 |
| `src/api/chat-axios.js` | 非流式请求，可选用于「一键出结果」的简单场景 |
| `src/utils/request.js` | axios 封装，不动 |
| `src/utils/markdown.js` | 结果展示用，三个新页面复用 |
| `src/assets/main.css` | 全局样式，不动 |
| `src/views/ChatView.vue` | 保留为「自由对话」入口，弱化即可 |

---

## 2. 哪些页面需要新建

| 页面 | 路径 | 职责 |
|------|------|------|
| **JD 分析** | `/jd` | 输入 JD 文本（粘贴或上传文件）→ 调用 AI 分析 → 下方展示结果（Markdown） |
| **简历匹配分析** | `/resume-match` | 输入 JD + 简历文本 → 调用 AI 做匹配度与建议 → 展示结果 |
| **定向润色** | `/polish` | 输入简历内容 + 目标方向（或 JD）→ 调用 AI 润色 → 展示结果 |

三个页面结构统一：**上方表单（输入区） + 提交按钮 → 下方结果区（Markdown 渲染）**。先不做多会话、不做侧边栏，保证能跑。

---

## 3. 哪些旧页面可以删除或弱化

| 页面 | 建议 |
|------|------|
| **HomeView.vue** | **改内容不删**：标题改为「AI 求职助手」，放 3 个功能卡片（JD 分析 / 简历匹配 / 定向润色）+ 可选「自由对话」小链接 |
| **ChatView.vue** | **保留但弱化**：路由保留 `/chat`，首页不主推，仅作为「自由对话」入口；内部可删「角色」下拉改为固定求职助手，或先不动 |
| **AboutView.vue** | 未参与路由，可忽略或后续删 |

不删除任何现有路由，只增加 3 条新路由，避免破坏现有能力。

---

## 4. Store 应该怎么拆

**最小方案：不拆、不加新 store。**

- **theme**：保持原样，三个新页面用 `useThemeStore()` 做深色模式。
- **chat**：仅给 `ChatView.vue` 用，三个新功能页**不接 chat store**，各自用页面内 `ref` 维护：
  - 输入内容、结果内容、loading、error
  - 直接调 `src/api/chat.js` 的 `sendChatRequestStream` 或 `sendChatRequestByAxios`
- **counter**：未使用，可删可留。

后续若要做「每个功能下的历史记录」，再考虑：
- 给 `sessions` 增加字段如 `type: 'jd' | 'resume-match' | 'polish'`，按路由过滤展示；
- 或为三个功能单独做一个 `jobAssistant` store，再决定是否和 chat 合并。

---

## 5. 路由应该怎么改

在 `src/router/index.js` 中：

- **保留**：`/` → Home，`/chat` → ChatView
- **新增**：
  - `/jd` → JdAnalysisView（JD 分析）
  - `/resume-match` → ResumeMatchView（简历匹配分析）
  - `/polish` → PolishView（定向润色）

```text
/             → HomeView（新首页：3 个功能卡片）
/jd           → JdAnalysisView（新建）
/resume-match → ResumeMatchView（新建）
/polish       → PolishView（新建）
/chat         → ChatView（保留，弱化）
```

---

## 6. 每一步建议改哪些文件

按顺序做，每步都能跑。

---

### 步骤 1：改首页为「AI 求职助手」入口

**改文件：** `src/views/HomeView.vue`

- 标题改为「AI 求职助手」、描述改为求职场景。
- 三个主按钮/卡片：
  - 「JD 分析」→ `router.push('/jd')`
  - 「简历匹配分析」→ `router.push('/resume-match')`
  - 「定向润色」→ `router.push('/polish')`
- 可选：底部或角落放「自由对话」→ `router.push('/chat')`。

不动路由、不动 store，只改文案和跳转。

---

### 步骤 2：路由增加三条

**改文件：** `src/router/index.js`

- `import JdAnalysisView from '../views/JdAnalysisView.vue'`
- `import ResumeMatchView from '../views/ResumeMatchView.vue'`
- `import PolishView from '../views/PolishView.vue'`
- 在 `routes` 里追加 3 条：`path: '/jd'`、`/resume-match`、`/polish`，对应 name 和 component。

先不创建三个 vue 文件会报错，所以**步骤 3～5 可与步骤 2 同批做**（见下）。

---

### 步骤 3：新建「JD 分析」页

**新建文件：** `src/views/JdAnalysisView.vue`

- 用 `useThemeStore()` 做深色样式类名（可抄 HomeView/ChatView 的 class 结构）。
- 状态：`jdText`（ref）、`result`（ref）、`loading`（ref）、`error`（ref）。
- 界面：
  - 标题「JD 分析」、返回首页的链接或按钮。
  - 多行输入或 textarea（v-model 绑定 `jdText`），可选「上传 .txt/.md」把内容写入 `jdText`。
  - 按钮「分析」：`loading = true` → 调 `sendChatRequestStream` 或 `sendChatRequestByAxios`，messages 为：
    - 一条 system：`你是一个求职助手，请对以下招聘信息（JD）进行结构化分析，包括：岗位要求、关键技能、薪资区间（如有）、公司特点等，并用 Markdown 分点输出。`
    - 一条 user：`jdText` 内容。
  - 结果区：`result` 用 `renderMarkdown(result)` 渲染（复用 `src/utils/markdown.js`）；有 `error` 时展示错误信息。
- 流式：若用 `sendChatRequestStream`，在 onChunk 里累加进 `result`，体验更好；非流式则一次设 `result = 返回内容`。

依赖：`api/chat.js`、`utils/markdown.js`、`stores/theme.js`。

---

### 步骤 4：新建「简历匹配分析」页

**新建文件：** `src/views/ResumeMatchView.vue`

- 结构同步骤 3，状态：`jdText`、`resumeText`、`result`、`loading`、`error`。
- 界面：两个输入区（或两个文件上传），分别绑定 JD 和简历文本。
- 按钮「开始匹配分析」：请求 messages：
  - system：`你是一个求职助手，请根据下面的 JD 和简历内容，给出匹配度分析、优势与不足、改进建议，用 Markdown 分点输出。`
  - user：`【JD】\n${jdText}\n\n【简历】\n${resumeText}`
- 结果区：同样用 `renderMarkdown(result)`。

---

### 步骤 5：新建「定向润色」页

**新建文件：** `src/views/PolishView.vue`

- 状态：`resumeText`、`targetDirection`（目标方向或粘贴的 JD）、`result`、`loading`、`error`。
- 界面：简历内容输入 + 目标方向/JD 输入，按钮「润色」。
- 请求 messages：
  - system：`你是一个求职助手，请根据用户给出的目标方向或 JD，对下面的简历内容进行定向润色，保留事实、优化表述、突出匹配点，用 Markdown 输出润色后的内容与修改说明。`
  - user：`【目标方向/JD】\n${targetDirection}\n\n【当前简历】\n${resumeText}`
- 结果区：同样用 `renderMarkdown(result)`。

---

### 步骤 6：可选 — 抽公共结果区组件

**新建文件：** `src/components/ResultPanel.vue`

- props：`content`（string）、`loading`（boolean）、`error`（string）。
- 内部用 `renderMarkdown(content)` 渲染，并显示 loading/error 状态。
- 三个页面把「结果区」替换成 `<ResultPanel :content="result" :loading="loading" :error="error" />`。

不做也能跑，做了可少写重复代码。

---

### 步骤 7：可选 — 弱化 ChatView、清理 counter

- **ChatView**：首页若放了「自由对话」链接，可把 ChatView 里角色下拉的文案改成求职向（或先不动）。
- **counter.js**：不用可删；若删，检查是否有引用（当前无），删除 `stores/counter.js` 即可。

---

## 7. 文件改动清单汇总

| 操作 | 文件 |
|------|------|
| 修改 | `src/views/HomeView.vue` |
| 修改 | `src/router/index.js` |
| 新建 | `src/views/JdAnalysisView.vue` |
| 新建 | `src/views/ResumeMatchView.vue` |
| 新建 | `src/views/PolishView.vue` |
| 可选新建 | `src/components/ResultPanel.vue` |
| 可选删除 | `src/stores/counter.js` |
| 可选修改 | `src/views/ChatView.vue`（弱化/求职向） |

**不动的：** `main.js`、`App.vue`、`stores/theme.js`、`stores/chat.js`、`api/chat.js`、`api/chat-axios.js`、`utils/request.js`、`utils/markdown.js`、`assets/main.css`。

---

## 8. 跑通顺序建议

1. 先做步骤 1 + 2 + 3：首页改好、路由加上、只做一个「JD 分析」页并调通 API，确认能跑。
2. 再做步骤 4、5：复制 JD 分析页的套路，改成双输入/润色逻辑。
3. 最后做步骤 6、7：抽组件、弱化 Chat、清理 counter。

这样每步都能跑，且尽量复用当前项目、不大改底层结构。
