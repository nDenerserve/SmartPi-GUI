import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
// import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/dashboard/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/energychart/',
      name: 'energychart',
      component: () => import('../views/EnergychartView.vue')
    },
    {
      path: '/linechart/',
      name: 'linechart',
      component: () => import('../views/LinechartView.vue')
    },
    {
      path: '/export/',
      name: 'export',
      component: () => import('../views/ExportView.vue')
    },
    {
      path: '/settings/',
      name: 'settings',
      component: () => import('../views/SettingsView.vue')
    }
  ]
})

export default router
