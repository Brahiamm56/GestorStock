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
              <button @click="authStore.logout" class="logout-btn">
                <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16,17 21,12 16,7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Cerrar Sesión</span>
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
import { computed } from 'vue'

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

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: DataBoard },
  { path: '/products', label: 'Productos', icon: Goods },
  { path: '/sales', label: 'Ventas', icon: ShoppingCart },
  { path: '/profile', label: 'Perfil', icon: Setting }
]

const getUserInitials = () => {
  const name = authStore.user?.name || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<style scoped>
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
  background: var(--header-bg);
  color: var(--header-text);
  padding: 0;
  height: 80px;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 32px;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.app-title {
  color: var(--accent-color);
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.header-subtitle {
  color: var(--accent-color);
  font-size: 14px;
  font-weight: 500;
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.user-initials {
  color: var(--accent-color);
  font-weight: 700;
  font-size: 18px;
  font-family: 'Inter', sans-serif;
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
  color: var(--accent-color);
  font-weight: 600;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
}

.user-role {
  color: var(--accent-color);
  font-size: 14px;
  font-weight: 500;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--accent-color);
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.logout-icon {
  width: 18px;
  height: 18px;
}

/* Main Content Wrapper */
.main-content-wrapper {
  display: flex;
  flex: 1;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 32px 24px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: var(--accent-color);
}

.logo-text {
  color: var(--accent-color);
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 700;
}

.sidebar-nav {
  padding: 24px 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  margin: 0 16px 8px;
  border-radius: 12px;
  color: var(--accent-color);
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--accent-color);
  transform: translateX(4px);
}

.nav-item.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 32px;
  background: #3b82f6;
  border-radius: 0 4px 4px 0;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.nav-icon svg {
  width: 20px;
  height: 20px;
}

.nav-text {
  font-weight: 600;
}

/* Main Content Area */
.main-content {
  flex: 1;
  background: var(--bg-cream-primary);
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