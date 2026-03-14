import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useHistoryStore } from './historyStore'
import { callAITask } from '../api/ai'

export const usePolishStore = defineStore('polishStore', () => {
  const jdText = ref('')
  const rawContent = ref('')
  const polishType = ref('intro')
  const loading = ref(false)
  const error = ref('')
  const result = ref(null)
  const mergedResume = ref(null)

  const polishTypeLabel = { intro: '\u4e2a\u4eba\u4ecb\u7ecd', project: '\u9879\u76ee\u7ecf\u5386', skill: '\u4e13\u4e1a\u6280\u80fd' }

  function setJdText(v) { jdText.value = v }
  function setRawContent(v) { rawContent.value = v }
  function setPolishType(v) { polishType.value = v }
  function clearError() { error.value = '' }
  function clearResult() { result.value = null; mergedResume.value = null; error.value = '' }

  async function generatePolishResult() {
    if (!jdText.value.trim() || !rawContent.value.trim() || loading.value) return
    loading.value = true
    error.value = ''
    result.value = null
    mergedResume.value = null
    try {
      const data = await callAITask({
        taskType: 'polish',
        jdText: jdText.value,
        rawContent: rawContent.value,
        polishType: polishType.value,
      })
      result.value = data.polishedSection
      mergedResume.value = data.mergedResume
      const historyStore = useHistoryStore()
      historyStore.addRecord({
        type: 'polish',
        title: (polishTypeLabel[polishType.value] || '\u6da6\u8272') + ' \u00b7 ' + rawContent.value.slice(0, 20).replace(/\n/g, ' '),
        inputSummary: '\u7c7b\u578b\uff1a' + (polishTypeLabel[polishType.value] || polishType.value) + ' / \u539f\u6587\uff1a' + rawContent.value.slice(0, 50).replace(/\n/g, ' '),
        result: data.mergedResume || data.polishedSection,
      })
    } catch (e) {
      error.value = e?.message || '\u6da6\u8272\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5'
    } finally {
      loading.value = false
    }
  }

  return {
    jdText, rawContent, polishType, loading, error, result, mergedResume,
    setJdText, setRawContent, setPolishType, clearError, clearResult, generatePolishResult,
  }
})
