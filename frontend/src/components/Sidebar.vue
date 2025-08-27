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
      background-color="#001529"
      text-color="#fff"
      active-text-color="#409eff"
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
        <el-avatar :size="32" :src="authStore.user?.photoURL">
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
  background-color: #001529;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  width: 250px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
}

.sidebar-collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #1f2937;
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
  color: #fff;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.toggle-btn {
  color: #fff;
  padding: 4px;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 4px 8px;
  border-radius: 6px;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #1f2937;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #409eff;
  color: #fff;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #1f2937;
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
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.user-role {
  color: #9ca3af;
  font-size: 12px;
  text-transform: capitalize;
}

.logout-btn {
  width: 100%;
  color: #9ca3af;
  text-align: left;
  padding: 8px 12px;
  border-radius: 6px;
}

.logout-btn:hover {
  background-color: #1f2937;
  color: #fff;
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
