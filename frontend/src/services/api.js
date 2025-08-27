import axios from 'axios'
import { getAuth } from 'firebase/auth'
import { toast } from 'vue3-toastify'

// Crear instancia de axios
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  async (config) => {
    console.log('🔍 API Request:', config.method?.toUpperCase(), config.url)
    console.log('🔍 Full URL:', config.baseURL + config.url)
    
    const auth = getAuth()
    const user = auth.currentUser
    
    if (user) {
      try {
        const token = await user.getIdToken()
        config.headers.Authorization = `Bearer ${token}`
      } catch (error) {
        console.error('Error al obtener token:', error)
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Si el error es 401 y no hemos intentado renovar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const auth = getAuth()
      const user = auth.currentUser
      
      if (user) {
        try {
          // Forzar renovación del token
          await user.getIdToken(true)
          const newToken = await user.getIdToken()
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          
          // Reintentar la petición
          return api(originalRequest)
        } catch (refreshError) {
          console.error('Error al renovar token:', refreshError)
          // Redirigir al login si no se puede renovar el token
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }
    
    // Mostrar mensaje de error
    if (error.response?.data?.error) {
      toast.error(error.response.data.error)
    } else if (error.message) {
      toast.error(error.message)
    }
    
    return Promise.reject(error)
  }
)

// Servicios específicos
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),
  getLowStock: () => api.get('/products/low-stock')
}

export const saleService = {
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  getStats: (params) => api.get('/sales/stats', { params }),
  generateReceipt: (id) => api.get(`/sales/${id}/receipt`, { responseType: 'blob' })
}

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  updateStatus: (id, is_active) => api.patch(`/users/${id}/status`, { is_active })
}

export const authService = {
  verifyToken: (idToken) => api.post('/auth/verify', { idToken }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
}

export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default api
