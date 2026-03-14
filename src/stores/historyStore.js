import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'ai_chat_history'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {}
}

export const useHistoryStore = defineStore('historyStore', () => {
  const records = ref(loadFromStorage())

  function addRecord({ type, title, inputSummary, result }) {
    const record = {
      id: Date.now().toString(),
      type,
      title,
      createdAt: new Date().toISOString(),
      inputSummary,
      result,
    }
    records.value.unshift(record)
    saveToStorage(records.value)
  }

  function deleteRecord(id) {
    records.value = records.value.filter((r) => r.id !== id)
    saveToStorage(records.value)
  }

  function clearAll() {
    records.value = []
    saveToStorage(records.value)
  }

  return { records, addRecord, deleteRecord, clearAll }
})
