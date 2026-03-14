import { defineStore } from 'pinia'
import { ref } from 'vue'

const THEME_KEY = 'ai-chat-theme'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem(THEME_KEY) === 'dark')

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
  }

  return {
    isDark,
    toggleTheme,
  }
})