import request from '../utils/request'

export async function sendChatRequestByAxios(messages) {
  const model = import.meta.env.VITE_DEEPSEEK_MODEL

  const data = await request({
    url: '/chat/completions',
    method: 'POST',
    data: {
      model,
      messages,
      stream: false,
    },
  })

  return data?.choices?.[0]?.message?.content || 'AI 没有返回内容'
}