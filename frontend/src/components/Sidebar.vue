<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': uiStore.sidebarCollapsed }">
    <div class="sidebar-header">
      <div class="logo-section">
        <img v-if="!uiStore.sidebarCollapsed" src="/logo.svg" alt="Logo" class="logo" />
        <img v-else src="/logo-icon.svg" alt="Logo" class="logo-icon" />
        <h3 v-if="!uiStore.sidebarCollapsed" class="company-name">GestorStock</h3>
      </div>
      <el-button
        type="text"
        @click="uiStore.toggleSidebar"
        class="toggle-btn"
        :icon="uiStore.sidebarCollapsed ? 'Expand' : 'Fold'"
      />
    </div>

    <el-menu
      :default-active="$route.path"
      :collapse="uiStore.sidebarCollapsed"
      router
      class="sidebar-menu"
      background-color="#fffbf5"
      text-color="#6b7280"
      active-text-color="#ea580c"
    >
      <el-menu-item index="/dashboard">
        <el-icon><DataBoard /></el-icon>
        <template #title>Dashboard</template>
      </el-menu-item>
      
      <el-menu-item index="/products">
        <el-icon><Goods /></el-icon>
        <template #title>Productos</template>
      </el-menu-item>
      
      <el-menu-item index="/sales">
        <el-icon><ShoppingCart /></el-icon>
        <template #title>Ventas</template>
      </el-menu-item>
      
      <el-menu-item v-if="authStore.isAdmin" index="/users">
        <el-icon><User /></el-icon>
        <template #title>Usuarios</template>
      </el-menu-item>
      
      <el-menu-item index="/profile">
        <el-icon><Setting /></el-icon>
        <template #title>Perfil</template>
      </el-menu-item>
    </el-menu>

    <div class="sidebar-footer">
      <div class="user-info">
        <el-avatar :size="32" :src="authStore.user?.profile_image">
          {{ authStore.user?.name?.charAt(0) }}
        </el-avatar>
        <div v-if="!uiStore.sidebarCollapsed" class="user-details">
          <span class="user-name">{{ authStore.user?.name }}</span>
          <span class="user-role">{{ authStore.user?.role }}</span>
        </div>
      </div>
      <el-button
        type="text"
        @click="authStore.logout"
        class="logout-btn"
        :icon="uiStore.sidebarCollapsed ? 'SwitchButton' : undefined"
      >
        <span v-if="!uiStore.sidebarCollapsed">Cerrar Sesión</span>
      </el-button>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

export default {
  name: 'Sidebar',
  setup() {
    const authStore = useAuthStore()
    const uiStore = useUIStore()

    return {
      authStore,
      uiStore
    }
  }
}
</script>

<style scoped>
.sidebar {
  height: 100vh;
  background: linear-gradient(180deg, #fffbf5 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  width: 250px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  border-right: 3px solid #fed7aa;
  box-shadow: 4px 0 16px rgba(234, 88, 12, 0.08);
}

.sidebar-collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #fed7aa;
  background: linear-gradient(135deg, #fffbf5 0%, #fff7ed 100%);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 32px;
  width: auto;
}

.logo-icon {
  height: 32px;
  width: 32px;
}

.company-name {
  color: #9a3412;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.toggle-btn {
  color: #f97316;
  padding: 4px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  color: #ea580c;
  transform: scale(1.1);
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 6px 12px;
  border-radius: 10px;
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.10) 0%, rgba(252, 211, 77, 0.08) 100%);
  color: #ea580c;
  border-left: 3px solid #fb923c;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.12);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.12) 0%, rgba(252, 211, 77, 0.06) 100%);
  color: #ea580c;
  border: 2px solid #fb923c;
  box-shadow: inset 0 2px 8px rgba(251, 146, 60, 0.1), 0 4px 16px rgba(251, 146, 60, 0.15);
  font-weight: 600;
}

.sidebar-menu :deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: linear-gradient(180deg, #fb923c 0%, #f97316 100%);
  border-radius: 0 4px 4px 0;
  box-shadow: 2px 0 8px rgba(251, 146, 60, 0.4);
}

.sidebar-footer {
  padding: 16px;
  border-top: 2px solid #fed7aa;
  background: linear-gradient(135deg, #fffbf5 0%, #fff7ed 100%);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  color: #ea580c;
  font-size: 14px;
  font-weight: 600;
}

.user-role {
  color: #ea580c;
  font-size: 12px;
  text-transform: capitalize;
  font-weight: 500;
}

.logout-btn {
  width: 100%;
  color: #f97316;
  text-align: left;
  padding: 10px 12px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%);
  color: #ea580c;
  transform: translateX(2px);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.sidebar-mobile-open {
    transform: translateX(0);
  }

  .sidebar.sidebar-hidden {
    transform: translateX(-100%);
  }
}
</style>
