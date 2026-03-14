function getChatConfig() {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
  const baseUrl = import.meta.env.VITE_DEEPSEEK_BASE_URL
  const model = import.meta.env.VITE_DEEPSEEK_MODEL

  if (!apiKey) {
    throw new Error('没有读取到 DeepSeek API Key，请检查 .env 文件')
  }

  if (!baseUrl) {
    throw new Error('没有读取到 DeepSeek Base URL，请检查 .env 文件')
  }

  if (!model) {
    throw new Error('没有读取到 DeepSeek Model，请检查 .env 文件')
  }

  return { apiKey, baseUrl, model }
}

async function parseStreamResponse(response, onChunk) {
  if (!response.body) {
    throw new Error('浏览器不支持流式读取')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  async function handleLine(line) {
    const trimmedLine = line.trim()
    if (!trimmedLine || !trimmedLine.startsWith('data:')) return false

    const data = trimmedLine.replace(/^data:\s*/, '')

    if (data === '[DONE]') {
      return true
    }

    try {
      const json = JSON.parse(data)
      const delta = json?.choices?.[0]?.delta || {}

      const content =
        delta.content ||
        delta.reasoning_content ||
        json?.choices?.[0]?.message?.content ||
        ''

      if (content) {
        await onChunk(content)
      }
    } catch (error) {
      console.warn('解析流式数据失败：', data, error)
    }

    return false
  }

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      if (buffer.trim()) {
        await handleLine(buffer)
      }
      break
    }

    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() || ''

    for (const line of lines) {
      const isDone = await handleLine(line)
      if (isDone) return
    }
  }
}

export async function sendChatRequestStream(messages, onChunk, signal) {
  const { apiKey, baseUrl, model } = getChatConfig()

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.7,
    }),
    signal,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`请求失败：${response.status} ${errorText}`)
  }

  await parseStreamResponse(response, onChunk)
}