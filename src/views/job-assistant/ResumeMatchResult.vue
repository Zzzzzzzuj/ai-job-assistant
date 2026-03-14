<script setup>
import { useThemeStore } from '../../stores/theme'

const props = defineProps({
  result: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})
defineEmits(['dismiss-error'])
const themeStore = useThemeStore()
</script>

<template>
  <section class="result-section" :class="{ dark: themeStore.isDark }">
    <div v-if="props.error" class="state-error">
      <span class="state-error-icon">⚠</span><span>{{ props.error }}</span>
      <button type="button" class="error-dismiss" @click="$emit('dismiss-error')">×</button>
    </div>
    <div v-else-if="props.loading" class="state-loading">
      <div class="loading-spinner"></div><span>正在匹配分析，请稍候…</span>
    </div>
    <template v-else-if="result">
      <div class="result-card score-card">
        <h3 class="card-title">总体匹配度</h3>
        <div class="score-wrap">
          <div class="score-bar-bg"><div class="score-bar-fill" :style="{ width: result.matchScore + '%' }" /></div>
          <span class="score-text">{{ result.matchScore }}%</span>
        </div>
      </div>
      <div class="result-card">
        <h3 class="card-title">匹配点</h3>
        <ul class="bullet-list"><li v-for="(item,i) in result.matchPoints" :key="i">{{ item }}</li></ul>
      </div>
      <div class="result-card">
        <h3 class="card-title">缺失点</h3>
        <ul class="bullet-list"><li v-for="(item,i) in result.missingPoints" :key="i">{{ item }}</li></ul>
      </div>
      <div class="result-card">
        <h3 class="card-title">风险点</h3>
        <ul class="bullet-list"><li v-for="(item,i) in result.riskPoints" :key="i">{{ item }}</li></ul>
      </div>
      <div class="result-card">
        <h3 class="card-title">优化建议</h3>
        <ul class="bullet-list"><li v-for="(item,i) in result.suggestions" :key="i">{{ item }}</li></ul>
      </div>
    </template>
    <div v-else class="state-empty">
      <div class="empty-icon">◎</div>
      <p class="empty-title">等待分析</p>
      <p class="empty-desc">在左侧填写目标 JD 与简历内容后，点击「开始匹配分析」查看结果。</p>
    </div>
  </section>
</template>

<style scoped>
.result-section { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 14px; }
.result-card { padding: 18px 20px; border-radius: 14px; background: rgba(255,255,255,0.82); border: 1px solid rgba(111,207,165,0.18); box-shadow: 0 2px 12px rgba(52,168,120,0.07); backdrop-filter: blur(6px); }
.card-title { margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #1a4d38; }
.bullet-list { margin: 0; padding-left: 18px; }
.bullet-list li { margin-bottom: 6px; font-size: 14px; line-height: 1.65; color: #2e7a58; }
.bullet-list li:last-child { margin-bottom: 0; }
.score-wrap { display: flex; align-items: center; gap: 16px; }
.score-bar-bg { flex: 1; height: 10px; border-radius: 999px; background: rgba(111,207,165,0.15); overflow: hidden; }
.score-bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg,#6fcfa5,#3daf80); transition: width 0.4s ease; }
.score-text { flex-shrink: 0; font-size: 18px; font-weight: 700; color: #14543a; }
.state-error { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 14px; background: rgba(254,226,226,0.7); border: 1px solid rgba(239,68,68,0.25); color: #b91c1c; font-size: 14px; backdrop-filter: blur(6px); }
.state-error-icon { font-size: 16px; flex-shrink: 0; }
.state-error span:nth-child(2) { flex: 1; }
.error-dismiss { flex-shrink: 0; padding: 0 8px; border: none; background: transparent; color: inherit; font-size: 20px; line-height: 1; cursor: pointer; opacity: 0.7; }
.error-dismiss:hover { opacity: 1; }
.state-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 48px 32px; border-radius: 16px; background: rgba(255,255,255,0.6); border: 1px dashed rgba(111,207,165,0.4); color: #2e7a58; font-size: 14px; backdrop-filter: blur(6px); }
.loading-spinner { width: 28px; height: 28px; border: 2.5px solid rgba(111,207,165,0.2); border-top-color: #6fcfa5; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-empty { max-width: 480px; margin: 20px auto; padding: 48px 32px; text-align: center; border-radius: 16px; background: rgba(255,255,255,0.6); border: 1px dashed rgba(111,207,165,0.4); backdrop-filter: blur(6px); width: 100%; box-sizing: border-box; }
.empty-icon { font-size: 36px; color: #6fcfa5; margin-bottom: 16px; }
.empty-title { margin: 0 0 10px; font-size: 16px; font-weight: 700; color: #14543a; }
.empty-desc { margin: 0; font-size: 13px; color: #5aad87; line-height: 1.7; }
.result-section.dark .result-card { background: rgba(15,61,40,0.65); border-color: rgba(111,207,165,0.15); box-shadow: 0 2px 12px rgba(0,0,0,0.25); }
.result-section.dark .card-title { color: #6fcfa5; }
.result-section.dark .bullet-list li { color: #5aad87; }
.result-section.dark .score-bar-bg { background: rgba(111,207,165,0.1); }
.result-section.dark .score-bar-fill { background: linear-gradient(90deg,#1e6647,#14543a); }
.result-section.dark .score-text { color: #6fcfa5; }
.result-section.dark .state-error { background: rgba(127,29,29,0.3); border-color: rgba(239,68,68,0.2); color: #fca5a5; }
.result-section.dark .state-loading { background: rgba(15,61,40,0.4); border-color: rgba(111,207,165,0.2); color: #6fcfa5; }
.result-section.dark .loading-spinner { border-color: rgba(111,207,165,0.15); border-top-color: #6fcfa5; }
.result-section.dark .state-empty { background: rgba(15,61,40,0.4); border-color: rgba(111,207,165,0.2); }
.result-section.dark .empty-icon { color: #3daf80; }
.result-section.dark .empty-title { color: #c6f0dc; }
.result-section.dark .empty-desc { color: #5aad87; }
</style>
