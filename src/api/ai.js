const BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * 统一调用后端 AI 任务接口
 * @param {{ taskType: 'jd'|'match'|'polish', [key: string]: any }} payload
 * @returns {Promise<any>} 结构化结果 data
 */
export async function callAITask(payload) {
  const res = await fetch(`${BASE_URL}/api/ai/task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const json = await res.json()

  if (!res.ok || !json.success) {
    throw new Error(json.error || `请求失败 (${res.status})`)
  }

  return json.data
}