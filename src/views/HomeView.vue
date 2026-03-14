<script setup>
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const themeStore = useThemeStore()

function goChat() {
  router.push('/chat')
}

function goJobAssistant() {
  router.push('/jd-analysis')
}
</script>

<template>
  <div class="home-page" :class="{ dark: themeStore.isDark }">
    <div class="home-card">
      <h1 class="home-title">AI 求职助手</h1>
      <p class="home-desc">
        智能分析 JD、匹配简历、定向润色，全面助力求职
      </p>
      <div class="home-tags">
        <span>智能聊天</span>
        <span>JD 分析</span>
        <span>简历匹配</span>
        <span>定向润色</span>
        <span>求职诊断</span>
      </div>
      <div class="home-buttons">
        <button class="enter-btn" @click="goChat">开始聊天</button>
        <button class="enter-btn job-btn" @click="goJobAssistant">进入求职助手</button>
      </div>
      <p class="home-notice">提示：当前为测试版。首次分析可能稍慢，因后端服务冷启动；请勿输入身份证号、手机号、家庭住址等敏感个人信息。</p>
    </div>
  </div>
</template>

<style scoped>
/* ── 浅色：#6FCFA5 薄荷绿色系 ── */
.home-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6f7f1 0%, #b8e8d5 60%, #9ddec6 100%);
  padding: 24px;
  box-sizing: border-box;
}

.home-card {
  width: 100%;
  max-width: 720px;
  padding: 52px 44px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(111, 207, 165, 0.25);
  box-shadow: 0 20px 60px rgba(52, 168, 120, 0.13);
  text-align: center;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.home-title {
  margin: 0 0 18px;
  font-size: 40px;
  font-weight: 800;
  color: #1a4d38;
  letter-spacing: -0.01em;
}

.home-desc {
  margin: 0;
  font-size: 17px;
  line-height: 1.85;
  color: #2e7a58;
}

.home-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin: 28px 0 38px;
}

.home-tags span {
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(111, 207, 165, 0.18);
  border: 1px solid rgba(111, 207, 165, 0.4);
  color: #1e6647;
  font-size: 13px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.home-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

/* 磨砂玻璃按钮 */
.enter-btn {
  min-width: 160px;
  height: 50px;
  padding: 0 32px;
  border: 1px solid rgba(111, 207, 165, 0.5);
  border-radius: 14px;
  background: rgba(111, 207, 165, 0.22);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #14543a;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.enter-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.06) 100%);
  pointer-events: none;
}

.enter-btn:hover {
  background: rgba(111, 207, 165, 0.38);
  border-color: rgba(111, 207, 165, 0.75);
  box-shadow: 0 6px 20px rgba(52, 168, 120, 0.22);
  transform: translateY(-2px);
}

.enter-btn:active {
  transform: translateY(0);
}

.job-btn {
  background: rgba(52, 168, 120, 0.28);
  border-color: rgba(52, 168, 120, 0.55);
  color: #0d3d27;
}

.job-btn:hover {
  background: rgba(52, 168, 120, 0.42);
  border-color: rgba(52, 168, 120, 0.8);
  box-shadow: 0 6px 20px rgba(52, 168, 120, 0.28);
}

/* ── 深色：深绿蓝色系 ── */
.home-page.dark {
  background: linear-gradient(135deg, #0d2b1e 0%, #0a2318 50%, #071a12 100%);
}

.home-page.dark .home-card {
  background: rgba(18, 52, 36, 0.72);
  border-color: rgba(111, 207, 165, 0.15);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.home-page.dark .home-title {
  color: #6fcfa5;
}

.home-page.dark .home-desc {
  color: #5aad87;
}

.home-page.dark .home-tags span {
  background: rgba(111, 207, 165, 0.1);
  border-color: rgba(111, 207, 165, 0.2);
  color: #6fcfa5;
}

.home-page.dark .enter-btn {
  background: rgba(111, 207, 165, 0.1);
  border-color: rgba(111, 207, 165, 0.25);
  color: #6fcfa5;
}

.home-page.dark .enter-btn:hover {
  background: rgba(111, 207, 165, 0.18);
  border-color: rgba(111, 207, 165, 0.45);
  box-shadow: 0 6px 20px rgba(111, 207, 165, 0.12);
}

.home-page.dark .job-btn {
  background: rgba(52, 168, 120, 0.15);
  border-color: rgba(52, 168, 120, 0.3);
  color: #4dbd92;
}

.home-page.dark .job-btn:hover {
  background: rgba(52, 168, 120, 0.25);
  border-color: rgba(52, 168, 120, 0.5);
}

.home-notice {
  margin: 24px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: #7abf9e;
  text-align: center;
}

.home-page.dark .home-notice {
  color: #3d7a5e;
}
</style>
