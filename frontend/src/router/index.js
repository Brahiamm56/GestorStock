import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/Products.vue')
      },
      {
        path: 'products/new',
        name: 'NewProduct',
        component: () => import('@/views/ProductForm.vue')
      },
      {
        path: 'products/:id/edit',
        name: 'EditProduct',
        component: () => import('@/views/ProductForm.vue')
      },
      {
        path: 'sales',
        name: 'Sales',
        component: () => import('@/views/Sales.vue')
      },
      {
        path: 'sales/new',
        name: 'NewSale',
        component: () => import('@/views/SaleForm.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue')
      }
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
  
  // Verificar si el usuario está autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Verificar si el usuario es administrador
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next('/dashboard')
    return
  }
  
  // Redirigir usuarios autenticados desde login
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router
