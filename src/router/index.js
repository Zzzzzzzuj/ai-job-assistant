import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ChatView from '../views/ChatView.vue'
import JobAssistantLayout from '../views/job-assistant/JobAssistantLayout.vue'
import JdAnalysisView from '../views/job-assistant/JdAnalysisView.vue'
import ResumeMatchView from '../views/job-assistant/ResumeMatchView.vue'
import ResumePolishView from '../views/job-assistant/ResumePolishView.vue'
import HistoryView from '../views/job-assistant/HistoryView.vue'
import DiagnoseView from '../views/job-assistant/DiagnoseView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/chat', name: 'chat', component: ChatView },
    {
      path: '/jd-analysis',
      component: JobAssistantLayout,
      children: [{ path: '', name: 'jd-analysis', component: JdAnalysisView }],
    },
    {
      path: '/resume-match',
      component: JobAssistantLayout,
      children: [{ path: '', name: 'resume-match', component: ResumeMatchView }],
    },
    {
      path: '/resume-polish',
      component: JobAssistantLayout,
      children: [{ path: '', name: 'resume-polish', component: ResumePolishView }],
    },
    {
      path: '/diagnose',
      component: JobAssistantLayout,
      children: [{ path: '', name: 'diagnose', component: DiagnoseView }],
    },
    {
      path: '/history',
      component: JobAssistantLayout,
      children: [{ path: '', name: 'history', component: HistoryView }],
    },
  ],
})

export default router
