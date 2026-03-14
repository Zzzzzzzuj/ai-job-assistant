const BASE_URL = import.meta.env.VITE_API_BASE_URL

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
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
    signal,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`请求失败：${response.status} ${errorText}`)
  }

  await parseStreamResponse(response, onChunk)
}
