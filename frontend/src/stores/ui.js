import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // Estado del sidebar
  const sidebarCollapsed = ref(false)
  const sidebarVisible = ref(true)

  // Estado de carga
  const loading = ref(false)
  const loadingMessage = ref('')

  // Estado de notificaciones
  const notifications = ref([])

  // Acciones para el sidebar
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setSidebarCollapsed = (collapsed) => {
    sidebarCollapsed.value = collapsed
  }

  const setSidebarVisible = (visible) => {
    sidebarVisible.value = visible
  }

  // Acciones para loading
  const setLoading = (isLoading, message = '') => {
    loading.value = isLoading
    loadingMessage.value = message
  }

  // Acciones para notificaciones
  const addNotification = (notification) => {
    notifications.value.push({
      id: Date.now(),
      ...notification
    })
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  return {
    // Estado
    sidebarCollapsed,
    sidebarVisible,
    loading,
    loadingMessage,
    notifications,
    
    // Acciones
    toggleSidebar,
    setSidebarCollapsed,
    setSidebarVisible,
    setLoading,
    addNotification,
    removeNotification
  }
})
