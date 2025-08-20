<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <Sidebar 
      :class="{ 
        'sidebar-mobile-open': uiStore.sidebarVisible && isMobile,
        'sidebar-hidden': !uiStore.sidebarVisible && isMobile 
      }" 
    />
    
    <!-- Main Content -->
    <div 
      class="main-content"
      :class="{ 
        'main-content-expanded': uiStore.sidebarCollapsed && !isMobile,
        'main-content-mobile': isMobile 
      }"
    >
      <!-- Header -->
      <Header />
      
      <!-- Page Content -->
      <div class="page-content">
        <router-view />
      </div>
    </div>

    <!-- Mobile Overlay -->
    <div 
      v-if="isMobile && uiStore.sidebarVisible" 
      class="mobile-overlay"
      @click="uiStore.setSidebarVisible(false)"
    />

    <!-- Loading Overlay -->
    <div v-if="uiStore.loading" class="loading-overlay">
      <el-loading-spinner />
      <p v-if="uiStore.loadingMessage">{{ uiStore.loadingMessage }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'

export default {
  name: 'MainLayout',
  components: {
    Sidebar,
    Header
  },
  setup() {
    const uiStore = useUIStore()
    const isMobile = ref(false)

    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768
      
      // En móvil, ocultar sidebar por defecto
      if (isMobile.value) {
        uiStore.setSidebarVisible(false)
      } else {
        uiStore.setSidebarVisible(true)
      }
    }

    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
    })

    return {
      uiStore,
      isMobile
    }
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.main-content-expanded {
  margin-left: 64px;
}

.main-content-mobile {
  margin-left: 0;
}

.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-overlay p {
  margin-top: 16px;
  color: #606266;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .page-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 12px;
  }
}
</style>
