<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { useChatStore } from '../stores/chat'
import { useThemeStore } from '../stores/theme'
import { renderMarkdown } from '../utils/markdown'
import { searchChatRecords } from '../api/search'
import { useSpeechRecognition } from '../composables/useSpeechRecognition'

const chatStore = useChatStore()
const themeStore = useThemeStore()
const router = useRouter()
const inputValue = ref('')
const { isRecording, speechSupported, speechStatus, speechText, initSpeechRecognition, toggleSpeechRecognition, resetSpeechText } = useSpeechRecognition()
const messageListRef = ref(null)
const searchKeyword = ref('')
const searchResults = ref([])
const showSearchDialog = ref(false)
const virtualMessages = computed(() => chatStore.currentSession?.messages || [])

async function handleSend() {
  const value = inputValue.value.trim()
  if (!value || chatStore.isGenerating) return
  inputValue.value = ''
  resetSpeechText()
  await chatStore.sendMessage(value)
  await nextTick()
  scrollToBottom()
}
function scrollToBottom() {
  const el = messageListRef.value
  if (!el) return
  requestAnimationFrame(() => {
    const sc = el.querySelector('.vue-recycle-scroller') || el
    sc.scrollTop = sc.scrollHeight
  })
}
watch(() => chatStore.currentSessionId, async () => { await nextTick(); scrollToBottom() })
watch(() => chatStore.currentSession?.messages.length, async () => { await nextTick(); scrollToBottom() })
watch(() => chatStore.currentSession?.messages.at(-1)?.content, async () => { await nextTick(); scrollToBottom() })
watch(searchKeyword, async (v) => {
  if (!showSearchDialog.value) return
  const kw = v.trim()
  searchResults.value = kw ? await searchChatRecords(kw, chatStore.sessions) : []
})
watch(speechText, (v) => { if (v) inputValue.value = v })
watch(speechStatus, (v) => {
  if (v === 'error') alert('语音识别失败，请检查麦克风权限')
  if (v === 'unsupported') console.warn('当前浏览器不支持语音识别')
})
onMounted(async () => { initSpeechRecognition(); await nextTick(); scrollToBottom() })
async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.includes('text') && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) { alert('目前只支持 .txt 和 .md 文件'); return }
  chatStore.setUploadedFile(file.name, await file.text())
}
function openSearchDialog() { showSearchDialog.value = true }
function closeSearchDialog() { showSearchDialog.value = false; searchKeyword.value = ''; searchResults.value = [] }
async function handleSearch() {
  const kw = searchKeyword.value.trim()
  searchResults.value = kw ? await searchChatRecords(kw, chatStore.sessions) : []
}
function handleSelectSearchResult(id) { chatStore.switchSession(id); closeSearchDialog() }
function escapeHtml(t) { return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;') }
function highlightKeyword(text, kw) {
  const s = escapeHtml(text)
  if (!kw) return s
  return s.replace(new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'), '<strong>$1</strong>')
}
</script>

<template>
  <div class="page-shell">
    <div class="chat-page" :class="{ dark: themeStore.isDark }">
      <div class="sidebar">
        <!-- 1. 大标题区域 -->
        <div class="sidebar-header">
          <span class="sidebar-title">AI Chat</span>
        </div>
        <!-- 2. 导航按钮区 -->
        <div class="sidebar-nav">
          <button class="switch-btn" @click="router.push('/')">← 首页</button>
          <button class="switch-btn job-btn" @click="router.push('/jd-analysis')">求职助手</button>
          <button class="switch-btn theme-toggle-btn" @click="themeStore.toggleTheme">{{ themeStore.isDark ? '☀️' : '🌙' }}</button>
        </div>
        <!-- 3. 对话列表 -->
        <div class="sidebar-search-row">
          <span class="session-label">对话列表</span>
          <span class="new-chat-btn" @click="chatStore.createSession">+ 新对话</span>
          <span class="open-search-btn" @click="openSearchDialog">搜索</span>
        </div>
        <div class="session-list">
          <div v-for="item in chatStore.sessions" :key="item.id" class="session-item" :class="{ active: item.id === chatStore.currentSessionId }" @click="chatStore.switchSession(item.id)">
            <span class="session-title">{{ item.title }}</span>
            <span class="delete-btn" @click.stop="chatStore.deleteSession(item.id)">×</span>
          </div>
        </div>
      </div>
      <div class="main">
        <div class="main-header"><span>AI Chat</span></div>
        <div v-if="speechSupported" class="speech-status-bar">
          <span v-if="speechStatus==='recording'">正在录音...</span>
          <span v-else-if="speechStatus==='recognizing'">正在识别语音...</span>
          <span v-else-if="speechStatus==='error'">语音识别失败，请检查麦克风权限</span>
          <span v-else>可以使用语音输入</span>
        </div>
        <div ref="messageListRef" class="message-list">
          <template v-if="virtualMessages.length">
            <DynamicScroller class="dynamic-scroller" :items="virtualMessages" :min-item-size="80" key-field="id">
              <template #default="{ item, index, active }">
                <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.content,item.isError]" :data-index="index">
                  <div class="message-row" :class="item.role==='user'?'user-row':'ai-row'">
                    <div class="message" :class="item.role==='user'?'user-message':'ai-message'">
                      <div v-if="item.role==='user'">{{ item.content }}</div>
                      <template v-else>
                        <div v-html="renderMarkdown(item.content)"></div>
                        <button v-if="item.isError" class="retry-btn" @click="chatStore.retryLastMessage">重试</button>
                      </template>
                    </div>
                  </div>
                </DynamicScrollerItem>
              </template>
            </DynamicScroller>
          </template>
          <div v-else class="empty-text">开始你的第一条消息吧～</div>
        </div>
        <div class="input-area">
          <label class="upload-btn">上传文件<input type="file" hidden @change="handleFileChange" /></label>
          <div v-if="chatStore.uploadedFileName" class="file-tag">{{ chatStore.uploadedFileName }}<span class="remove-file" @click="chatStore.clearUploadedFile">×</span></div>
          <button v-if="speechSupported" class="speech-btn" :class="{recording:isRecording}" @click="toggleSpeechRecognition">{{ isRecording?'🎙️ 识别中':'🎤 语音' }}</button>
          <input v-model="inputValue" class="chat-input" type="text" :placeholder="isRecording?'正在识别语音...':'请输入内容...'" :disabled="chatStore.isGenerating" @keydown.enter="handleSend" />
          <button class="send-btn" :disabled="chatStore.isGenerating" @click="handleSend">{{ chatStore.isGenerating?'生成中...':'发送' }}</button>
        </div>
      </div>
    </div>
    <div v-if="showSearchDialog" class="search-dialog-mask" :class="{dark:themeStore.isDark}" @click="closeSearchDialog">
      <div class="search-dialog" @click.stop>
        <div class="search-dialog-header"><span>搜索对话</span><span class="search-dialog-close" @click="closeSearchDialog">×</span></div>
        <div class="search-dialog-body">
          <div class="search-dialog-input-wrap">
            <input v-model="searchKeyword" class="search-dialog-input" type="text" placeholder="输入关键词搜索" @keydown.enter="handleSearch" />
            <button class="search-dialog-btn" @click="handleSearch">搜索</button>
          </div>
          <div v-if="searchKeyword&&!searchResults.length" class="search-empty">未找到相关聊天记录</div>
          <div v-if="searchResults.length" class="search-dialog-result-list">
            <div v-for="item in searchResults" :key="item.sessionId" class="search-dialog-result-item" @click="handleSelectSearchResult(item.sessionId)">
              <div class="search-dialog-result-title" v-html="highlightKeyword(item.sessionTitle,searchKeyword)"></div>
              <div class="search-dialog-result-preview" v-html="highlightKeyword(item.preview,searchKeyword)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-shell { width: 100%; height: 100vh; background: #071a12; }
.chat-page { display: flex; width: 100%; height: 100vh; background: #e6f7f1; color: #1a4d38; }
.sidebar { width: 260px; background: #b8e8d5; display: flex; flex-direction: column; border-right: 1px solid rgba(111,207,165,0.25); }
.sidebar-header { height: 68px; padding: 0 18px; display: flex; align-items: center; box-sizing: border-box; border-bottom: 1px solid rgba(111,207,165,0.2); flex-shrink: 0; }
.sidebar-title { font-size: 16px; font-weight: 700; color: #14543a; letter-spacing: 0.01em; }
.sidebar-nav { height: 48px; padding: 0 10px; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid rgba(111,207,165,0.15); flex-shrink: 0; }
.switch-btn { flex: 1; height: 28px; border: 1px solid rgba(111,207,165,0.4); border-radius: 7px; background: rgba(111,207,165,0.15); backdrop-filter: blur(8px); color: #1e6647; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; padding: 0 4px; min-width: 0; font-family: inherit; }
.switch-btn:hover { background: rgba(111,207,165,0.28); border-color: rgba(111,207,165,0.65); }
.switch-btn:hover { background: rgba(111,207,165,0.28); border-color: rgba(111,207,165,0.65); }
.job-btn { background: rgba(52,168,120,0.2); border-color: rgba(52,168,120,0.45); color: #0d3d27; }
.job-btn:hover { background: rgba(52,168,120,0.35); }
.theme-toggle-btn { flex: 0 0 28px; min-width: 28px; font-size: 13px; }
.sidebar-search-row { height: 36px; padding: 0 14px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(111,207,165,0.15); flex-shrink: 0; }
.session-label { font-size: 11px; color: #5aad87; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; flex: 1; }
.new-chat-btn { font-size: 12px; font-weight: 700; cursor: pointer; color: #14543a; white-space: nowrap; }
.new-chat-btn:hover { color: #0d3d27; }
.open-search-btn { font-size: 12px; cursor: pointer; color: #1e6647; opacity: 0.8; white-space: nowrap; }
.open-search-btn:hover { opacity: 1; }
.session-list { flex: 1; padding: 8px 12px 12px; overflow-y: auto; }
.session-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; cursor: pointer; margin-bottom: 6px; color: #1a4d38; transition: all 0.18s; }
.session-item:hover { background: rgba(111,207,165,0.2); }
.session-item.active { background: linear-gradient(135deg,#6fcfa5,#3daf80); color: #fff; box-shadow: 0 2px 8px rgba(52,168,120,0.25); }
.session-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.delete-btn { margin-left: 8px; color: #5aad87; font-size: 18px; line-height: 1; cursor: pointer; }
.delete-btn:hover { color: #ef4444; }
.main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.main-header { height: 56px; padding: 0 24px; font-size: 16px; font-weight: 700; background: #d0f0e4; color: #14543a; display: flex; align-items: center; border-bottom: 1px solid rgba(111,207,165,0.25); letter-spacing: 0.01em; }
.speech-status-bar { min-height: 34px; padding: 7px 20px 0; background: #d0f0e4; color: #1e6647; font-size: 13px; font-weight: 500; }
.message-list { flex: 1; padding: 20px; overflow-y: auto; background: #e6f7f1; min-height: 0; }
.dynamic-scroller { height: 100%; min-height: 0; }
.dynamic-scroller :deep(.vue-recycle-scroller__item-wrapper) { min-height: 100%; }
.message-row { display: flex; margin-bottom: 16px; width: 100%; }
.user-row { justify-content: flex-end; }
.ai-row { justify-content: flex-start; }
.message { width: fit-content; max-width: 75%; padding: 12px 16px; border-radius: 14px; line-height: 1.65; word-break: break-word; white-space: pre-wrap; box-sizing: border-box; }
.user-message { margin-left: auto; background: linear-gradient(135deg,#6fcfa5,#3daf80); color: #fff; }
.ai-message { margin-right: auto; background: rgba(255,255,255,0.78); color: #1a4d38; border: 1px solid rgba(111,207,165,0.2); backdrop-filter: blur(6px); }
.ai-message :deep(p) { margin: 0; }
.ai-message :deep(ul), .ai-message :deep(ol) { margin: 6px 0 0; padding-left: 18px; }
.ai-message :deep(li) { margin: 2px 0; }
.ai-message :deep(pre) { margin: 6px 0 0; overflow-x: auto; }
.retry-btn { margin-top: 10px; padding: 6px 12px; border: none; border-radius: 8px; background: rgba(111,207,165,0.3); color: #14543a; cursor: pointer; font-size: 13px; }
.retry-btn:hover { background: rgba(111,207,165,0.5); }
.empty-text { color: #5aad87; text-align: center; margin-top: 120px; font-size: 14px; }
.input-area { display: flex; gap: 10px; padding: 14px 18px; background: #d0f0e4; align-items: center; flex-wrap: wrap; border-top: 1px solid rgba(111,207,165,0.25); }
.chat-input { flex: 1; min-width: 200px; height: 44px; padding: 0 14px; border: 1.5px solid rgba(111,207,165,0.3); border-radius: 12px; outline: none; background: rgba(255,255,255,0.7); color: #1a4d38; font-size: 14px; transition: border-color 0.18s, box-shadow 0.18s; }
.chat-input::placeholder { color: #5aad87; }
.chat-input:focus { border-color: rgba(111,207,165,0.6); box-shadow: 0 0 0 3px rgba(111,207,165,0.12); }
.chat-input:disabled { opacity: 0.6; cursor: not-allowed; }
.send-btn { height: 44px; padding: 0 22px; border: 1px solid rgba(111,207,165,0.45); border-radius: 12px; background: rgba(111,207,165,0.22); backdrop-filter: blur(10px); color: #14543a; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.18s; }
.send-btn:hover:not(:disabled) { background: rgba(111,207,165,0.38); box-shadow: 0 3px 12px rgba(52,168,120,0.2); }
.send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.speech-btn { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 14px; border: 1px solid rgba(111,207,165,0.35); border-radius: 12px; background: rgba(111,207,165,0.15); color: #1e6647; cursor: pointer; white-space: nowrap; transition: all 0.18s; }
.speech-btn:hover { background: rgba(111,207,165,0.28); }
.speech-btn.recording { background: rgba(52,168,120,0.3); color: #0d3d27; }
.upload-btn { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 14px; border: 1px solid rgba(111,207,165,0.35); border-radius: 12px; background: rgba(111,207,165,0.15); color: #1e6647; cursor: pointer; white-space: nowrap; font-size: 13px; }
.upload-btn:hover { background: rgba(111,207,165,0.28); }
.file-tag { display: flex; align-items: center; gap: 6px; padding: 0 12px; height: 44px; border-radius: 12px; background: rgba(111,207,165,0.18); color: #1a4d38; white-space: nowrap; font-size: 13px; }
.remove-file { cursor: pointer; font-size: 18px; line-height: 1; color: #5aad87; }
.remove-file:hover { color: #ef4444; }
.search-dialog-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: flex-start; justify-content: center; padding-top: 80px; z-index: 999; }
.search-dialog { width: 620px; max-width: 92vw; border-radius: 18px; overflow: hidden; background: #e6f7f1; color: #1a4d38; box-shadow: 0 12px 40px rgba(0,0,0,0.15); border: 1px solid rgba(111,207,165,0.3); }
.search-dialog-header { height: 54px; padding: 0 18px; display: flex; align-items: center; justify-content: space-between; font-size: 15px; font-weight: 700; background: #b8e8d5; border-bottom: 1px solid rgba(111,207,165,0.25); }
.search-dialog-close { font-size: 22px; cursor: pointer; line-height: 1; color: #5aad87; }
.search-dialog-close:hover { color: #1a4d38; }
.search-dialog-body { padding: 16px; }
.search-dialog-input-wrap { display: flex; gap: 10px; margin-bottom: 14px; }
.search-dialog-input { flex: 1; height: 42px; padding: 0 14px; border: 1.5px solid rgba(111,207,165,0.3); border-radius: 10px; outline: none; background: rgba(255,255,255,0.7); color: #1a4d38; }
.search-dialog-input::placeholder { color: #5aad87; }
.search-dialog-input:focus { border-color: rgba(111,207,165,0.6); }
.search-dialog-btn { height: 42px; padding: 0 18px; border: 1px solid rgba(111,207,165,0.4); border-radius: 10px; background: rgba(111,207,165,0.2); color: #14543a; font-weight: 600; cursor: pointer; }
.search-dialog-btn:hover { background: rgba(111,207,165,0.35); }
.search-dialog-result-list { max-height: 380px; overflow-y: auto; }
.search-dialog-result-item { padding: 12px 14px; border-radius: 12px; margin-bottom: 8px; cursor: pointer; background: rgba(111,207,165,0.12); border: 1px solid rgba(111,207,165,0.2); transition: background 0.15s; }
.search-dialog-result-item:hover { background: rgba(111,207,165,0.22); }
.search-dialog-result-title { font-size: 14px; font-weight: 700; margin-bottom: 5px; color: #1a4d38; }
.search-dialog-result-preview { font-size: 13px; line-height: 1.5; color: #2e7a58; }
.search-empty { padding: 14px 4px 6px; font-size: 14px; color: #5aad87; }
.search-dialog-result-title :deep(strong), .search-dialog-result-preview :deep(strong) { color: #0d3d27; font-weight: 800; }
.chat-page.dark { background: #0d2b1e; color: #c6f0dc; }
.chat-page.dark .sidebar { background: #0f3d28; border-right-color: rgba(111,207,165,0.12); }
.chat-page.dark .sidebar-header { border-bottom-color: rgba(111,207,165,0.1); }
.chat-page.dark .sidebar-title { color: #6fcfa5; }
.chat-page.dark .sidebar-nav { border-bottom-color: rgba(111,207,165,0.08); }
.chat-page.dark .switch-btn { background: rgba(111,207,165,0.08); border-color: rgba(111,207,165,0.2); color: #6fcfa5; }
.chat-page.dark .switch-btn:hover { background: rgba(111,207,165,0.15); }
.chat-page.dark .job-btn { background: rgba(52,168,120,0.1); border-color: rgba(52,168,120,0.25); color: #4dbd92; }
.chat-page.dark .theme-toggle-btn { color: #6fcfa5; }
.chat-page.dark .sidebar-search-row { border-bottom-color: rgba(111,207,165,0.08); }
.chat-page.dark .session-label { color: #3daf80; }
.chat-page.dark .new-chat-btn { color: #6fcfa5; }
.chat-page.dark .open-search-btn { color: #5aad87; }
.chat-page.dark .session-item { color: #5aad87; }
.chat-page.dark .session-item:hover { background: rgba(111,207,165,0.1); }
.chat-page.dark .session-item.active { background: linear-gradient(135deg,#1e6647,#14543a); color: #6fcfa5; }
.chat-page.dark .delete-btn { color: #2e7a58; }
.chat-page.dark .main-header { background: #0f3d28; color: #6fcfa5; border-bottom-color: rgba(111,207,165,0.1); }
.chat-page.dark .speech-status-bar { background: #0f3d28; color: #5aad87; }
.chat-page.dark .message-list { background: #0d2b1e; }
.chat-page.dark .user-message { background: linear-gradient(135deg,#1e6647,#14543a); color: #c6f0dc; }
.chat-page.dark .ai-message { background: rgba(15,61,40,0.7); color: #c6f0dc; border-color: rgba(111,207,165,0.12); }
.chat-page.dark .empty-text { color: #2e7a58; }
.chat-page.dark .input-area { background: #0f3d28; border-top-color: rgba(111,207,165,0.1); }
.chat-page.dark .chat-input { background: rgba(13,43,30,0.8); border-color: rgba(111,207,165,0.2); color: #c6f0dc; }
.chat-page.dark .chat-input::placeholder { color: #2e7a58; }
.chat-page.dark .chat-input:focus { border-color: rgba(111,207,165,0.45); box-shadow: 0 0 0 3px rgba(111,207,165,0.08); }
.chat-page.dark .send-btn { background: rgba(111,207,165,0.1); border-color: rgba(111,207,165,0.25); color: #6fcfa5; }
.chat-page.dark .send-btn:hover:not(:disabled) { background: rgba(111,207,165,0.18); }
.chat-page.dark .speech-btn { background: rgba(111,207,165,0.08); border-color: rgba(111,207,165,0.2); color: #5aad87; }
.chat-page.dark .speech-btn.recording { background: rgba(52,168,120,0.2); color: #6fcfa5; }
.chat-page.dark .upload-btn { background: rgba(111,207,165,0.08); border-color: rgba(111,207,165,0.2); color: #5aad87; }
.chat-page.dark .file-tag { background: rgba(111,207,165,0.1); color: #6fcfa5; }
.chat-page.dark .remove-file { color: #2e7a58; }
.chat-page.dark .retry-btn { background: rgba(111,207,165,0.15); color: #6fcfa5; }
.search-dialog-mask.dark .search-dialog { background: #0f3d28; color: #c6f0dc; border-color: rgba(111,207,165,0.15); }
.search-dialog-mask.dark .search-dialog-header { background: #1a4d38; color: #6fcfa5; border-bottom-color: rgba(111,207,165,0.15); }
.search-dialog-mask.dark .search-dialog-close { color: #5aad87; }
.search-dialog-mask.dark .search-dialog-input { background: rgba(13,43,30,0.8); border-color: rgba(111,207,165,0.2); color: #c6f0dc; }
.search-dialog-mask.dark .search-dialog-input::placeholder { color: #2e7a58; }
.search-dialog-mask.dark .search-dialog-btn { background: rgba(111,207,165,0.12); border-color: rgba(111,207,165,0.25); color: #6fcfa5; }
.search-dialog-mask.dark .search-dialog-result-item { background: rgba(111,207,165,0.07); border-color: rgba(111,207,165,0.12); color: #c6f0dc; }
.search-dialog-mask.dark .search-dialog-result-item:hover { background: rgba(111,207,165,0.13); }
.search-dialog-mask.dark .search-dialog-result-title { color: #6fcfa5; }
.search-dialog-mask.dark .search-dialog-result-preview { color: #5aad87; }
.search-dialog-mask.dark .search-empty { color: #5aad87; }
.search-dialog-mask.dark .search-dialog-result-title :deep(strong), .search-dialog-mask.dark .search-dialog-result-preview :deep(strong) { color: #c6f0dc; }
</style>
