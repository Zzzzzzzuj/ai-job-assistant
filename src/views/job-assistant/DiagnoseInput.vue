<script setup>
import { useThemeStore } from '../../stores/theme'

defineProps({
  jdText: { type: String, default: '' },
  resumeText: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['update:jdText', 'update:resumeText', 'diagnose'])
const themeStore = useThemeStore()
</script>

<template>
  <section class="input-section" :class="{ dark: themeStore.isDark }">
    <label class="section-label">目标岗位 JD</label>
    <textarea :value="jdText" class="ai-textarea" placeholder="请粘贴招聘岗位描述…" rows="8" @input="emit('update:jdText', $event.target.value)" />
    <label class="section-label">我的简历内容</label>
    <textarea :value="resumeText" class="ai-textarea" placeholder="请粘贴完整简历正文…" rows="10" @input="emit('update:resumeText', $event.target.value)" />
    <button class="ai-btn" :disabled="!jdText.trim() || !resumeText.trim() || loading" @click="emit('diagnose')">
      {{ loading ? '诊断中…' : '生成诊断报告' }}
    </button>
  </section>
</template>

<style scoped>
.input-section { flex: 0 0 380px; display: flex; flex-direction: column; gap: 12px; }
.section-label { font-size: 13px; font-weight: 600; color: #1e6647; letter-spacing: 0.02em; text-transform: uppercase; }
.ai-textarea { width: 100%; padding: 14px 16px; border: 1.5px solid rgba(111,207,165,0.3); border-radius: 14px; background: rgba(255,255,255,0.75); color: #1a4d38; font-size: 14px; line-height: 1.65; resize: vertical; box-sizing: border-box; transition: border-color 0.18s, box-shadow 0.18s; font-family: inherit; }
.ai-textarea::placeholder { color: #5aad87; }
.ai-textarea:focus { outline: none; border-color: rgba(111,207,165,0.6); box-shadow: 0 0 0 3px rgba(111,207,165,0.12); }
.ai-btn { height: 46px; padding: 0 28px; border: 1px solid rgba(111,207,165,0.45); border-radius: 12px; background: rgba(111,207,165,0.18); backdrop-filter: blur(12px); color: #14543a; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.18s; font-family: inherit; }
.ai-btn:hover:not(:disabled) { background: rgba(111,207,165,0.32); border-color: rgba(111,207,165,0.7); box-shadow: 0 4px 16px rgba(52,168,120,0.2); transform: translateY(-1px); }
.ai-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.input-section.dark .section-label { color: #6fcfa5; }
.input-section.dark .ai-textarea { background: rgba(15,61,40,0.6); border-color: rgba(111,207,165,0.2); color: #c6f0dc; }
.input-section.dark .ai-textarea::placeholder { color: #3daf80; }
.input-section.dark .ai-btn { background: rgba(111,207,165,0.1); border-color: rgba(111,207,165,0.3); color: #6fcfa5; }
.input-section.dark .ai-btn:hover:not(:disabled) { background: rgba(111,207,165,0.18); }
</style>
