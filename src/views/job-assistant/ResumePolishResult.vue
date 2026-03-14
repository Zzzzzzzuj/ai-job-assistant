<script setup>
import { ref } from 'vue'
import { useThemeStore } from '../../stores/theme'
import DiffViewer from '../../components/DiffViewer.vue'
import ResumeTemplateModal from '../../components/ResumeTemplateModal.vue'

const props = defineProps({
  result: { type: String, default: null },
  mergedResume: { type: String, default: null },
  rawContent: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})
defineEmits(['dismiss-error'])
const themeStore = useThemeStore()
const copyTip = ref('')
const showDiff = ref(false)
const exportingPdf = ref(false)
const showTemplateModal = ref(false)

const extTemplates = [
  { icon: '🎨', name: 'Canva 简历模板', desc: '丰富视觉风格，适合设计/产品/运营类岗位', url: 'https://www.canva.com/resumes/templates/' },
  { icon: '📄', name: 'Overleaf LaTeX 简历', desc: '专业排版，适合技术/学术/外企英文简历', url: 'https://www.overleaf.com/gallery/tagged/cv' },
  { icon: '✨', name: 'WonderCV', desc: '国内主流简历平台，校招/社招模板齐全', url: 'https://www.wondercv.com/' },
  { icon: '🌊', name: 'FlowCV', desc: '现代简洁风格，适合互联网/前端/全栈岗位', url: 'https://flowcv.com/' },
  { icon: '💻', name: 'Resumake', desc: '开源简历生成器，支持 JSON 数据导入', url: 'https://resumake.io/' },
]

async function handleCopy() {
  if (!props.result) return
  try {
    await navigator.clipboard.writeText(props.mergedResume || props.result)
    copyTip.value = '已复制'
  } catch {
    copyTip.value = '复制失败'
  }
  setTimeout(() => { copyTip.value = '' }, 2000)
}

async function handleExportPdf() {
  if (!props.result || exportingPdf.value) return
  exportingPdf.value = true
  try {
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')
    const el = document.getElementById('polish-export-area')
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW - 20
    const imgH = (canvas.height * imgW) / canvas.width
    let remaining = imgH
    let first = true
    const pageImgH = pageH - 20
    while (remaining > 0) {
      const sliceH = Math.min(remaining, pageImgH)
      const srcY = (imgH - remaining) / imgH * canvas.height
      const tmp = document.createElement('canvas')
      tmp.width = canvas.width
      tmp.height = (sliceH / imgH) * canvas.height
      tmp.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, tmp.height, 0, 0, canvas.width, tmp.height)
      if (!first) pdf.addPage()
      pdf.addImage(tmp.toDataURL('image/png'), 'PNG', 10, 10, imgW, sliceH)
      remaining -= sliceH
      first = false
    }
    pdf.save('简历_完整版.pdf')
  } catch (e) {
    console.error('PDF 导出失败', e)
  } finally {
    exportingPdf.value = false
  }
}
</script>

<template>
  <section class="result-section" :class="{ dark: themeStore.isDark }">
    <div v-if="props.error" class="state-error">
      <span class="state-error-icon">⚠</span><span>{{ props.error }}</span>
      <button type="button" class="error-dismiss" @click="$emit('dismiss-error')">×</button>
    </div>
    <div v-else-if="props.loading" class="state-loading">
      <div class="loading-spinner"></div><span>正在润色，请稍候…</span>
    </div>
    <template v-else-if="result">
      <div class="action-bar">
        <button class="action-btn" :class="{ active: showDiff }" @click="showDiff = !showDiff">{{ showDiff ? '隐藏差异' : '对比差异' }}</button>
        <button class="action-btn export-btn" :disabled="exportingPdf" @click="handleExportPdf">{{ exportingPdf ? '导出中…' : '导出完整简历 PDF' }}</button>
        <button class="action-btn tpl-btn" @click="showTemplateModal = true">模板推荐</button>
        <span v-if="copyTip" class="copy-tip">{{ copyTip }}</span>
        <button class="action-btn copy-btn" @click="handleCopy">一键复制</button>
      </div>
      <ResumeTemplateModal v-if="showTemplateModal" :content="mergedResume || result" @close="showTemplateModal = false" />
      <div id="polish-export-area" class="result-scroll-area">
        <div v-if="showDiff" class="result-card diff-card">
          <h3 class="card-title">修改前后差异对比</h3>
          <div class="diff-legend">
            <span class="legend-ins">+ 新增</span>
            <span class="legend-del">− 删除</span>
            <span class="legend-eq">未变</span>
          </div>
          <DiffViewer :old-text="rawContent" :new-text="mergedResume || result" />
        </div>
        <template v-if="!showDiff">
          <div class="result-card original-card">
            <h3 class="card-title">润色段落</h3>
            <div class="card-text">{{ result }}</div>
          </div>
          <div v-if="mergedResume" class="result-card polish-card">
            <h3 class="card-title">完整简历（已融合润色）</h3>
            <div class="card-text">{{ mergedResume }}</div>
          </div>
        </template>
      </div>
    </template>
    <div v-else class="state-empty">
      <div class="empty-icon">◎</div>
      <p class="empty-title">等待润色</p>
      <p class="empty-desc">选择润色类型，填写 JD 与完整简历后点击「开始润色」查看结果。</p>
    </div>
    <div class="ext-tpl-section">
      <h3 class="ext-tpl-title">更多简历模板推荐</h3>
      <div class="ext-tpl-grid">
        <a v-for="t in extTemplates" :key="t.url" class="ext-tpl-card" :href="t.url" target="_blank" rel="noopener">
          <span class="ext-tpl-icon">{{ t.icon }}</span>
          <div class="ext-tpl-info"><span class="ext-tpl-name">{{ t.name }}</span><span class="ext-tpl-desc">{{ t.desc }}</span></div>
          <span class="ext-tpl-arrow">→</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.result-section { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 14px; min-height: 0; overflow-y: auto; }
.result-scroll-area { display: flex; flex-direction: column; gap: 14px; }
.action-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex-shrink: 0; }
.action-btn { height: 34px; padding: 0 16px; border: 1px solid rgba(111,207,165,0.4); border-radius: 8px; background: rgba(111,207,165,0.15); backdrop-filter: blur(8px); color: #14543a; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s; font-family: inherit; }
.action-btn:hover:not(:disabled) { background: rgba(111,207,165,0.28); border-color: rgba(111,207,165,0.65); }
.action-btn.active { background: rgba(52,168,120,0.22); border-color: rgba(52,168,120,0.5); color: #0d3d27; }
.action-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.export-btn { background: rgba(111,207,165,0.12); }
.copy-btn { margin-left: auto; }
.copy-tip { font-size: 12px; color: #2e7a58; }
.result-card { padding: 18px 20px; border-radius: 14px; background: rgba(255,255,255,0.82); border: 1px solid rgba(111,207,165,0.18); box-shadow: 0 2px 12px rgba(52,168,120,0.07); backdrop-filter: blur(6px); }
.original-card { border-left: 3px solid rgba(111,207,165,0.4); }
.polish-card { border-left: 3px solid #6fcfa5; }
.diff-card { border-left: 3px solid #3daf80; }
.card-title { margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #1a4d38; }
.card-text { font-size: 14px; line-height: 1.75; color: #2e7a58; white-space: pre-wrap; word-break: break-word; max-height: 300px; overflow-y: auto; }
.diff-legend { display: flex; gap: 14px; margin-bottom: 12px; font-size: 12px; font-weight: 600; }
.legend-ins { color: #0d6b3a; background: rgba(52,168,120,0.15); padding: 2px 8px; border-radius: 4px; }
.legend-del { color: #b91c1c; background: rgba(239,68,68,0.1); padding: 2px 8px; border-radius: 4px; text-decoration: line-through; }
.legend-eq { color: #5aad87; padding: 2px 8px; }
.state-error { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 14px; background: rgba(254,226,226,0.7); border: 1px solid rgba(239,68,68,0.25); color: #b91c1c; font-size: 14px; }
.state-error-icon { font-size: 16px; flex-shrink: 0; }
.state-error span:nth-child(2) { flex: 1; }
.error-dismiss { flex-shrink: 0; padding: 0 8px; border: none; background: transparent; color: inherit; font-size: 20px; cursor: pointer; opacity: 0.7; }
.error-dismiss:hover { opacity: 1; }
.state-loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 48px 32px; border-radius: 16px; background: rgba(255,255,255,0.6); border: 1px dashed rgba(111,207,165,0.4); color: #2e7a58; font-size: 14px; }
.loading-spinner { width: 28px; height: 28px; border: 2.5px solid rgba(111,207,165,0.2); border-top-color: #6fcfa5; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-empty { padding: 32px 24px; text-align: center; border-radius: 16px; background: rgba(255,255,255,0.6); border: 1px dashed rgba(111,207,165,0.4); }
.empty-icon { font-size: 32px; color: #6fcfa5; margin-bottom: 12px; }
.empty-title { margin: 0 0 8px; font-size: 15px; font-weight: 700; color: #14543a; }
.empty-desc { margin: 0; font-size: 12px; color: #5aad87; line-height: 1.7; }
.ext-tpl-section { padding: 16px 18px; border-radius: 14px; background: rgba(255,255,255,0.7); border: 1px solid rgba(111,207,165,0.18); flex-shrink: 0; }
.ext-tpl-title { margin: 0 0 10px; font-size: 14px; font-weight: 700; color: #1a4d38; }
.ext-tpl-grid { display: flex; flex-direction: column; gap: 6px; }
.ext-tpl-card { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 9px; border: 1px solid rgba(111,207,165,0.18); background: rgba(255,255,255,0.55); text-decoration: none; transition: all 0.18s; }
.ext-tpl-card:hover { background: rgba(111,207,165,0.12); border-color: rgba(111,207,165,0.4); transform: translateX(3px); }
.ext-tpl-icon { font-size: 16px; flex-shrink: 0; width: 24px; text-align: center; }
.ext-tpl-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.ext-tpl-name { font-size: 12px; font-weight: 600; color: #1a4d38; }
.ext-tpl-desc { font-size: 11px; color: #5aad87; line-height: 1.4; }
.ext-tpl-arrow { font-size: 13px; color: #6fcfa5; flex-shrink: 0; transition: transform 0.18s; }
.ext-tpl-card:hover .ext-tpl-arrow { transform: translateX(3px); }
.result-section.dark .action-btn { background: rgba(111,207,165,0.08); border-color: rgba(111,207,165,0.25); color: #6fcfa5; }
.result-section.dark .action-btn:hover:not(:disabled) { background: rgba(111,207,165,0.16); }
.result-section.dark .action-btn.active { background: rgba(52,168,120,0.18); border-color: rgba(52,168,120,0.4); color: #c6f0dc; }
.result-section.dark .copy-tip { color: #6fcfa5; }
.result-section.dark .result-card { background: rgba(15,61,40,0.65); border-color: rgba(111,207,165,0.15); box-shadow: 0 2px 12px rgba(0,0,0,0.25); }
.result-section.dark .card-title { color: #6fcfa5; }
.result-section.dark .card-text { color: #5aad87; }
.result-section.dark .state-error { background: rgba(127,29,29,0.3); border-color: rgba(239,68,68,0.2); color: #fca5a5; }
.result-section.dark .state-loading { background: rgba(15,61,40,0.4); border-color: rgba(111,207,165,0.2); color: #6fcfa5; }
.result-section.dark .loading-spinner { border-color: rgba(111,207,165,0.15); border-top-color: #6fcfa5; }
.result-section.dark .state-empty { background: rgba(15,61,40,0.4); border-color: rgba(111,207,165,0.2); }
.result-section.dark .empty-icon { color: #3daf80; }
.result-section.dark .empty-title { color: #c6f0dc; }
.result-section.dark .empty-desc { color: #5aad87; }
.result-section.dark .ext-tpl-section { background: rgba(15,61,40,0.55); border-color: rgba(111,207,165,0.12); }
.result-section.dark .ext-tpl-title { color: #6fcfa5; }
.result-section.dark .ext-tpl-card { background: rgba(15,61,40,0.4); border-color: rgba(111,207,165,0.12); }
.result-section.dark .ext-tpl-card:hover { background: rgba(111,207,165,0.1); }
.result-section.dark .ext-tpl-name { color: #c6f0dc; }
.result-section.dark .ext-tpl-desc { color: #3daf80; }
.result-section.dark .ext-tpl-arrow { color: #3daf80; }
</style>
