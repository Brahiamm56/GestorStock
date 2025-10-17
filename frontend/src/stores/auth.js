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

// Configuración de Firebase (reemplazar si corresponde)
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

const STORAGE_KEY = 'gestorstock_user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const firebaseUser = ref(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Persistencia simple en localStorage
  const saveToStorage = () => {
    try {
      if (user.value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (e) {
      console.warn('No se pudo guardar user en localStorage', e)
    }
  }

  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        user.value = JSON.parse(raw)
      }
    } catch (e) {
      console.warn('No se pudo cargar user desde localStorage', e)
    }
  }

  // Helper: obtener token fresco con retries
  const getFreshToken = async (force = true, retries = 1) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const token = await auth.currentUser?.getIdToken(force)
        if (token) return token
      } catch (err) {
        // si el user desapareció o error, romper
        if (!auth.currentUser) throw err
        if (attempt < retries) await new Promise(r => setTimeout(r, 200))
      }
    }
    throw new Error('No se obtuvo idToken')
  }

  // Verificar token con el backend (intenta refrescar cuando expire)
  const verifyToken = async () => {
    try {
      console.log('🔐 Verificando token...')
      
      // Si no hay usuario firebase conocido, intentar cargar desde storage
      if (!auth.currentUser && !firebaseUser.value) {
        console.log('⚠️ No hay usuario Firebase, intentando cargar desde storage...')
        loadFromStorage()
        
        // Si hay datos en storage, mantener la sesión
        if (user.value) {
          console.log('✅ Usuario encontrado en storage, manteniendo sesión')
          initialized.value = true
          return
        }
      }

      const idToken = await getFreshToken(true, 1) // force refresh + 1 retry
      if (!idToken) {
        console.log('⚠️ No se pudo obtener token, pero manteniendo sesión si hay datos en storage')
        if (user.value) {
          initialized.value = true
          return
        }
        initialized.value = true
        return
      }

      // Enviar token en header Authorization (backend acepta body o header)
      const response = await api.post(
        '/auth/verify',
        {},
        { headers: { Authorization: `Bearer ${idToken}` } }
      )

      user.value = response.data.user
      saveToStorage()
      console.log('✅ Token verificado y usuario actualizado')
    } catch (error) {
      console.error('❌ Error al verificar token:', error)

      const resStatus = error?.response?.status
      const resData = error?.response?.data

      // Si backend informa token expirado, intentar refresh once more
      if (resStatus === 401 && resData?.code === 'TOKEN_EXPIRED') {
        try {
          const idToken2 = await getFreshToken(true, 0) // un último intento
          if (idToken2) {
            const retryResp = await api.post(
              '/auth/verify',
              {},
              { headers: { Authorization: `Bearer ${idToken2}` } }
            )
            user.value = retryResp.data.user
            saveToStorage()
            initialized.value = true
            return
          }
        } catch (err2) {
          console.warn('Reintento de token fresco falló', err2)
        }
      }

      // NO limpiar el usuario inmediatamente - mantener sesión si hay datos en storage
      console.log('⚠️ Error en verificación, pero manteniendo sesión si hay datos en storage')
      
      // Solo limpiar si realmente no hay datos válidos en storage
      if (!user.value) {
        console.log('❌ No hay datos en storage, limpiando sesión')
        user.value = null
        firebaseUser.value = null
        saveToStorage()
      } else {
        console.log('✅ Manteniendo sesión con datos de storage')
      }
    } finally {
      // Siempre marcar como inicializado
      initialized.value = true
      console.log('✅ Autenticación inicializada:', {
        hasUser: !!user.value,
        hasFirebaseUser: !!firebaseUser.value,
        isAuthenticated: !!user.value
      })
    }
  }

  // Escuchar cambios en el estado de autenticación de Firebase
  onAuthStateChanged(auth, async (fbUser) => {
    try {
      if (fbUser) {
        console.log('🔥 Usuario Firebase detectado:', fbUser.uid)
        // evitar shadowing: usar firebaseUser ref
        firebaseUser.value = fbUser
        // Cargar user desde storage de forma inmediata para UX
        loadFromStorage()
        // Verificar token con backend (forzar token fresco)
        await verifyToken()
      } else {
        console.log('🔥 Usuario Firebase desconectado')
        // NO limpiar inmediatamente - mantener sesión si hay datos en storage
        firebaseUser.value = null
        
        // Solo limpiar si no hay datos válidos en storage
        if (!user.value) {
          console.log('❌ No hay datos en storage, limpiando sesión')
          user.value = null
          saveToStorage()
        } else {
          console.log('✅ Manteniendo sesión con datos de storage')
        }
        
        initialized.value = true
      }
    } catch (err) {
      console.error('❌ Error en onAuthStateChanged:', err)
      // NO limpiar inmediatamente - mantener sesión si hay datos en storage
      firebaseUser.value = null
      
      if (!user.value) {
        console.log('❌ No hay datos en storage, limpiando sesión')
        user.value = null
        saveToStorage()
      } else {
        console.log('✅ Manteniendo sesión con datos de storage')
      }
      
      initialized.value = true
    }
  })

  // Iniciar sesión
  const login = async (email, password) => {
    loading.value = true
    try {
      await signInWithEmailAndPassword(auth, email, password)
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
    } catch (error) {
      console.error('Error al cerrar sesión (firebase):', error)
    } finally {
      user.value = null
      firebaseUser.value = null
      saveToStorage()
      toast.success('Sesión cerrada correctamente')
    }
  }

  // Actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      // asegurarse token fresco para peticiones protegidas
      const idToken = await getFreshToken(true, 1)
      const response = await api.put('/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${idToken}` }
      })
      user.value = response.data.user
      saveToStorage()
      toast.success('Perfil actualizado correctamente')
      return true
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      toast.error('Error al actualizar perfil')
      return false
    }
  }

  // Actualizar imagen de perfil (2 pasos: subir a /upload/image y guardar URL en /auth/profile)
  const updateProfileImage = async (imageFile) => {
    try {
      const formData = new FormData()
      // El backend de uploads espera el campo 'image'
      formData.append('image', imageFile)

      const idToken = await getFreshToken(true, 1)

      // 1) Subir imagen
      const uploadResp = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${idToken}`
        }
      })

      const imageUrl = uploadResp?.data?.data?.url
      if (!imageUrl) throw new Error('Respuesta de subida sin URL de imagen')

      // 2) Guardar URL en el perfil
      const saveResp = await api.put(
        '/auth/profile',
        { profile_image: imageUrl },
        { headers: { Authorization: `Bearer ${idToken}` } }
      )

      user.value = saveResp.data.user
      saveToStorage()
      toast.success('Imagen de perfil actualizada correctamente')
      return true
    } catch (error) {
      console.error('Error al actualizar imagen de perfil:', error)
      toast.error('Error al actualizar imagen de perfil')
      return false
    }
  }

  // Inicialización: intentar rehidratar antes de que onAuthStateChanged corra
  loadFromStorage()

  return {
    user,
    loading,
    firebaseUser,
    initialized,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    updateProfile,
    updateProfileImage,
    verifyToken
  }
})