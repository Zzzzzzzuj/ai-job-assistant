import { ref } from 'vue'

export function useSpeechRecognition() {
  const isRecording = ref(false)
  const speechSupported = ref(false)
  const speechStatus = ref('idle')
  const speechText = ref('')

  let recognition = null

  function initSpeechRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      speechSupported.value = false
      speechStatus.value = 'unsupported'
      return
    }

    speechSupported.value = true
    recognition = new SpeechRecognition()

    recognition.lang = 'zh-CN'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onstart = () => {
      isRecording.value = true
      speechStatus.value = 'recording'
    }

    recognition.onresult = (event) => {
      let transcript = ''

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }

      speechText.value = transcript
      speechStatus.value = 'recognizing'
    }

    recognition.onend = () => {
      isRecording.value = false
      speechStatus.value = 'idle'
    }

    recognition.onerror = (event) => {
      isRecording.value = false
      speechStatus.value = 'error'
      console.error('语音识别失败：', event)
    }
  }

  function startSpeechRecognition() {
    if (!speechSupported.value || !recognition) return
    recognition.start()
  }

  function stopSpeechRecognition() {
    if (!speechSupported.value || !recognition) return
    recognition.stop()
  }

  function toggleSpeechRecognition() {
    if (!speechSupported.value || !recognition) return

    if (isRecording.value) {
      stopSpeechRecognition()
    } else {
      startSpeechRecognition()
    }
  }

  function resetSpeechText() {
    speechText.value = ''
  }

  return {
    isRecording,
    speechSupported,
    speechStatus,
    speechText,
    initSpeechRecognition,
    startSpeechRecognition,
    stopSpeechRecognition,
    toggleSpeechRecognition,
    resetSpeechText,
  }
}