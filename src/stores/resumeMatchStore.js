import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useHistoryStore } from './historyStore'
import { callAITask } from '../api/ai'

/** 简历匹配分析：只管理本功能的输入、loading、error、result */
export const useResumeMatchStore = defineStore('resumeMatchStore', () => {
  const jdText = ref('')
  const resumeText = ref('')
  const loading = ref(false)
  const error = ref('')
  const result = ref(null)

  function setJdText(value) {
    jdText.value = value
  }

  function setResumeText(value) {
    resumeText.value = value
  }

  function clearError() {
    error.value = ''
  }

  function clearResult() {
    result.value = null
    error.value = ''
  }

  async function analyzeResumeMatch() {
    if (!jdText.value.trim() || !resumeText.value.trim() || loading.value) return
    loading.value = true
    error.value = ''
    result.value = null
    try {
      result.value = await callAITask({
        taskType: 'match',
        jdText: jdText.value,
        resumeText: resumeText.value,
      })
      const historyStore = useHistoryStore()
      historyStore.addRecord({
        type: 'match',
        title: jdText.value.slice(0, 30).replace(/\n/g, ' '),
        inputSummary: 'JD：' + jdText.value.slice(0, 40).replace(/\n/g, ' ') + ' / 简历：' + resumeText.value.slice(0, 40).replace(/\n/g, ' '),
        result: result.value,
      })
    } catch (e) {
      error.value = e?.message || '匹配分析失败，请重试'
    } finally {
      loading.value = false
    }
  }

  return {
    jdText,
    resumeText,
    loading,
    error,
    result,
    setJdText,
    setResumeText,
    clearError,
    clearResult,
    analyzeResumeMatch,
  }
})
