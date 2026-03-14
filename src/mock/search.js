export async function mockSearchChatRecords(keyword, sessions) {
  await sleep(250)

  const value = keyword.trim().toLowerCase()

  if (!value) return []

  const results = []

  sessions.forEach((session) => {
    const titleMatched = String(session.title).toLowerCase().includes(value)

    const matchedMessages = session.messages.filter((msg) =>
      String(msg.content).toLowerCase().includes(value)
    )

    if (titleMatched || matchedMessages.length > 0) {
      const firstMatchedMessage = matchedMessages[0]?.content || session.title

      results.push({
        sessionId: session.id,
        sessionTitle: session.title,
        matchedCount: matchedMessages.length,
        preview: getMatchedPreview(firstMatchedMessage, value),
      })
    }
  })

  return results
}

function getMatchedPreview(content, keyword) {
  const text = String(content)
  const lowerText = text.toLowerCase()
  const index = lowerText.indexOf(keyword)

  if (index === -1) {
    return text.slice(0, 60)
  }

  const start = Math.max(0, index - 12)
  const end = Math.min(text.length, index + keyword.length + 24)

  let snippet = text.slice(start, end)

  if (start > 0) snippet = '...' + snippet
  if (end < text.length) snippet = snippet + '...'

  return snippet
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}