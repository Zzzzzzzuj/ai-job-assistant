<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '../stores/theme'

const props = defineProps({
  content: { type: String, default: '' },
})
const emit = defineEmits(['close'])
const themeStore = useThemeStore()
const selectedTemplate = ref('A')
const exportingPdf = ref(false)

const templates = [
  { id: 'A', name: '模板 A', tag: '前端实习', desc: '简洁现代，突出项目经历，适合前端实习投递', accentColor: '#3daf80', style: 'clean' },
  { id: 'B', name: '模板 B', tag: '校招', desc: '结构清晰，强调教育背景和技能栈，适合应届校招', accentColor: '#6fcfa5', style: 'academic' },
  { id: 'C', name: '模板 C', tag: '英文简历', desc: '版式紧凑，双栏布局，适合英文或双语简历', accentColor: '#14543a', style: 'compact' },
]
const current = computed(() => templates.find(t => t.id === selectedTemplate.value))

async function exportPdf() {
  if (exportingPdf.value) return
  exportingPdf.value = true
  try {
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')
    const el = document.getElementById('tpl-preview-area')
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW - 16
    const imgH = (canvas.height * imgW) / canvas.width
    let remaining = imgH
    let first = true
    const pageImgH = pageH - 16
    while (remaining > 0) {
      const sliceH = Math.min(remaining, pageImgH)
      const srcY = (imgH - remaining) / imgH * canvas.height
      const tmp = document.createElement('canvas')
      tmp.width = canvas.width
      tmp.height = (sliceH / imgH) * canvas.height
      tmp.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, tmp.height, 0, 0, canvas.width, tmp.height)
      if (!first) pdf.addPage()
      pdf.addImage(tmp.toDataURL('image/png'), 'PNG', 8, 8, imgW, sliceH)
      remaining -= sliceH
      first = false
    }
    pdf.save(`简历_模板${selectedTemplate.value}.pdf`)
  } catch (e) {
    console.error('导出失败', e)
  } finally {
    exportingPdf.value = false
  }
}
</script>

<template>
  <div class="tpl-mask" :class="{ dark: themeStore.isDark }" @click.self="emit('close')">
    <div class="tpl-modal">
      <div class="tpl-header">
        <span class="tpl-header-title">简历模板推荐</span>
        <button class="tpl-close" @click="emit('close')">×</button>
      </div>
      <div class="tpl-body">
        <div class="tpl-list">
          <div v-for="t in templates" :key="t.id" class="tpl-item" :class="{ selected: selectedTemplate === t.id }" :style="{ '--ac': t.accentColor }" @click="selectedTemplate = t.id">
            <div class="tpl-item-head">
              <span class="tpl-name">{{ t.name }}</span>
              <span class="tpl-tag">{{ t.tag }}</span>
            </div>
            <p class="tpl-desc">{{ t.desc }}</p>
            <div class="tpl-mini-preview">
              <div class="mini-header" :style="{ background: t.accentColor }"></div>
              <div class="mini-lines">
                <div class="mini-line w80"></div>
                <div class="mini-line w60"></div>
                <div class="mini-line w90"></div>
                <div class="mini-line w50"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="tpl-preview-wrap">
          <div class="preview-actions">
            <span class="preview-label">预览 · 模板 {{ selectedTemplate }}</span>
            <button class="export-pdf-btn" :disabled="exportingPdf" @click="exportPdf">{{ exportingPdf ? '导出中…' : '导出 PDF' }}</button>
          </div>
          <div class="preview-scroll">
            <div id="tpl-preview-area" class="tpl-page">
              <template v-if="current.style === 'clean'">
                <div class="clean-header" :style="{ background: current.accentColor }">
                  <h1 class="clean-name">我的简历</h1>
                  <p class="clean-sub">前端开发 · 求职中</p>
                </div>
                <div class="clean-section">
                  <h2 class="clean-stitle" :style="{ color: current.accentColor }">润色内容</h2>
                  <div class="clean-divider" :style="{ background: current.accentColor }"></div>
                  <p class="clean-body">{{ content || '（润色内容将显示在此处）' }}</p>
                </div>
              </template>
              <template v-else-if="current.style === 'academic'">
                <div class="acad-layout">
                  <div class="acad-stripe" :style="{ background: current.accentColor }"></div>
                  <div class="acad-content">
                    <div class="acad-top">
                      <h1 class="acad-name">我的简历</h1>
                      <span class="acad-badge" :style="{ background: current.accentColor }">校招求职</span>
                    </div>
                    <h2 class="acad-stitle" :style="{ borderColor: current.accentColor }">润色内容</h2>
                    <p class="acad-body">{{ content || '（润色内容将显示在此处）' }}</p>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="cpt-layout">
                  <div class="cpt-sidebar" :style="{ background: current.accentColor }">
                    <h1 class="cpt-name">My Resume</h1>
                    <p class="cpt-role">Frontend Developer</p>
                    <div class="cpt-div"></div>
                    <p class="cpt-label">SKILLS</p>
                    <p class="cpt-skills">Vue · React · TypeScript</p>
                  </div>
                  <div class="cpt-main">
                    <h2 class="cpt-stitle">Polished Content</h2>
                    <p class="cpt-body">{{ content || '(Polished content will appear here)' }}</p>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tpl-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; box-sizing: border-box; }
.tpl-modal { width: 960px; max-width: 100%; max-height: 90vh; background: #e6f7f1; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.2); }
.tpl-header { height: 56px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; background: #d0f0e4; border-bottom: 1px solid rgba(111,207,165,0.25); flex-shrink: 0; }
.tpl-header-title { font-size: 15px; font-weight: 700; color: #14543a; }
.tpl-close { width: 32px; height: 32px; border: none; background: transparent; font-size: 22px; color: #5aad87; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.tpl-close:hover { background: rgba(111,207,165,0.2); color: #1a4d38; }
.tpl-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }
.tpl-list { width: 240px; flex-shrink: 0; padding: 14px 10px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; border-right: 1px solid rgba(111,207,165,0.2); background: #d8f3ea; }
.tpl-item { padding: 12px; border-radius: 12px; cursor: pointer; border: 2px solid transparent; transition: all 0.18s; background: rgba(255,255,255,0.6); }
.tpl-item:hover { border-color: rgba(111,207,165,0.4); background: rgba(255,255,255,0.85); }
.tpl-item.selected { border-color: var(--ac,#6fcfa5); background: rgba(255,255,255,0.95); box-shadow: 0 2px 12px rgba(52,168,120,0.15); }
.tpl-item-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
.tpl-name { font-size: 13px; font-weight: 700; color: #1a4d38; }
.tpl-tag { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 999px; background: rgba(111,207,165,0.15); border: 1px solid rgba(111,207,165,0.3); color: #1e6647; }
.tpl-desc { margin: 0 0 8px; font-size: 11px; color: #5aad87; line-height: 1.5; }
.tpl-mini-preview { height: 50px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(111,207,165,0.2); background: #fff; display: flex; flex-direction: column; }
.mini-header { height: 11px; flex-shrink: 0; }
.mini-lines { flex: 1; padding: 4px 6px; display: flex; flex-direction: column; gap: 3px; }
.mini-line { height: 3px; border-radius: 2px; background: #d0f0e4; }
.mini-line.w80{width:80%}.mini-line.w60{width:60%}.mini-line.w90{width:90%}.mini-line.w50{width:50%}
.tpl-preview-wrap { flex: 1; display: flex; flex-direction: column; min-width: 0; padding: 14px; gap: 10px; overflow: hidden; }
.preview-actions { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.preview-label { font-size: 13px; font-weight: 600; color: #2e7a58; }
.export-pdf-btn { height: 32px; padding: 0 18px; border: 1px solid rgba(111,207,165,0.45); border-radius: 8px; background: rgba(111,207,165,0.18); color: #14543a; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s; font-family: inherit; }
.export-pdf-btn:hover:not(:disabled) { background: rgba(111,207,165,0.32); }
.export-pdf-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.preview-scroll { flex: 1; overflow-y: auto; border-radius: 12px; background: #f5fdf9; border: 1px solid rgba(111,207,165,0.2); }
.tpl-page { min-height: 100%; background: #fff; font-family: 'Segoe UI', 'PingFang SC', sans-serif; }
/* 模板 A - clean */
.clean-header { padding: 28px 32px 20px; color: #fff; }
.clean-name { margin: 0 0 4px; font-size: 22px; font-weight: 800; }
.clean-sub { margin: 0; font-size: 13px; opacity: 0.88; }
.clean-section { padding: 20px 32px; }
.clean-stitle { margin: 0 0 6px; font-size: 14px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
.clean-divider { height: 2px; border-radius: 1px; margin-bottom: 12px; }
.clean-body { margin: 0; font-size: 13px; line-height: 1.75; color: #1a4d38; white-space: pre-wrap; word-break: break-word; }
/* 模板 B - academic */
.acad-layout { display: flex; min-height: 100%; }
.acad-stripe { width: 6px; flex-shrink: 0; }
.acad-content { flex: 1; padding: 28px 28px 20px; }
.acad-top { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.acad-name { margin: 0; font-size: 22px; font-weight: 800; color: #1a4d38; }
.acad-badge { padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; color: #fff; }
.acad-stitle { margin: 0 0 10px; font-size: 14px; font-weight: 700; color: #1a4d38; padding-bottom: 6px; border-bottom: 2px solid; }
.acad-body { margin: 0; font-size: 13px; line-height: 1.75; color: #2e7a58; white-space: pre-wrap; word-break: break-word; }
/* 模板 C - compact */
.cpt-layout { display: flex; min-height: 100%; }
.cpt-sidebar { width: 160px; flex-shrink: 0; padding: 24px 16px; color: #fff; }
.cpt-name { margin: 0 0 4px; font-size: 16px; font-weight: 800; }
.cpt-role { margin: 0 0 14px; font-size: 11px; opacity: 0.85; }
.cpt-div { height: 1px; background: rgba(255,255,255,0.35); margin-bottom: 14px; }
.cpt-label { margin: 0 0 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.75; }
.cpt-skills { margin: 0; font-size: 11px; line-height: 1.6; opacity: 0.9; }
.cpt-main { flex: 1; padding: 24px 20px; }
.cpt-stitle { margin: 0 0 10px; font-size: 14px; font-weight: 700; color: #1a4d38; border-bottom: 1.5px solid #d0f0e4; padding-bottom: 6px; }
.cpt-body { margin: 0; font-size: 13px; line-height: 1.75; color: #2e7a58; white-space: pre-wrap; word-break: break-word; }
/* 深色 */
.tpl-mask.dark .tpl-modal { background: #0d2b1e; }
.tpl-mask.dark .tpl-header { background: #0f3d28; border-bottom-color: rgba(111,207,165,0.12); }
.tpl-mask.dark .tpl-header-title { color: #6fcfa5; }
.tpl-mask.dark .tpl-list { background: #0a2318; border-right-color: rgba(111,207,165,0.1); }
.tpl-mask.dark .tpl-item { background: rgba(15,61,40,0.5); }
.tpl-mask.dark .tpl-item:hover { background: rgba(15,61,40,0.8); }
.tpl-mask.dark .tpl-item.selected { background: rgba(15,61,40,0.95); }
.tpl-mask.dark .tpl-name { color: #c6f0dc; }
.tpl-mask.dark .tpl-desc { color: #3daf80; }
.tpl-mask.dark .preview-label { color: #6fcfa5; }
.tpl-mask.dark .preview-scroll { background: #071a12; border-color: rgba(111,207,165,0.12); }
.tpl-mask.dark .export-pdf-btn { background: rgba(111,207,165,0.1); border-color: rgba(111,207,165,0.3); color: #6fcfa5; }
</style>
