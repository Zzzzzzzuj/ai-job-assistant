<script setup>
import { useThemeStore } from '../../stores/theme'

defineProps({
  modelValue: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'analyze'])
const themeStore = useThemeStore()

function onInput(e) { emit('update:modelValue', e.target.value) }
function onAnalyze() { emit('analyze') }
</script>

<template>
  <section class="input-section" :class="{ dark: themeStore.isDark }">
    <label class="section-label">粘贴岗位 JD</label>
    <textarea :value="modelValue" class="ai-textarea" placeholder="请将招聘岗位描述粘贴到此处…" rows="16" @input="onInput" />
    <button class="ai-btn" :disabled="!modelValue.trim() || loading" @click="onAnalyze">
      {{ loading ? '分析中…' : '开始分析' }}
    </button>
  </section>
</template>

<style scoped>
.input-section { flex: 0 0 380px; display: flex; flex-direction: column; gap: 12px; }
.section-label { font-size: 13px; font-weight: 600; color: #1e6647; letter-spacing: 0.02em; text-transform: uppercase; }
.ai-textarea { width: 100%; min-height: 320px; padding: 14px 16px; border: 1.5px solid rgba(111,207,165,0.3); border-radius: 14px; background: rgba(255,255,255,0.75); color: #1a4d38; font-size: 14px; line-height: 1.65; resize: vertical; box-sizing: border-box; transition: border-color 0.18s, box-shadow 0.18s; backdrop-filter: blur(4px); }
.ai-textarea::placeholder { color: #5aad87; }
.ai-textarea:focus { outline: none; border-color: rgba(111,207,165,0.6); box-shadow: 0 0 0 3px rgba(111,207,165,0.12); }
.ai-btn { height: 46px; padding: 0 28px; border: 1px solid rgba(111,207,165,0.45); border-radius: 12px; background: rgba(111,207,165,0.18); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: #14543a; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.18s; position: relative; overflow: hidden; }
.ai-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg,rgba(255,255,255,0.25) 0%,rgba(255,255,255,0.05) 100%); pointer-events: none; }
.ai-btn:hover:not(:disabled) { background: rgba(111,207,165,0.32); border-color: rgba(111,207,165,0.7); box-shadow: 0 4px 16px rgba(52,168,120,0.2); transform: translateY(-1px); }
.ai-btn:active:not(:disabled) { transform: translateY(0); }
.ai-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
.input-section.dark .section-label { color: #6fcfa5; }
.input-section.dark .ai-textarea { background: rgba(15,61,40,0.6); border-color: rgba(111,207,165,0.2); color: #c6f0dc; }
.input-section.dark .ai-textarea::placeholder { color: #3daf80; }
.input-section.dark .ai-textarea:focus { border-color: rgba(111,207,165,0.5); box-shadow: 0 0 0 3px rgba(111,207,165,0.1); }
.input-section.dark .ai-btn { background: rgba(111,207,165,0.1); border-color: rgba(111,207,165,0.3); color: #6fcfa5; }
.input-section.dark .ai-btn:hover:not(:disabled) { background: rgba(111,207,165,0.18); border-color: rgba(111,207,165,0.5); box-shadow: 0 4px 16px rgba(111,207,165,0.15); }
</style>
