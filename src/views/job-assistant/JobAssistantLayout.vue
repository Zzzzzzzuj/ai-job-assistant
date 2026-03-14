<script setup>
import { useThemeStore } from '../../stores/theme'
import { RouterLink, RouterView } from 'vue-router'

const themeStore = useThemeStore()

const navItems = [
  { path: '/jd-analysis', label: 'JD 分析' },
  { path: '/resume-match', label: '简历匹配分析' },
  { path: '/resume-polish', label: '定向润色' },
  { path: '/diagnose', label: '深度诊断分析' },
  { path: '/history', label: '历史记录' },
]
</script>

<template>
  <div class="job-assistant-page" :class="{ dark: themeStore.isDark }">
    <aside class="sidebar">
      <!-- 1. 大标题区域，高度与聊天页 sidebar-header 对齐 -->
      <div class="sidebar-header">
        <span class="sidebar-title">AI 求职助手</span>
      </div>
      <!-- 2. 导航按钮区：返回首页 / 聊天 / 主题切换 -->
      <div class="sidebar-nav">
        <RouterLink to="/" class="nav-link">← 首页</RouterLink>
        <RouterLink to="/chat" class="nav-link"> 聊天</RouterLink>
        <button class="theme-btn" @click="themeStore.toggleTheme">{{ themeStore.isDark ? '☀️' : '🌙' }}</button>
      </div>
      <!-- 3. 功能菜单 -->
      <nav class="nav-list">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          active-class="active"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.job-assistant-page { display: flex; width: 100%; min-height: 100vh; background: #e6f7f1; color: #1a4d38; }

.sidebar { width: 260px; background: #b8e8d5; display: flex; flex-direction: column; flex-shrink: 0; border-right: 1px solid rgba(111,207,165,0.25); }

/* 1. 大标题区域 — 高度与聊天页 sidebar-header (68px) 完全一致 */
.sidebar-header {
  height: 68px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(111,207,165,0.2);
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a4d38;
  letter-spacing: 0.01em;
}

/* 2. 导航按钮区 */
.sidebar-nav {
  height: 48px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid rgba(111,207,165,0.15);
  flex-shrink: 0;
}

.nav-link {
  flex: 1;
  height: 28px;
  font-size: 13px;
  font-weight: 600;
  color: #1e6647;
  text-decoration: none;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  border: 1px solid rgba(111,207,165,0.4);
  background: rgba(111,207,165,0.15);
  backdrop-filter: blur(8px);
  transition: all 0.18s;
  white-space: nowrap;
}
.nav-link:hover { background: rgba(111,207,165,0.3); border-color: rgba(111,207,165,0.65); }

.theme-btn {
  flex: 0 0 28px;
  height: 28px;
  padding: 0;
  border: 1px solid rgba(111,207,165,0.4);
  border-radius: 7px;
  background: rgba(111,207,165,0.15);
  backdrop-filter: blur(8px);
  color: #1e6647;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.18s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.theme-btn:hover { background: rgba(111,207,165,0.3); }

/* 3. 功能菜单 */
.nav-list {
  flex: 1;
  padding: 10px 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-item {
  display: block;
  padding: 11px 14px;
  border-radius: 10px;
  color: #1e6647;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.18s;
}
.nav-item:hover { background: rgba(111,207,165,0.2); color: #14543a; }
.nav-item.active { background: linear-gradient(135deg,#6fcfa5,#3daf80); color: #fff; box-shadow: 0 2px 10px rgba(52,168,120,0.28); }

.main { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #e6f7f1; }

/* 深色模式 */
.job-assistant-page.dark { background: #0d2b1e; color: #c6f0dc; }
.job-assistant-page.dark .sidebar { background: #0f3d28; border-right-color: rgba(111,207,165,0.12); }
.job-assistant-page.dark .sidebar-header { border-bottom-color: rgba(111,207,165,0.1); }
.job-assistant-page.dark .sidebar-title { color: #6fcfa5; }
.job-assistant-page.dark .sidebar-nav { border-bottom-color: rgba(111,207,165,0.08); }
.job-assistant-page.dark .nav-link { color: #6fcfa5; border-color: rgba(111,207,165,0.25); background: rgba(111,207,165,0.08); }
.job-assistant-page.dark .nav-link:hover { background: rgba(111,207,165,0.16); border-color: rgba(111,207,165,0.4); }
.job-assistant-page.dark .theme-btn { background: rgba(111,207,165,0.08); border-color: rgba(111,207,165,0.25); color: #6fcfa5; }
.job-assistant-page.dark .theme-btn:hover { background: rgba(111,207,165,0.16); }
.job-assistant-page.dark .nav-item { color: #5aad87; }
.job-assistant-page.dark .nav-item:hover { background: rgba(111,207,165,0.1); color: #6fcfa5; }
.job-assistant-page.dark .nav-item.active { background: linear-gradient(135deg,#1e6647,#14543a); color: #6fcfa5; box-shadow: 0 2px 10px rgba(30,102,71,0.4); }
.job-assistant-page.dark .main { background: #0d2b1e; }
</style>
