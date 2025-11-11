<template>
  <div class="main-layout">
    <div class="layout-container">
      <!-- Modern Header -->
      <header class="main-header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="app-title">Gestor de Stock</h1>
            <div class="header-subtitle">Sistema de Gestión Integral</div>
          </div>
          <div class="header-right">
            <div class="user-info">
              <div class="user-avatar">
                <img v-if="authStore.user?.profile_image" :src="authStore.user.profile_image" alt="avatar" class="avatar-img" />
                <span v-else class="user-initials">{{ getUserInitials() }}</span>
              </div>
              <div class="user-details">
                <span class="user-name">{{ authStore.user?.name }}</span>
                <span class="user-role">{{ authStore.user?.role || 'Usuario' }}</span>
              </div>
              <button v-if="!showLobbyButton" @click="handleLogout" class="logout-btn">
                <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16,17 21,12 16,7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Cerrar Sesión</span>
              </button>
              <button v-else @click="goToLobby" class="lobby-btn">
                <svg class="lobby-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9,22 9,12 15,12 15,22"></polyline>
                </svg>
                <span>Salir al Lobby</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="main-content-wrapper">
        <!-- Redesigned Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="sidebar-logo">
              <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 7L10 17l-5-5"></path>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
              </svg>
              <span class="logo-text">Gestor de Stock</span>
            </div>
          </div>
          
          <nav class="sidebar-nav">
            <router-link 
              v-for="item in navigationItems" 
              :key="item.path"
              :to="item.path"
              class="nav-item"
              :class="{ active: $route.path === item.path }"
            >
              <div class="nav-icon">
                <component :is="item.icon" />
              </div>
              <span class="nav-text">{{ item.label }}</span>
            </router-link>
          </nav>
        </aside>

        <!-- Main Content Area -->
        <main class="main-content">
          <div class="content-container">
            <router-view />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'

// Inicializar autenticación al montar el layout
onMounted(async () => {
  const authStore = useAuthStore()
  
  // Solo inicializar si no está ya inicializado
  if (!authStore.initialized) {
    console.log('🔄 MainLayout - Inicializando autenticación...')
    try {
      await authStore.verifyToken()
      console.log('✅ MainLayout - Autenticación inicializada')
    } catch (error) {
      console.error('❌ MainLayout - Error al inicializar autenticación:', error)
      // No hacer logout automático, solo marcar como inicializado
      console.log('⚠️ MainLayout - Continuando sin autenticación válida')
    }
  } else {
    console.log('✅ MainLayout - Autenticación ya inicializada')
  }
})

// Icons as components
const DataBoard = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="9" y1="9" x2="15" y2="9"></line>
    <line x1="9" y1="15" x2="15" y2="15"></line>
    <line x1="9" y1="12" x2="15" y2="12"></line>
  </svg>`
}

const Goods = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M20 7l-8-4-8 4"></path>
    <path d="M20 7v10l-8 4-8-4V7"></path>
    <path d="M12 3v16"></path>
  </svg>`
}

const ShoppingCart = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>`
}

const Setting = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>`
}

const authStore = useAuthStore()
const showLobbyButton = ref(false)

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: DataBoard },
  { path: '/products', label: 'Productos', icon: Goods },
  { path: '/sales', label: 'Ventas', icon: ShoppingCart },
  { path: '/profile', label: 'Perfil', icon: Setting }
]

// Función para manejar el logout
const handleLogout = async () => {
  await authStore.logout()
  showLobbyButton.value = true
}

// Función para ir al lobby
const goToLobby = () => {
  window.location.href = '/login'
}

const getUserInitials = () => {
  const name = authStore.user?.name || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<style scoped>
/* Updated: Warm color scheme 2024 */
.main-layout {
  min-height: 100vh;
  background: var(--bg-primary);
}

.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header Styles */
.main-header {
  background: var(--background);
  color: var(--text-primary);
  padding: 0;
  height: var(--header-height);
  z-index: var(--z-sticky);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 var(--space-8);
  max-width: 100%;
  overflow: visible;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.app-title {
  color: var(--primary);
  font-family: var(--font-sans);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin: 0;
  line-height: var(--leading-tight);
}

.header-subtitle {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-shrink: 0;
  margin-left: auto;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--background);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.user-initials {
  color: var(--text-inverse);
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
  font-family: var(--font-sans);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  color: var(--text-primary);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
}

.user-role {
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--danger-bg);
  color: var(--danger-text);
  border: 1px solid var(--danger);
  padding: 10px 16px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--transition-base);
}

.logout-btn:hover {
  background: var(--danger);
  color: var(--text-inverse);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.logout-icon {
  width: 18px;
  height: 18px;
}

.lobby-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--success-bg);
  color: var(--success-text);
  border: 1px solid var(--success);
  padding: 10px 16px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--transition-base);
}

.lobby-btn:hover {
  background: var(--success);
  color: var(--text-inverse);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.lobby-icon {
  width: 18px;
  height: 18px;
}

/* Main Content Wrapper */
.main-content-wrapper {
  display: flex;
  flex: 1;
  margin-top: var(--header-height); /* Compensar el header fijo */
  overflow-x: hidden;
}

/* Sidebar Styles - Diseño Claro Moderno */
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--background);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: var(--header-height);
  height: calc(100vh - var(--header-height));
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-slow);
  flex-shrink: 0;
}

/* Scrollbar personalizado */
.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: var(--radius-full);
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--gray-400);
}

.sidebar-header {
  padding: var(--space-6) var(--space-5);
  border-bottom: 1px solid var(--border-color);
  background: var(--gray-50);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.sidebar-logo:hover {
  transform: translateX(2px);
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  flex-shrink: 0;
  box-shadow: var(--shadow-primary);
  padding: var(--space-2);
}

.logo-text {
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.5px;
}

.sidebar-nav {
  padding: var(--space-4) var(--space-3);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  text-decoration: none;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--transition-base);
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: var(--primary);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  transition: height var(--transition-base);
}

/* Hover state */
.nav-item:hover {
  background: var(--gray-50);
  color: var(--text-primary);
  transform: translateX(4px);
}

/* Estado activo */
.nav-item.active {
  background: linear-gradient(135deg, #FED7AA 0%, #FEF3C7 100%);
  color: var(--primary-dark);
  border: 1px solid var(--primary-light);
  box-shadow: 0 2px 8px rgba(234, 88, 12, 0.15);
  transform: translateX(0);
  font-weight: var(--font-semibold);
}

.nav-item.active::before {
  height: 60%;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  transition: all var(--transition-base);
}

.nav-item:hover .nav-icon {
  transform: scale(1.05);
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-icon svg {
  width: 18px;
  height: 18px;
}

.nav-text {
  font-weight: 500;
  flex: 1;
}

/* Main Content Area */
.main-content {
  flex: 1;
  background: var(--background-secondary);
  border-left: none;
  position: relative;
}

.content-container {
  padding: 32px;
  min-height: calc(100vh - 80px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }
  
  .content-container {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .main-header {
    height: 70px;
  }
  
  .header-content {
    padding: 0 20px;
  }
  
  .app-title {
    font-size: 24px;
  }
  
  .sidebar {
    width: 200px;
  }
  
  .content-container {
    padding: 20px;
  }
  
  .user-details {
    display: none;
  }
}

@media (max-width: 640px) {
  .sidebar {
    position: fixed;
    left: -100%;
    top: 70px;
    height: calc(100vh - 70px);
    z-index: 99;
    transition: left 0.3s ease;
  }
  
  .sidebar.open {
    left: 0;
  }
  
  .content-container {
    padding: 16px;
  }
}
</style>