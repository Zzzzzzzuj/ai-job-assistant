import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useHistoryStore } from './historyStore'
import { callAITask } from '../api/ai'

/** JD 分析：只管理本功能的输入、loading、error、result */
export const useJdStore = defineStore('jdStore', () => {
  const jdText = ref('')
  const loading = ref(false)
  const error = ref('')
  const result = ref(null)

  function setJdText(value) {
    jdText.value = value
  }

  function clearError() {
    error.value = ''
  }

  function clearResult() {
    result.value = null
    error.value = ''
  }

  async function analyzeJD() {
    if (!jdText.value.trim() || loading.value) return
    loading.value = true
    error.value = ''
    result.value = null
    try {
      result.value = await callAITask({ taskType: 'jd', jdText: jdText.value })
      const historyStore = useHistoryStore()
      historyStore.addRecord({
        type: 'jd',
        title: jdText.value.slice(0, 30).replace(/\n/g, ' '),
        inputSummary: 'JD 内容：' + jdText.value.slice(0, 60).replace(/\n/g, ' ') + (jdText.value.length > 60 ? '…' : ''),
        result: result.value,
      })
    } catch (e) {
      error.value = e?.message || '分析失败，请重试'
    } finally {
      loading.value = false
    }
  }

  return {
    jdText,
    loading,
    error,
    result,
    setJdText,
    clearError,
    clearResult,
    analyzeJD,
  }
})
