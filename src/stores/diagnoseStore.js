import { defineStore } from 'pinia'
import { ref } from 'vue'
import { callAITask } from '../api/ai'

export const useDiagnoseStore = defineStore('diagnoseStore', () => {
  const jdText = ref('')
  const resumeText = ref('')
  const loading = ref(false)
  const error = ref('')
  const result = ref(null)

  function setJdText(v) { jdText.value = v }
  function setResumeText(v) { resumeText.value = v }
  function clearError() { error.value = '' }
  function clearResult() { result.value = null; error.value = '' }

  async function runDiagnose() {
    if (!jdText.value.trim() || !resumeText.value.trim() || loading.value) return
    loading.value = true
    error.value = ''
    result.value = null
    try {
      result.value = await callAITask({
        taskType: 'diagnose',
        jdText: jdText.value,
        resumeText: resumeText.value,
      })
    } catch (e) {
      error.value = e?.message || '诊断失败，请重试'
    } finally {
      loading.value = false
    }
  }

  return { jdText, resumeText, loading, error, result, setJdText, setResumeText, clearError, clearResult, runDiagnose }
})
