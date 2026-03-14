<script setup>
import { useThemeStore } from '../../stores/theme'
import { usePolishStore } from '../../stores/polishStore'
import ResumePolishInput from './ResumePolishInput.vue'
import ResumePolishResult from './ResumePolishResult.vue'

const themeStore = useThemeStore()
const polishStore = usePolishStore()
</script>

<template>
  <div class="page-content" :class="{ dark: themeStore.isDark }">
    <header class="page-header">
      <h1 class="page-title">定向润色</h1>
    </header>
    <div class="page-body">
      <div class="page-layout">
        <ResumePolishInput
          :jd-text="polishStore.jdText"
          :raw-content="polishStore.rawContent"
          :polish-type="polishStore.polishType"
          :loading="polishStore.loading"
          @update:jd-text="polishStore.setJdText($event)"
          @update:raw-content="polishStore.setRawContent($event)"
          @update:polish-type="polishStore.setPolishType($event)"
          @polish="polishStore.generatePolishResult()"
        />
        <ResumePolishResult
          :result="polishStore.result"
          :merged-resume="polishStore.mergedResume"
          :raw-content="polishStore.rawContent"
          :loading="polishStore.loading"
          :error="polishStore.error"
          @dismiss-error="polishStore.clearError()"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-content { flex: 1; display: flex; flex-direction: column; min-height: 0; background: #e6f7f1; }
.page-header { height: 56px; padding: 0 28px; display: flex; align-items: center; background: #d0f0e4; border-bottom: 1px solid rgba(111,207,165,0.25); flex-shrink: 0; }
.page-title { margin: 0; font-size: 16px; font-weight: 700; color: #14543a; letter-spacing: 0.01em; }
.page-body { flex: 1; padding: 24px; overflow: hidden; min-height: 0; }
.page-layout { display: flex; gap: 24px; max-width: 1200px; margin: 0 auto; align-items: flex-start; height: 100%; }
.page-content.dark { background: #0d2b1e; }
.page-content.dark .page-header { background: #0f3d28; border-bottom-color: rgba(111,207,165,0.12); }
.page-content.dark .page-title { color: #6fcfa5; }
</style>
