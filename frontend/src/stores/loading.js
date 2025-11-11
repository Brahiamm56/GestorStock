import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)
  const message = ref('Cargando...')

  function show(msg = 'Cargando...') {
    message.value = msg
    isLoading.value = true
  }

  function hide() {
    isLoading.value = false
  }

  return {
    isLoading,
    message,
    show,
    hide
  }
})
