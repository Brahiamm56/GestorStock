import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/layouts/MainLayout.vue'
import Dashboard from '@/views/Dashboard.vue'
import Products from '@/views/Products.vue'
import Sales from '@/views/Sales.vue'
import Profile from '@/views/Profile.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'products', component: Products },
      { path: 'sales', component: Sales },
      { path: 'profile', component: Profile },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guardia de navegación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Esperar a que la autenticación se inicialice
  if (!authStore.initialized) {
    console.log('⏳ Esperando inicialización de autenticación...')
    // Esperar un poco para que se inicialice
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('🔐 Estado de autenticación:', {
    isAuthenticated: authStore.isAuthenticated,
    initialized: authStore.initialized,
    route: to.path,
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest
  })
  
  // Verificar si el usuario está autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('🚫 Usuario no autenticado, redirigiendo a login')
    next('/login')
    return
  }
  
  // Verificar si el usuario es administrador
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    console.log('🚫 Usuario no es admin, redirigiendo a dashboard')
    next('/dashboard')
    return
  }
  
  // Redirigir usuarios autenticados desde login
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log('✅ Usuario autenticado, redirigiendo a dashboard')
    next('/dashboard')
    return
  }
  
  console.log('✅ Navegación permitida')
  next()
})

export default router
