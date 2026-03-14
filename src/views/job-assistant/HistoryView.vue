<script setup>
import { ref } from 'vue'
import { useThemeStore } from '../../stores/theme'
import { useHistoryStore } from '../../stores/historyStore'

const themeStore = useThemeStore()
const historyStore = useHistoryStore()

const expandedId = ref(null)
const copyTips = ref({})

const typeLabel = { jd: 'JD分析', match: '简历匹配', polish: '定向润色' }
const typeClass = { jd: 'tag-jd', match: 'tag-match', polish: 'tag-polish' }

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatDate(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function handleDelete(id) {
  if (expandedId.value === id) expandedId.value = null
  historyStore.deleteRecord(id)
}

function handleClearAll() {
  expandedId.value = null
  historyStore.clearAll()
}

function resultText(result) {
  return typeof result === 'string' ? result : JSON.stringify(result, null, 2)
}

async function handleCopy(id, text) {
  try {
    await navigator.clipboard.writeText(text)
    copyTips.value[id] = '已复制'
  } catch {
    copyTips.value[id] = '复制失败'
  }
  setTimeout(() => { delete copyTips.value[id] }, 2000)
}
</script>

<template>
  <div class="page-content" :class="{ dark: themeStore.isDark }">
    <header class="page-header">
      <h1 class="page-title">历史记录</h1>
      <button
        v-if="historyStore.records.length"
        class="clear-btn"
        @click="handleClearAll"
      >清空全部</button>
    </header>
    <div class="page-body">
      <!-- 空状态 -->
      <div v-if="!historyStore.records.length" class="empty-state">
        <div class="empty-icon">◎</div>
        <p class="empty-title">暂无历史记录</p>
        <p class="empty-desc">使用 JD 分析、简历匹配或定向润色后，记录将自动保存在这里。</p>
      </div>

      <!-- 列表 -->
      <div v-else class="history-list">
        <div
          v-for="record in historyStore.records"
          :key="record.id"
          class="history-card"
          :class="{ expanded: expandedId === record.id }"
        >
          <!-- 卡片头部 -->
          <div class="card-head" @click="toggleExpand(record.id)">
            <div class="card-meta">
              <span class="type-tag" :class="typeClass[record.type]">{{ typeLabel[record.type] }}</span>
              <span class="card-title">{{ record.title }}</span>
            </div>
            <div class="card-right">
              <span class="card-date">{{ formatDate(record.createdAt) }}</span>
              <button class="delete-btn" @click.stop="handleDelete(record.id)">删除</button>
              <span class="expand-arrow" :class="{ open: expandedId === record.id }">&rsaquo;</span>
            </div>
          </div>

          <!-- 输入摘要 -->
          <p class="card-summary">{{ record.inputSummary }}</p>

          <!-- 展开详情 -->
          <div v-if="expandedId === record.id" class="card-detail">
            <div class="detail-section">
              <h4 class="detail-label">分析结果</h4>
              <pre class="detail-result">{{ resultText(record.result) }}</pre>
              <div class="copy-row">
                <span v-if="copyTips[record.id]" class="copy-tip">{{ copyTips[record.id] }}</span>
                <button class="copy-btn" @click="handleCopy(record.id, resultText(record.result))">一键复制</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #e6f7f1;
}

.page-header {
  height: 56px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #d0f0e4;
  border-bottom: 1px solid rgba(111,207,165,0.25);
  flex-shrink: 0;
}

.page-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #4a4658;
}

.clear-btn {
  height: 36px;
  padding: 0 18px;
  border: none;
  border-radius: 8px;
  background: #f9e5e5;
  color: #b91c1c;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.clear-btn:hover {
  background: #fecaca;
}

.page-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 空状态 */
.empty-state {
  max-width: 480px;
  margin: 80px auto;
  text-align: center;
  padding: 48px 32px;
  background: rgba(255,255,255,0.6);
  border-radius: 16px;
  border: 1px dashed rgba(111,207,165,0.3);
}

.empty-icon {
  font-size: 36px;
  color: #6fcfa5;
  margin-bottom: 16px;
}

.empty-title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 700;
  color: #14543a;
}

.empty-desc {
  margin: 0;
  font-size: 13px;
  color: #5aad87;
  line-height: 1.7;
}

/* 列表 */
.history-list {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  background: rgba(255,255,255,0.82);
  border-radius: 12px;
  border: 1px solid rgba(111,207,165,0.18);
  box-shadow: 0 2px 10px rgba(52,168,120,0.07);
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.history-card:hover {
  box-shadow: 0 4px 16px rgba(52,168,120,0.13);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 0;
  cursor: pointer;
  gap: 12px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.type-tag {
  flex-shrink: 0;
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.tag-jd { background: rgba(111,207,165,0.18); color: #1e6647; border: 1px solid rgba(111,207,165,0.3); }
.tag-match { background: rgba(52,168,120,0.15); color: #0d3d27; border: 1px solid rgba(52,168,120,0.3); }
.tag-polish { background: rgba(61,175,128,0.15); color: #14543a; border: 1px solid rgba(61,175,128,0.3); }

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a4d38;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.card-date {
  font-size: 12px;
  color: #5aad87;
  white-space: nowrap;
}

.delete-btn {
  height: 28px;
  padding: 0 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #b91c1c;
  font-size: 12px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s, background 0.15s;
}

.delete-btn:hover {
  opacity: 1;
  background: #fef2f2;
}

.expand-arrow {
  font-size: 22px;
  color: #5aad87;
  display: inline-block;
  transition: transform 0.2s;
  line-height: 1;
  user-select: none;
}

.expand-arrow.open {
  transform: rotate(90deg);
}

.card-summary {
  margin: 8px 18px 14px;
  font-size: 13px;
  color: #2e7a58;
  line-height: 1.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-detail {
  border-top: 1px solid rgba(111,207,165,0.15);
  padding: 16px 18px 18px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-label {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #1a4d38;
}

.detail-result {
  margin: 0;
  padding: 14px 16px;
  background: rgba(184,232,213,0.3);
  border: 1px solid rgba(111,207,165,0.2);
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.75;
  color: #1a4d38;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  max-height: 320px;
  overflow-y: auto;
}

.copy-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.copy-tip {
  font-size: 13px;
  color: #2e7a58;
}

.copy-btn {
  height: 32px;
  padding: 0 16px;
  border: 1px solid rgba(111,207,165,0.4);
  border-radius: 8px;
  background: rgba(111,207,165,0.18);
  backdrop-filter: blur(8px);
  color: #14543a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
}

.copy-btn:hover {
  background: rgba(111,207,165,0.32);
  border-color: rgba(111,207,165,0.65);
}

/* 深色模式 */
.page-content.dark { background: #0d2b1e; }
.page-content.dark .page-header { background: #0f3d28; border-bottom-color: rgba(111,207,165,0.12); }
.page-content.dark .page-title { color: #6fcfa5; }
.page-content.dark .empty-state { background: rgba(15,61,40,0.4); border-color: rgba(111,207,165,0.15); }
.page-content.dark .empty-icon { color: #3daf80; }
.page-content.dark .empty-title { color: #c6f0dc; }
.page-content.dark .empty-desc { color: #5aad87; }
.page-content.dark .history-card { background: rgba(15,61,40,0.65); border-color: rgba(111,207,165,0.15); box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
.page-content.dark .history-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
.page-content.dark .card-title { color: #c6f0dc; }
.page-content.dark .card-date { color: #3daf80; }
.page-content.dark .card-summary { color: #5aad87; }
.page-content.dark .expand-arrow { color: #3daf80; }
.page-content.dark .card-detail { border-top-color: rgba(111,207,165,0.1); }
.page-content.dark .detail-label { color: #c6f0dc; }
.page-content.dark .detail-result { background: rgba(13,43,30,0.6); border-color: rgba(111,207,165,0.1); color: #6fcfa5; }
.page-content.dark .copy-tip { color: #6fcfa5; }
.page-content.dark .copy-btn { background: rgba(111,207,165,0.1); border-color: rgba(111,207,165,0.3); color: #6fcfa5; }
.page-content.dark .copy-btn:hover { background: rgba(111,207,165,0.18); border-color: rgba(111,207,165,0.5); }
.page-content.dark .tag-jd { background: rgba(111,207,165,0.1); color: #6fcfa5; border-color: rgba(111,207,165,0.2); }
.page-content.dark .tag-match { background: rgba(52,168,120,0.1); color: #4dbd92; border-color: rgba(52,168,120,0.2); }
.page-content.dark .tag-polish { background: rgba(61,175,128,0.1); color: #6fcfa5; border-color: rgba(61,175,128,0.2); }
.page-content.dark .clear-btn { background: rgba(127,29,29,0.3); color: #fca5a5; }
.page-content.dark .clear-btn:hover { background: rgba(127,29,29,0.5); }
.page-content.dark .empty-state { background: rgba(74,73,97,0.5); border-color: rgba(255,255,255,0.1); }
.page-content.dark .empty-title { color: #f4f1f6; }
.page-content.dark .empty-desc { color: #b1b7c3; }
.page-content.dark .history-card { background: #4a4961; box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
.page-content.dark .history-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
.page-content.dark .card-title { color: #f4f1f6; }
.page-content.dark .card-summary { color: #b1b7c3; }
.page-content.dark .card-date { color: #7a7a96; }
.page-content.dark .delete-btn { color: #fca5a5; }
.page-content.dark .delete-btn:hover { background: rgba(127,29,29,0.3); }
.page-content.dark .expand-arrow { color: #7a7a96; }
.page-content.dark .card-detail { border-top-color: rgba(255,255,255,0.08); }
.page-content.dark .detail-label { color: #f4f1f6; }
.page-content.dark .detail-result { background: #38384d; color: #d7d2dc; }
.page-content.dark .copy-tip { color: #b1b7c3; }
.page-content.dark .copy-btn { background: #8e88a2; }
.page-content.dark .copy-btn:hover { background: #9c96b0; }
</style>
