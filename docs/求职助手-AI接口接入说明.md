# 求职助手 — 从 Mock 接入真实 AI 请求说明

在不破坏现有聊天功能的前提下，说明如何复用项目已有 API 层，让 JD 分析、简历匹配、定向润色三个页面走真实模型请求。

---

## 1. 现有 ai-chat-web 的模型请求逻辑在哪

| 位置 | 作用 | 调用方 |
|------|------|--------|
| **`src/api/chat.js`** | 流式请求：`sendChatRequestStream(messages, onChunk, signal)`，用原生 `fetch` 调 `POST ${baseUrl}/chat/completions`，`stream: true`，通过 `onChunk(content)` 逐段回调。配置来自 `getChatConfig()`（读 `.env` 的 `VITE_DEEPSEEK_*`）。 | `stores/chat.js` 的 `sendMessage` |
| **`src/api/chat-axios.js`** | 非流式请求：`sendChatRequestByAxios(messages)`，用 `utils/request` 的 axios 实例发同一条 `/chat/completions`，`stream: false`，返回 `data.choices[0].message.content` 字符串。 | `stores/chat.js` 的 `sendMessageByAxios`（聊天页未用） |
| **`src/utils/request.js`** | axios 实例：`baseURL`、`Authorization`、`Content-Type`、超时与错误统一处理。 | `chat-axios.js` |

**结论**：  
- 流式：只改「谁组 messages、谁调 `sendChatRequestStream`」，不动 `chat.js` 内部实现即可。  
- 非流式：同样只改「谁组 messages、谁调 `sendChatRequestByAxios`」。  
聊天页只用 `sendChatRequestStream`，所以**求职助手三个功能只要不碰 `stores/chat.js` 里聊天相关逻辑，就不会影响原聊天**。

---

## 2. 是否可以抽象一个通用 analyze 接口

**可以，且建议做一层薄封装。**

- **入参**：`messages`（OpenAI 格式的 `[{ role, content }]`）已经足够通用；求职助手只是「system + user 内容不同」。
- **出参**：  
  - 流式：继续用现有 `sendChatRequestStream(messages, onChunk, signal)`，在页面里用 `onChunk` 拼成字符串再解析或直接展示。  
  - 非流式：用现有 `sendChatRequestByAxios(messages)` 得到一整段 `content` 字符串，再在页面或一层薄逻辑里按约定格式解析（见第 5 节）。

**推荐做法**：  
- **不新增“通用 analyze”的 HTTP 封装**，直接复用：  
  - 流式：`sendChatRequestStream`  
  - 非流式：`sendChatRequestByAxios`  
- **只新增“求职场景”的封装**（例如 `src/api/job-assistant.js`）：  
  - 内部组好 `messages`（system + user），再调上面两个之一。  
  - 对外暴露三个方法，例如：`analyzeJd(jdText)`, `analyzeResumeMatch(jdText, resumeText)`, `polishResume({ jdText, rawContent, polishType })`，每个方法内组好 prompt 再调 `sendChatRequestByAxios`（或流式）。  

这样「通用」的是现有 chat 接口，求职只是「prompt 组装 + 调用方式」不同，不破坏原有逻辑。

---

## 3. 三个功能如何复用当前请求逻辑

| 功能 | 复用方式 | 说明 |
|------|----------|------|
| **JD 分析** | 组 `messages = [system, user]`，`user.content = 用户粘贴的 JD`，调 `sendChatRequestByAxios(messages)` 或 `sendChatRequestStream(...)` | 与聊天一样都是「一条 system + 一条 user」，不碰 chat store |
| **简历匹配分析** | 同上，`user.content = 「JD：…\n\n简历：…」`，调同一套 API | 仅 user 内容格式不同 |
| **定向润色** | 同上，`user.content = 「目标 JD：…\n\n润色类型：…\n\n原始内容：…」`，调同一套 API | 仅 user 内容格式不同 |

**具体落地**：  
- 三个页面**不依赖 chat store**，不调用 `sendMessage` / `sendMessageByAxios`。  
- 在 `src/api/job-assistant.js`（或同级）里为每个功能写一个「组 messages + 调 API」的函数，页面里只调这些函数，例如：  
  - `analyzeJd(jdText)` → 内部 `sendChatRequestByAxios(buildJdAnalysisMessages(jdText))`  
  - 简历匹配、定向润色同理。  
这样**复用的是现有 `chat.js` / `chat-axios.js` + `request.js`**，聊天逻辑完全不动。

---

## 4. 需要新增哪些 prompt 组装函数

在 `src/api/job-assistant.js`（或 `src/prompts/job-assistant.js` 再在 api 里调）里，为每个功能组好 **system + user**，返回 `messages` 数组，供上面那层调用 `sendChatRequestByAxios` / `sendChatRequestStream`。

建议新增 3 个**纯函数**（只做字符串拼接，不发请求）：

1. **`buildJdAnalysisMessages(jdText)`**  
   - `system`：约定 AI 角色与输出格式，例如「你是求职助手，请对以下 JD 做结构化分析，严格按以下模块用 Markdown 输出：岗位关键词、必备技能、加分项、岗位职责总结、候选人画像；每块用二级标题，列表用 - 或 1.」。  
   - `user`：`请分析以下招聘信息：\n\n${jdText}`。

2. **`buildResumeMatchMessages(jdText, resumeText)`**  
   - `system`：约定「根据 JD 与简历，输出：总体匹配度（0–100 与一句话说明）、匹配点、缺失点、风险点、优化建议；严格按上述模块与 Markdown 格式输出」。  
   - `user`：`【目标岗位 JD】\n${jdText}\n\n【我的简历内容】\n${resumeText}`。

3. **`buildResumePolishMessages(jdText, rawContent, polishType)`**  
   - `system`：约定「你是求职助手，根据目标 JD 对用户提供的简历内容做定向润色；润色类型由用户指定（项目描述/技能描述/自我介绍），只输出润色后的正文，不要额外解释」。  
   - `user`：`目标岗位 JD：\n${jdText}\n\n润色类型：${polishType 对应中文}\n\n待润色内容：\n${rawContent}`。

**调用链**：  
页面 → `analyzeJd(jdText)` 等 → 内部 `buildXxxMessages(...)` 得到 `messages` → `sendChatRequestByAxios(messages)` 或 `sendChatRequestStream(messages, onChunk, signal)`。  
这样**新增的只是 3 个 prompt 组装函数 + 3 个薄封装**，原有 chat 相关文件可以不改。

---

## 5. 返回结果建议用什么数据结构承接

模型返回的是**一段 Markdown 字符串**（`content`），三种处理方式可选：

**方案 A：前端不解析，整段展示（最小改动）**  
- 三个页面都用「一个字符串」接结果：  
  - JD 分析 / 简历匹配：`resultText = ref('')`，流式用 `onChunk` 累加，非流式直接 `resultText = content`，用现有 `renderMarkdown(resultText)` 或等价组件渲染。  
- 不需要和当前 mock 的「分块对象」一致，先保证能跑、展示完整内容即可；后续若要「匹配度进度条」「一键复制」再在字符串里用正则或约定分隔符抽字段。

**方案 B：约定 AI 输出格式，前端解析成结构化数据（与现有 mock 一致）**  
- 在 system prompt 里约定 AI 必须输出**固定格式**，例如 JSON 或带明确标题的 Markdown（如 `## 岗位关键词`、`## 总体匹配度` 等）。  
- 前端收到完整 `content` 后：  
  - 若约定为 JSON：`JSON.parse(content)` 或 `content` 中提取 ` ```json ... ``` ` 再 parse，得到和当前 mock 一致的结构（如 `{ keywords: [], requiredSkills: [], ... }`），页面继续用现有卡片、列表、进度条展示。  
  - 若约定为 Markdown 标题分块：用正则按 `## 标题` 切分，再映射到 `{ matchPoints: [], missingPoints: [], ... }`。  
- 这样**承接结构可以和现有 mock 完全一致**，页面组件几乎不用改，只把「mock 数据」换成「解析后的 API 结果」。

**方案 C：流式 + 边收边解析（可选、进阶）**  
- 流式时边收边把字符串按约定格式（如 JSON 或分段 Markdown）解析，未完整部分暂不渲染或只渲染「已确定」的块。  
- 实现成本高，建议先做方案 A 或 B。

**推荐**：  
- **先做方案 A**：三个页面统一用「一个字符串」接返回值，用 Markdown 渲染整段结果；不解析、不破坏现有展示逻辑，只把数据源从 mock 换成 API。  
- **若要和现有 mock 卡片/进度条一致**：再在 prompt 里约定「请输出如下 JSON：{ ... }」，前端用方案 B 解析成当前数据结构，页面即可继续用现有卡片和进度条，无需大改。

**若采用方案 B，建议的承接结构示例**（与当前 mock 对齐）：

- **JD 分析**：  
  `{ keywords: string[], requiredSkills: string[], bonusPoints: string[], dutySummary: string, candidateProfile: string }`

- **简历匹配**：  
  `{ matchScore: number, matchPoints: string[], missingPoints: string[], riskPoints: string[], suggestions: string[] }`

- **定向润色**：  
  一段字符串即可：`content: string`，直接展示 + 一键复制。

---

## 小结

| 问题 | 结论 |
|------|------|
| 1. 模型请求逻辑在哪 | `api/chat.js`（流式）、`api/chat-axios.js`（非流式）+ `utils/request.js`，配置来自 .env |
| 2. 能否抽象通用 analyze | 不新增通用 HTTP 接口，只新增「求职场景」的薄封装，内部组 messages 后调现有 sendChatRequestStream / sendChatRequestByAxios |
| 3. 三功能如何复用 | 各功能在 `api/job-assistant.js` 里组好 messages 再调上述两个之一；不碰 chat store，聊天不受影响 |
| 4. 新增哪些 prompt 组装 | `buildJdAnalysisMessages`、`buildResumeMatchMessages`、`buildResumePolishMessages` 三个纯函数，返回 `messages` |
| 5. 返回结果数据结构 | 建议先用「整段字符串 + Markdown 渲染」（方案 A）；若要和 mock 卡片一致，再约定 JSON/分段格式并解析（方案 B） |

按上述方式接入，只需新增 `job-assistant` 相关 API 与 prompt 组装，三个页面把数据源从 mock 换成这些接口即可，原有聊天逻辑和请求封装均可保持不变。
