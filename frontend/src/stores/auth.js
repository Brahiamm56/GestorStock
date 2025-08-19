import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { toast } from 'vue3-toastify'
import api from '@/services/api'

// Configuración de Firebase (debes reemplazar con tu configuración)
const firebaseConfig = {
  apiKey: "AIzaSyAvDYFche6vtuJ43d7_LGdXdKnRBkyPG-M",
  authDomain: "gestor-stock-192ae.firebaseapp.com",
  projectId: "gestor-stock-192ae",
  storageBucket: "gestor-stock-192ae.firebasestorage.app",
  messagingSenderId: "335669416990",
  appId: "1:335669416990:web:66196c9d188d88831d4a0f",
  measurementId: "G-QCC5Q8H6H5"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const firebaseUser = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Escuchar cambios en el estado de autenticación de Firebase
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      firebaseUser.value = firebaseUser
      await verifyToken()
    } else {
      firebaseUser.value = null
      user.value = null
    }
  })

  // Verificar token con el backend
  const verifyToken = async () => {
    try {
      const idToken = await auth.currentUser?.getIdToken()
      if (!idToken) return

      const response = await api.post('/auth/verify', { idToken })
      user.value = response.data.user
    } catch (error) {
      console.error('Error al verificar token:', error)
      await signOut()
    }
  }

  // Iniciar sesión
  const login = async (email, password) => {
    loading.value = true
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await verifyToken()
      toast.success('Inicio de sesión exitoso')
      return true
    } catch (error) {
      console.error('Error en login:', error)
      let message = 'Error al iniciar sesión'
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'Usuario no encontrado'
          break
        case 'auth/wrong-password':
          message = 'Contraseña incorrecta'
          break
        case 'auth/invalid-email':
          message = 'Email inválido'
          break
        case 'auth/too-many-requests':
          message = 'Demasiados intentos. Intenta más tarde'
          break
      }
      
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  // Cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      toast.success('Sesión cerrada correctamente')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  // Actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData)
      user.value = response.data.user
      toast.success('Perfil actualizado correctamente')
      return true
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      toast.error('Error al actualizar perfil')
      return false
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    updateProfile
  }
})
