<template>
  <div class="header">
    <div class="header-left">
      <el-button
        v-if="isMobile"
        type="text"
        @click="uiStore.setSidebarVisible(!uiStore.sidebarVisible)"
        class="mobile-menu-btn"
        icon="Menu"
      />
      <el-button
        v-else
        type="text"
        @click="uiStore.toggleSidebar"
        class="toggle-sidebar-btn"
        :icon="uiStore.sidebarCollapsed ? 'Expand' : 'Fold'"
      />
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="header-right">
      <div class="header-actions">
        <el-button
          type="text"
          @click="showNotifications = !showNotifications"
          class="notification-btn"
        >
          <el-icon><Bell /></el-icon>
          <el-badge v-if="unreadNotifications > 0" :value="unreadNotifications" />
        </el-button>

        <el-dropdown @command="handleUserCommand" trigger="click">
          <div class="user-dropdown">
            <el-avatar :size="32" :src="authStore.user?.photoURL">
              {{ authStore.user?.name?.charAt(0) }}
            </el-avatar>
            <span class="user-name">{{ authStore.user?.name }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                Mi Perfil
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                Configuración
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                Cerrar Sesión
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- Notifications Panel -->
    <el-drawer
      v-model="showNotifications"
      title="Notificaciones"
      direction="rtl"
      size="300px"
    >
      <div class="notifications-panel">
        <div v-if="notifications.length === 0" class="empty-notifications">
          <el-empty description="No hay notificaciones" />
        </div>
        <div v-else class="notifications-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.read }"
          >
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            <el-button
              type="text"
              @click="markAsRead(notification.id)"
              :icon="Check"
              size="small"
            />
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { Bell, ArrowDown, User, Setting, SwitchButton, Check } from '@element-plus/icons-vue'

export default {
  name: 'Header',
  components: {
    Bell,
    ArrowDown,
    User,
    Setting,
    SwitchButton,
    Check
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const uiStore = useUIStore()

    const showNotifications = ref(false)
    const notifications = ref([])
    const isMobile = ref(false)

    // Computed properties
    const breadcrumbs = computed(() => {
      const pathArray = route.path.split('/').filter(Boolean)
      const breadcrumbs = [{ path: '/', name: 'Inicio' }]
      
      pathArray.forEach((segment, index) => {
        const path = '/' + pathArray.slice(0, index + 1).join('/')
        const name = segment.charAt(0).toUpperCase() + segment.slice(1)
        breadcrumbs.push({ path, name })
      })
      
      return breadcrumbs
    })

    const unreadNotifications = computed(() => {
      return notifications.value.filter(n => !n.read).length
    })

    // Methods
    const handleUserCommand = (command) => {
      switch (command) {
        case 'profile':
          router.push('/profile')
          break
        case 'settings':
          // TODO: Implementar configuración
          break
        case 'logout':
          authStore.logout()
          break
      }
    }

    const markAsRead = (notificationId) => {
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    }

    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return 'Ahora'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
      return date.toLocaleDateString()
    }

    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768
    }

    // Lifecycle
    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
    })

    return {
      authStore,
      uiStore,
      showNotifications,
      notifications,
      isMobile,
      breadcrumbs,
      unreadNotifications,
      handleUserCommand,
      markAsRead,
      formatTime
    }
  }
}
</script>

<style scoped>
.header {
  height: 64px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 999;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobile-menu-btn,
.toggle-sidebar-btn {
  padding: 8px;
  color: #606266;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-btn {
  padding: 8px;
  color: #606266;
  position: relative;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-dropdown:hover {
  background-color: #f5f7fa;
}

.user-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.notifications-panel {
  padding: 16px;
}

.empty-notifications {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border-left: 4px solid transparent;
}

.notification-item.unread {
  background-color: #f0f9ff;
  border-left-color: #409eff;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }

  .breadcrumb {
    display: none;
  }

  .user-name {
    display: none;
  }
}
</style>
