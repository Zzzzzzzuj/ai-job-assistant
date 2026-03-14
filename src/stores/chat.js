import { defineStore } from 'pinia'
import { computed, ref, nextTick } from 'vue'
import { sendChatRequestStream } from '../api/chat'
import { sendChatRequestByAxios } from '../api/chat-axios'

const STORAGE_KEY = 'ai-chat-sessions'
const CURRENT_SESSION_KEY = 'ai-chat-current-session-id'

const now = Date.now()

const defaultSessions = [
  {
    id: '1',
    title: 'Vue3 基础',
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: '1-1',
        role: 'user',
        content: 'Vue3 是什么？',
        createdAt: now,
      },
      {
        id: '1-2',
        role: 'assistant',
        content: 'Vue3 是新一代 Vue 框架。',
        createdAt: now,
        isError: false,
      },
    ],
  },
  {
    id: '2',
    title: '前端实习',
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: '2-1',
        role: 'user',
        content: '前端面试怎么准备？',
        createdAt: now,
      },
      {
        id: '2-2',
        role: 'assistant',
        content: '可以先准备项目、八股和算法。',
        createdAt: now,
        isError: false,
      },
    ],
  },
]

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function normalizeSessions(list) {
  return (list || []).map((session) => ({
    id: session.id || createId(),
    title: session.title || '新对话',
    createdAt: session.createdAt || Date.now(),
    updatedAt: session.updatedAt || Date.now(),
    messages: (session.messages || []).map((msg) => ({
      id: msg.id || createId(),
      role: msg.role || 'user',
      content: msg.content || '',
      createdAt: msg.createdAt || Date.now(),
      isError: Boolean(msg.isError),
    })),
  }))
}

function getStoredSessions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return normalizeSessions(defaultSessions)
    return normalizeSessions(JSON.parse(stored))
  } catch (error) {
    console.error('读取会话数据失败：', error)
    return normalizeSessions(defaultSessions)
  }
}

function getStoredCurrentSessionId() {
  try {
    const stored = localStorage.getItem(CURRENT_SESSION_KEY)
    if (stored) return stored

    const sessions = getStoredSessions()
    return sessions[0]?.id || ''
  } catch (error) {
    console.error('读取当前会话失败：', error)
    return defaultSessions[0]?.id || ''
  }
}

function buildContextMessages(messages, limit = 6) {
  return messages.slice(-limit).map((item) => ({
    role: item.role,
    content: item.content,
  }))
}

export const useChatStore = defineStore('chat', () => {
  const sessions = ref(getStoredSessions().sort((a, b) => b.updatedAt - a.updatedAt))
  const currentSessionId = ref(getStoredCurrentSessionId())
  const retryMessage = ref('')
  const isGenerating = ref(false)
  const uploadedFileText = ref('')
  const uploadedFileName = ref('')

  // 新增：角色预设列表（Prompt 工程）
  const roles = ref([
    {
      id: 'general',
      name: '🌟 通用编程助手',
      prompt: '你是一个智能助手，可以回答用户的任何问题，回答尽量简洁明了。'
    },
    {
      id: 'interviewer',
      name: '👔 严厉前端面试官',
      prompt: `你现在是一位资深的前端面试官（字节跳动级别）。用户是来找你进行前端实习模拟面试的大学生。
请严格遵循以下规则：
1. 不要一次性给出答案。每次只提问一个知识点，或者针对用户的回答进行底层原理的严厉追问。
2. 考察重点在 Vue 原理、JavaScript 闭包/原型链、计算机网络等。
3. 语气要像真实的严厉面试官，指出用户的逻辑漏洞。`
    },
    {
      id: 'mentor',
      name: '🎓 温柔代码导师',
      prompt: `你现在是一位温柔、耐心的前端架构师导师。用户是前端新手。
请遵循以下规则：
1. 解答问题时必须极其详细，循循善诱。
2. 尽可能提供带有详细中文注释的 Vue/JS 代码示例。
3. 如果用户代码写得很烂，请先鼓励他，再给出优化后的规范代码（Code Review）。`
    }
  ])

  // 当前选中的角色 ID，默认通用助手
  const currentRoleId = ref('general')

  const currentSession = computed(() => {
    return sessions.value.find((item) => item.id === currentSessionId.value)
  })

  function saveSessions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
  }

  function saveCurrentSessionId() {
    localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId.value)
  }
  function sortSessionsByUpdatedAt() {
  sessions.value.sort((a, b) => b.updatedAt - a.updatedAt)
}
  function touchCurrentSession() {
  if (!currentSession.value) return
  currentSession.value.updatedAt = Date.now()
  sortSessionsByUpdatedAt()
}

  function setUploadedFile(fileName, text) {
    uploadedFileName.value = fileName
    uploadedFileText.value = text
  }

  function clearUploadedFile() {
    uploadedFileName.value = ''
    uploadedFileText.value = ''
  }

  function switchSession(id) {
    currentSessionId.value = id
    saveCurrentSessionId()
  }

  function createSession() {
  const currentTime = Date.now()

  const newSession = {
    id: createId(),
    title: '新对话',
    createdAt: currentTime,
    updatedAt: currentTime,
    messages: [],
  }

  sessions.value.unshift(newSession)
  currentSessionId.value = newSession.id
  sortSessionsByUpdatedAt()
  saveSessions()
  saveCurrentSessionId()
}

  function deleteSession(id) {
    const index = sessions.value.findIndex((item) => item.id === id)
    if (index === -1) return

    sessions.value.splice(index, 1)

    if (!sessions.value.length) {
      const currentTime = Date.now()
      const newSession = {
        id: createId(),
        title: '新对话',
        createdAt: currentTime,
        updatedAt: currentTime,
        messages: [],
      }
      sessions.value.push(newSession)
      currentSessionId.value = newSession.id
    } else if (currentSessionId.value === id) {
      currentSessionId.value = sessions.value[0].id
    }

    saveSessions()
    saveCurrentSessionId()
  }

  function updateAssistantMessageById(assistantId, patch) {
    const session = currentSession.value
    if (!session) return null

    const index = session.messages.findIndex((item) => item.id === assistantId)
    if (index === -1) return null

    const oldMsg = session.messages[index]
    const nextPatch = typeof patch === 'function' ? patch(oldMsg) : patch

    session.messages[index] = {
      ...oldMsg,
      ...nextPatch,
    }

    return session.messages[index]
  }

  function findLastAssistantMessage() {
    const session = currentSession.value
    if (!session) return null

    for (let i = session.messages.length - 1; i >= 0; i--) {
      if (session.messages[i].role === 'assistant') {
        return session.messages[i]
      }
    }

    return null
  }

  function findLastUserMessage() {
    const session = currentSession.value
    if (!session) return null

    for (let i = session.messages.length - 1; i >= 0; i--) {
      if (session.messages[i].role === 'user') {
        return session.messages[i]
      }
    }

    return null
  }

  function removeLastErrorAssistantMessage() {
    const session = currentSession.value
    if (!session) return

    for (let i = session.messages.length - 1; i >= 0; i--) {
      const msg = session.messages[i]
      if (msg.role === 'assistant' && msg.isError) {
        session.messages.splice(i, 1)
        touchCurrentSession()
        saveSessions()
        return
      }

      if (msg.role === 'assistant') {
        return
      }
    }
  }

  async function requestWithRetry(messages, onChunk, signal, maxRetry = 1) {
    let count = 0

    while (count <= maxRetry) {
      try {
        await sendChatRequestStream(messages, onChunk, signal)
        return
      } catch (error) {
        count += 1

        if (signal?.aborted) {
          throw new Error('响应时间过长，请求已超时', { cause: error })
        }

        if (count > maxRetry) {
          throw error
        }
      }
    }
  }

  async function sendMessage(content) {
    if (!currentSession.value || isGenerating.value) return

    const safeContent = content.trim()
    if (!safeContent) return

    retryMessage.value = ''
    isGenerating.value = true

    try {
      if (
        currentSession.value.title === '新对话' &&
        currentSession.value.messages.length === 0
      ) {
        currentSession.value.title = safeContent.slice(0, 12) || '新对话'
        touchCurrentSession()
      }

      const trimmedFileText = uploadedFileText.value
        ? uploadedFileText.value.slice(0, 3000)
        : ''

      const finalContent = trimmedFileText
        ? `以下是用户上传的文件《${uploadedFileName.value}》部分内容：

${trimmedFileText}

用户问题：
${safeContent}`
        : safeContent

      currentSession.value.messages.push({
        id: createId(),
        role: 'user',
        content: safeContent,
        createdAt: Date.now(),
      })

      const assistantId = createId()

      currentSession.value.messages.push({
        id: assistantId,
        role: 'assistant',
        content: 'AI 正在思考...',
        isError: false,
        createdAt: Date.now(),
      })

      touchCurrentSession()
      saveSessions()
      await nextTick()

      const rawMessages = buildContextMessages(
        currentSession.value.messages.filter((item) => item.id !== assistantId),
        6
      )

      // 新增：获取当前选中的角色配置
      const currentRoleConfig = roles.value.find(r => r.id === currentRoleId.value) || roles.value[0]

      // 新增：动态定义 System Prompt
      const systemPrompt = {
        role: 'system',
        content: currentRoleConfig.prompt
      }

      // 将 System Prompt 强行插入到发送给大模型的数组第一位
      const messages = [
        systemPrompt,
        ...rawMessages.map((item, index) => {
          if (
            index === rawMessages.length - 1 &&
            item.role === 'user' &&
            trimmedFileText
          ) {
            return {
              ...item,
              content: finalContent,
            }
          }

          return item
        })
      ]

      let isFirstChunk = true
      let hasAnyChunk = false

      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 300000)

      try {
        await requestWithRetry(
          messages,
          async (chunk) => {
            if (isFirstChunk) {
              updateAssistantMessageById(assistantId, {
                content: '',
                isError: false,
              })
              isFirstChunk = false
              await nextTick()
            }

            hasAnyChunk = true

            updateAssistantMessageById(assistantId, (oldMsg) => ({
              content: oldMsg.content + chunk,
              isError: false,
            }))

            touchCurrentSession()
            saveSessions()
            await nextTick()
          },
          controller.signal,
          1
        )
      } finally {
        clearTimeout(timeoutId)
      }

      if (!hasAnyChunk) {
        updateAssistantMessageById(assistantId, {
          content: '这次流式返回里没有拿到可显示的内容。',
          isError: false,
        })
        touchCurrentSession()
      }

      saveSessions()
    } catch (error) {
      const lastAssistant = findLastAssistantMessage()

      if (lastAssistant) {
        const hasContent =
          lastAssistant.content &&
          lastAssistant.content !== 'AI 正在思考...'

        if (hasContent) {
          updateAssistantMessageById(lastAssistant.id, (oldMsg) => ({
            content:
              oldMsg.content +
              `\n\n---\n⚠️ 本次回复因 ${error.message} 被中断，你可以点击“重试”重新生成。`,
            isError: true,
          }))
        } else {
          updateAssistantMessageById(lastAssistant.id, {
            content: `请求出错了：${error.message}`,
            isError: true,
          })
        }
      }

      retryMessage.value = safeContent
      touchCurrentSession()
      saveSessions()
    } finally {
      isGenerating.value = false
    }
  }

  async function retryLastMessage() {
    if (isGenerating.value || !currentSession.value) return

    const lastUserMessage = findLastUserMessage()
    const contentToRetry = retryMessage.value || lastUserMessage?.content || ''

    if (!contentToRetry.trim()) return

    removeLastErrorAssistantMessage()
    retryMessage.value = ''

    await sendMessage(contentToRetry)
  }

  async function sendMessageByAxios(content) {
    if (!currentSession.value || isGenerating.value) return

    const safeContent = content.trim()
    if (!safeContent) return

    isGenerating.value = true
    retryMessage.value = ''

    if (
      currentSession.value.title === '新对话' &&
      currentSession.value.messages.length === 0
    ) {
      currentSession.value.title = safeContent.slice(0, 12) || '新对话'
      touchCurrentSession()
    }

    const userId = createId()
    const assistantId = createId()

    currentSession.value.messages.push({
      id: userId,
      role: 'user',
      content: safeContent,
      createdAt: Date.now(),
    })

    currentSession.value.messages.push({
      id: assistantId,
      role: 'assistant',
      content: '正在请求普通接口...',
      isError: false,
      createdAt: Date.now(),
    })

    touchCurrentSession()
    saveSessions()

    try {
      const reply = await sendChatRequestByAxios([
        {
          role: 'user',
          content: safeContent,
        },
      ])

      updateAssistantMessageById(assistantId, {
        content: reply,
        isError: false,
      })

      touchCurrentSession()
      saveSessions()
    } catch (error) {
      updateAssistantMessageById(assistantId, {
        content: `请求出错了：${error.message}`,
        isError: true,
      })

      retryMessage.value = safeContent
      touchCurrentSession()
      saveSessions()
    } finally {
      isGenerating.value = false
    }
  }

  async function searchChats(keyword) {
    const value = keyword.trim().toLowerCase()
    if (!value) return []

    const results = []

    sessions.value.forEach((session) => {
      const titleMatched = session.title.toLowerCase().includes(value)

      const matchedMessages = session.messages.filter((msg) =>
        msg.content.toLowerCase().includes(value)
      )

      if (titleMatched || matchedMessages.length > 0) {
        results.push({
          sessionId: session.id,
          sessionTitle: session.title,
          matchedCount: matchedMessages.length,
          preview: matchedMessages[0]?.content.slice(0, 40) || session.title,
        })
      }
    })

    return results
  }

  return {
    sessions,
    currentSessionId,
    currentSession,
    isGenerating,
    retryMessage,
    uploadedFileText,
    uploadedFileName,
    roles,              // 暴露给组件用
    currentRoleId,      // 暴露给组件用
    switchSession,
    createSession,
    deleteSession,
    sendMessage,
    sendMessageByAxios,
    retryLastMessage,
    searchChats,
    setUploadedFile,
    clearUploadedFile,
  }
})
