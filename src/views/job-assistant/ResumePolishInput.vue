<script setup>
import { useThemeStore } from '../../stores/theme'

defineProps({
  jdText: { type: String, default: '' },
  rawContent: { type: String, default: '' },
  polishType: { type: String, default: 'intro' },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['update:jdText', 'update:rawContent', 'update:polishType', 'polish'])
const themeStore = useThemeStore()

const polishTypes = [
  { value: 'intro', label: '个人介绍' },
  { value: 'project', label: '项目经历' },
  { value: 'skill', label: '专业技能' },
]
</script>

<template>
  <section class="input-section" :class="{ dark: themeStore.isDark }">
    <label class="section-label">目标岗位 JD</label>
    <textarea :value="jdText" class="ai-textarea" placeholder="请粘贴目标岗位的招聘描述…" rows="5" @input="emit('update:jdText', $event.target.value)" />

    <label class="section-label">润色类型</label>
    <div class="type-group">
      <button
        v-for="t in polishTypes"
        :key="t.value"
        class="type-btn"
        :class="{ active: polishType === t.value }"
        type="button"
        @click="emit('update:polishType', t.value)"
      >{{ t.label }}</button>
    </div>
    <p class="type-hint">AI 将自动从简历中识别对应段落进行润色，无需手动拆分。</p>

    <label class="section-label">完整简历内容</label>
    <textarea :value="rawContent" class="ai-textarea" placeholder="请粘贴完整简历正文（包含个人介绍、项目经历、专业技能等所有内容）…" rows="12" @input="emit('update:rawContent', $event.target.value)" />

    <button class="ai-btn" :disabled="!jdText.trim() || !rawContent.trim() || loading" @click="emit('polish')">
      {{ loading ? '润色中…' : '开始润色' }}
    </button>
  </section>
</template>

<style scoped>
.input-section { flex: 0 0 380px; display: flex; flex-direction: column; gap: 12px; }
.section-label { font-size: 13px; font-weight: 600; color: #1e6647; letter-spacing: 0.02em; text-transform: uppercase; }
.type-group { display: flex; gap: 8px; }
.type-btn { flex: 1; height: 36px; border: 1.5px solid rgba(111,207,165,0.35); border-radius: 10px; background: rgba(255,255,255,0.6); color: #2e7a58; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s; font-family: inherit; }
.type-btn:hover { background: rgba(111,207,165,0.2); border-color: rgba(111,207,165,0.6); }
.type-btn.active { background: rgba(111,207,165,0.28); border-color: #3daf80; color: #14543a; box-shadow: 0 0 0 2px rgba(61,175,128,0.18); }
.type-hint { margin: 0; font-size: 11px; color: #5aad87; line-height: 1.5; }
.ai-textarea { width: 100%; padding: 14px 16px; border: 1.5px solid rgba(111,207,165,0.3); border-radius: 14px; background: rgba(255,255,255,0.75); color: #1a4d38; font-size: 14px; line-height: 1.65; resize: vertical; box-sizing: border-box; transition: border-color 0.18s, box-shadow 0.18s; backdrop-filter: blur(4px); font-family: inherit; }
.ai-textarea::placeholder { color: #5aad87; }
.ai-textarea:focus { outline: none; border-color: rgba(111,207,165,0.6); box-shadow: 0 0 0 3px rgba(111,207,165,0.12); }
.ai-btn { height: 46px; padding: 0 28px; border: 1px solid rgba(111,207,165,0.45); border-radius: 12px; background: rgba(111,207,165,0.18); backdrop-filter: blur(12px); color: #14543a; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.18s; position: relative; overflow: hidden; font-family: inherit; }
.ai-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg,rgba(255,255,255,0.25) 0%,rgba(255,255,255,0.05) 100%); pointer-events: none; }
.ai-btn:hover:not(:disabled) { background: rgba(111,207,165,0.32); border-color: rgba(111,207,165,0.7); box-shadow: 0 4px 16px rgba(52,168,120,0.2); transform: translateY(-1px); }
.ai-btn:active:not(:disabled) { transform: translateY(0); }
.ai-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.input-section.dark .section-label { color: #6fcfa5; }
.input-section.dark .type-btn { background: rgba(15,61,40,0.5); border-color: rgba(111,207,165,0.2); color: #6fcfa5; }
.input-section.dark .type-btn:hover { background: rgba(111,207,165,0.12); }
.input-section.dark .type-btn.active { background: rgba(111,207,165,0.18); border-color: #6fcfa5; color: #c6f0dc; }
.input-section.dark .type-hint { color: #3daf80; }
.input-section.dark .ai-textarea { background: rgba(15,61,40,0.6); border-color: rgba(111,207,165,0.2); color: #c6f0dc; }
.input-section.dark .ai-textarea::placeholder { color: #3daf80; }
.input-section.dark .ai-textarea:focus { border-color: rgba(111,207,165,0.5); box-shadow: 0 0 0 3px rgba(111,207,165,0.1); }
.input-section.dark .ai-btn { background: rgba(111,207,165,0.1); border-color: rgba(111,207,165,0.3); color: #6fcfa5; }
.input-section.dark .ai-btn:hover:not(:disabled) { background: rgba(111,207,165,0.18); border-color: rgba(111,207,165,0.5); }
</style>
