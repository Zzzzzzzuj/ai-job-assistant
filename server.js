import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
const MODEL = 'deepseek-chat'

// ── Prompt 工厂 ──────────────────────────────────────────────
function buildMessages(taskType, body) {
  const system = `你是一位专业的 HR 和求职顾问，擅长分析招聘信息和简历。
请严格按照要求的 JSON 格式返回结果，不要输出任何 JSON 以外的内容。`

  if (taskType === 'jd') {
    const { jdText } = body
    return [
      { role: 'system', content: system },
      {
        role: 'user',
        content: `请分析以下岗位 JD，返回 JSON 格式如下：
{
  "keywords": ["关键词1", "关键词2", ...],
  "requiredSkills": ["必备技能1", ...],
  "bonusPoints": ["加分项1", ...],
  "dutySummary": "岗位职责概括",
  "candidateProfile": "理想候选人画像"
}

JD 内容：
${jdText}`
      }
    ]
  }

  if (taskType === 'match') {
    const { jdText, resumeText } = body
    return [
      { role: 'system', content: system },
      {
        role: 'user',
        content: `请对比以下岗位 JD 和简历，返回 JSON 格式如下：
{
  "matchScore": 85,
  "matchPoints": ["匹配点1", ...],
  "missingPoints": ["缺失点1", ...],
  "riskPoints": ["风险点1", ...],
  "suggestions": ["优化建议1", ...]
}

岗位 JD：
${jdText}

简历内容：
${resumeText}`
      }
    ]
  }

  if (taskType === 'polish') {
    const { jdText, rawContent, polishType } = body
    const typeMap = { intro: '个人介绍', project: '项目经历', skill: '专业技能' }
    const typeName = typeMap[polishType] || polishType || '简历内容'
    return [
      { role: 'system', content: `你是一位专业的简历优化顾问。请严格按照要求的 JSON 格式返回结果，不要输出任何 JSON 以外的内容。` },
      {
        role: 'user',
        content: `我有一份完整简历，请你完成以下两件事：

1. 从简历中智能识别出属于「${typeName}」的段落内容。不要死板地找标题，而是根据内容语义来判断哪些段落描述的是${typeName}相关内容。
2. 根据岗位 JD，对识别出的「${typeName}」段落进行定向润色，使其更贴合岗位需求、表达更专业。
3. 将润色后的段落替换回原简历对应位置，其他部分保持原文不变。

请返回以下 JSON 格式（不要输出任何 JSON 以外的内容）：
{
  "polishedSection": "润色后的${typeName}段落文本",
  "mergedResume": "完整简历文本（${typeName}已替换为润色版，其他部分原样保留）"
}

岗位 JD：
${jdText}

完整简历：
${rawContent}`
      }
    ]
  }

  if (taskType === 'diagnose') {
    const { jdText, resumeText } = body
    return [
      { role: 'system', content: system },
      {
        role: 'user',
        content: `请对以下岗位 JD 和简历进行深度诊断分析，返回 JSON 格式如下：
{
  "overallScore": 75,
  "summary": "整体匹配度概述，2-3句话",
  "dimensions": [
    { "name": "技术栈匹配", "score": 80, "comment": "简短说明" },
    { "name": "经验年限", "score": 70, "comment": "简短说明" },
    { "name": "项目质量", "score": 65, "comment": "简短说明" },
    { "name": "软技能", "score": 75, "comment": "简短说明" }
  ],
  "missingSkills": ["缺失技能1", "缺失技能2"],
  "strengths": ["优势1", "优势2"],
  "suggestions": ["建议1", "建议2", "建议3"],
  "interviewQuestions": ["高频问题1", "高频问题2", "高频问题3"]
}

岗位 JD：
${jdText}

简历内容：
${resumeText}`
      }
    ]
  }

  throw new Error(`未知的 taskType: ${taskType}`)
}

// ── 调用 DeepSeek ────────────────────────────────────────────
async function callDeepSeek(messages) {
  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.3
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek API 错误 ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

// ── 解析响应 ─────────────────────────────────────────────────
function parseResult(taskType, raw) {
  // 去掉可能的 markdown 代码块包裹
  const jsonStr = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  if (taskType === 'polish') {
    try {
      return JSON.parse(jsonStr)
    } catch {
      // 兼容旧格式：直接返回纯文本
      return { polishedSection: raw.trim(), mergedResume: raw.trim() }
    }
  }

  return JSON.parse(jsonStr)
}

// ── 路由 ─────────────────────────────────────────────────────
app.post('/api/ai/task', async (req, res) => {
  const { taskType, ...body } = req.body

  if (!taskType) {
    return res.status(400).json({ error: '缺少 taskType 参数' })
  }

  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: '服务端未配置 DEEPSEEK_API_KEY' })
  }

  try {
    const messages = buildMessages(taskType, body)
    const raw = await callDeepSeek(messages)
    const data = parseResult(taskType, raw)
    res.json({ success: true, taskType, data })
  } catch (err) {
    console.error('[task error]', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── 健康检查 ─────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// ── 启动 ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
