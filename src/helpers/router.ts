import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
// import LoginView from '../views/LoginView.vue'

// Note: there is no centralized `router.beforeEach` auth guard here, and it
// isn't applied consistently per-view either. SettingsView.vue checks
// `useAuthStore().token` in its own `setup()` and redirects to /login via
// `redirectToLoginWithPath()` if the user isn't logged in; most other views
// (dashboard, line/energy chart, export) don't perform this check at all -
// the API calls they make will simply fail once the token is missing/expired,
// which is what actually triggers the redirect (see the response interceptor
// in helpers/api.ts).
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
