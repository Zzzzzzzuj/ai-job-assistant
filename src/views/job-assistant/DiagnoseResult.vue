<script setup>
import { useThemeStore } from '../../stores/theme'

const props = defineProps({
  result: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})
defineEmits(['dismiss-error'])
const themeStore = useThemeStore()

function scoreColor(score) {
  if (score >= 80) return '#3daf80'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}
</script>

<template>
  <section class="result-section" :class="{ dark: themeStore.isDark }">
    <div v-if="props.error" class="state-error">
      <span class="state-error-icon">⚠</span><span>{{ props.error }}</span>
      <button type="button" class="error-dismiss" @click="$emit('dismiss-error')">×</button>
    </div>
    <div v-else-if="props.loading" class="state-loading">
      <div class="loading-spinner"></div>
      <span>正在生成诊断报告，请稍候…</span>
    </div>
    <template v-else-if="result">
      <div class="result-card score-hero">
        <div class="score-circle" :style="{ '--sc': scoreColor(result.overallScore) }">
          <span class="score-num">{{ result.overallScore }}</span>
          <span class="score-unit">分</span>
        </div>
        <div class="score-meta">
          <h2 class="report-title">匹配度诊断报告</h2>
          <p class="score-summary">{{ result.summary }}</p>
        </div>
      </div>
      <div class="result-card">
        <h3 class="card-title">各维度评分</h3>
        <div class="dim-list">
          <div v-for="(dim, i) in result.dimensions" :key="i" class="dim-item">
            <div class="dim-head">
              <span class="dim-name">{{ dim.name }}</span>
              <span class="dim-score" :style="{ color: scoreColor(dim.score) }">{{ dim.score }}</span>
            </div>
            <div class="dim-bar-bg"><div class="dim-bar-fill" :style="{ width: dim.score + '%', background: scoreColor(dim.score) }" /></div>
            <p class="dim-desc">{{ dim.comment }}</p>
          </div>
        </div>
      </div>
      <div class="result-card">
        <h3 class="card-title">缺失技能项</h3>
        <div class="tag-list">
          <span v-for="(skill, i) in result.missingSkills" :key="i" class="skill-tag missing">{{ skill }}</span>
        </div>
      </div>
      <div class="result-card">
        <h3 class="card-title">优势亮点</h3>
        <div class="tag-list">
          <span v-for="(s, i) in result.strengths" :key="i" class="skill-tag strength">{{ s }}</span>
        </div>
      </div>
      <div class="result-card">
        <h3 class="card-title">提升建议</h3>
        <ol class="suggest-list"><li v-for="(s,i) in result.suggestions" :key="i">{{ s }}</li></ol>
      </div>
      <div class="result-card">
        <h3 class="card-title">面试高频问题预测</h3>
        <ul class="bullet-list"><li v-for="(q,i) in result.interviewQuestions" :key="i">{{ q }}</li></ul>
      </div>
    </template>
    <div v-else class="state-empty">
      <div class="empty-icon">⚕</div>
      <p class="empty-title">等待诊断</p>
      <p class="empty-desc">在左侧填写 JD 与简历，点击「生成诊断报告」，将生成详细匹配度分析。</p>
    </div>
  </section>
</template>

<style scoped>
.result-section { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 14px; }
.result-card { padding: 18px 20px; border-radius: 14px; background: rgba(255,255,255,0.82); border: 1px solid rgba(111,207,165,0.18); box-shadow: 0 2px 12px rgba(52,168,120,0.07); backdrop-filter: blur(6px); }
.score-hero { display: flex; align-items: center; gap: 24px; }
.score-circle { width: 88px; height: 88px; border-radius: 50%; border: 4px solid var(--sc,#6fcfa5); display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(255,255,255,0.6); }
.score-num { font-size: 28px; font-weight: 800; color: var(--sc,#6fcfa5); line-height: 1; }
.score-unit { font-size: 12px; color: #5aad87; }
.score-meta { flex: 1; min-width: 0; }
.report-title { margin: 0 0 6px; font-size: 16px; font-weight: 700; color: #1a4d38; }
.score-summary { margin: 0; font-size: 13px; line-height: 1.65; color: #2e7a58; }
.card-title { margin: 0 0 14px; font-size: 14px; font-weight: 700; color: #1a4d38; }
.dim-list { display: flex; flex-direction: column; gap: 14px; }
.dim-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.dim-name { font-size: 13px; font-weight: 600; color: #1a4d38; }
.dim-score { font-size: 14px; font-weight: 700; }
.dim-bar-bg { height: 7px; border-radius: 999px; background: rgba(111,207,165,0.15); overflow: hidden; margin-bottom: 5px; }
.dim-bar-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }
.dim-desc { margin: 0; font-size: 12px; color: #5aad87; line-height: 1.5; }
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
.skill-tag { padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 500; }
.skill-tag.missing { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #b91c1c; }
.skill-tag.strength { background: rgba(111,207,165,0.15); border: 1px solid rgba(111,207,165,0.35); color: #1e6647; }
.suggest-list { margin: 0; padding-left: 20px; }
.suggest-list li,.bullet-list li { margin-bottom: 8px; font-size: 14px; line-height: 1.65; color: #2e7a58; }
.bullet-list { margin: 0; padding-left: 18px; }
.state-error { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 14px; background: rgba(254,226,226,0.7); border: 1px solid rgba(239,68,68,0.25); color: #b91c1c; font-size: 14px; }
.state-error-icon { font-size: 16px; flex-shrink: 0; }
.state-error span:nth-child(2) { flex: 1; }
.error-dismiss { flex-shrink: 0; padding: 0 8px; border: none; background: transparent; color: inherit; font-size: 20px; cursor: pointer; opacity: 0.7; }
.state-loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 48px 32px; border-radius: 16px; background: rgba(255,255,255,0.6); border: 1px dashed rgba(111,207,165,0.4); color: #2e7a58; font-size: 14px; }
.loading-spinner { width: 28px; height: 28px; border: 2.5px solid rgba(111,207,165,0.2); border-top-color: #6fcfa5; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-empty { max-width: 480px; margin: 20px auto; padding: 48px 32px; text-align: center; border-radius: 16px; background: rgba(255,255,255,0.6); border: 1px dashed rgba(111,207,165,0.4); width: 100%; box-sizing: border-box; }
.empty-icon { font-size: 36px; color: #6fcfa5; margin-bottom: 16px; }
.empty-title { margin: 0 0 10px; font-size: 16px; font-weight: 700; color: #14543a; }
.empty-desc { margin: 0; font-size: 13px; color: #5aad87; line-height: 1.7; }
.result-section.dark .result-card { background: rgba(15,61,40,0.65); border-color: rgba(111,207,165,0.15); }
.result-section.dark .report-title,.result-section.dark .card-title { color: #6fcfa5; }
.result-section.dark .score-summary,.result-section.dark .suggest-list li,.result-section.dark .bullet-list li { color: #5aad87; }
.result-section.dark .score-circle { background: rgba(15,61,40,0.6); }
.result-section.dark .score-unit,.result-section.dark .dim-desc { color: #3daf80; }
.result-section.dark .dim-name { color: #c6f0dc; }
.result-section.dark .dim-bar-bg { background: rgba(111,207,165,0.1); }
.result-section.dark .skill-tag.missing { background: rgba(127,29,29,0.25); border-color: rgba(239,68,68,0.2); color: #fca5a5; }
.result-section.dark .skill-tag.strength { background: rgba(111,207,165,0.1); border-color: rgba(111,207,165,0.25); color: #6fcfa5; }
.result-section.dark .state-error { background: rgba(127,29,29,0.3); border-color: rgba(239,68,68,0.2); color: #fca5a5; }
.result-section.dark .state-loading { background: rgba(15,61,40,0.4); border-color: rgba(111,207,165,0.2); color: #6fcfa5; }
.result-section.dark .loading-spinner { border-color: rgba(111,207,165,0.15); border-top-color: #6fcfa5; }
.result-section.dark .state-empty { background: rgba(15,61,40,0.4); border-color: rgba(111,207,165,0.2); }
.result-section.dark .empty-icon { color: #3daf80; }
.result-section.dark .empty-title { color: #c6f0dc; }
.result-section.dark .empty-desc { color: #5aad87; }
</style>
