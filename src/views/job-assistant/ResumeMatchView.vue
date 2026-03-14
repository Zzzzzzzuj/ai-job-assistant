<script setup>
import { useThemeStore } from '../../stores/theme'
import { useResumeMatchStore } from '../../stores/resumeMatchStore'
import ResumeMatchInput from './ResumeMatchInput.vue'
import ResumeMatchResult from './ResumeMatchResult.vue'

const themeStore = useThemeStore()
const resumeMatchStore = useResumeMatchStore()
</script>

<template>
  <div class="page-content" :class="{ dark: themeStore.isDark }">
    <header class="page-header">
      <h1 class="page-title">简历匹配分析</h1>
    </header>
    <div class="page-body">
      <div class="page-layout">
        <ResumeMatchInput
          :jd-text="resumeMatchStore.jdText"
          :resume-text="resumeMatchStore.resumeText"
          :loading="resumeMatchStore.loading"
          @update:jd-text="resumeMatchStore.setJdText($event)"
          @update:resume-text="resumeMatchStore.setResumeText($event)"
          @analyze="resumeMatchStore.analyzeResumeMatch()"
        />
        <ResumeMatchResult
          :result="resumeMatchStore.result"
          :loading="resumeMatchStore.loading"
          :error="resumeMatchStore.error"
          @dismiss-error="resumeMatchStore.clearError()"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-content { flex: 1; display: flex; flex-direction: column; min-height: 0; background: #e6f7f1; }
.page-header { height: 56px; padding: 0 28px; display: flex; align-items: center; background: #d0f0e4; border-bottom: 1px solid rgba(111,207,165,0.25); flex-shrink: 0; }
.page-title { margin: 0; font-size: 16px; font-weight: 700; color: #14543a; letter-spacing: 0.01em; }
.page-body { flex: 1; padding: 24px; overflow-y: auto; }
.page-layout { display: flex; gap: 24px; max-width: 1200px; margin: 0 auto; align-items: flex-start; }
.page-content.dark { background: #0d2b1e; }
.page-content.dark .page-header { background: #0f3d28; border-bottom-color: rgba(111,207,165,0.12); }
.page-content.dark .page-title { color: #6fcfa5; }
</style>
