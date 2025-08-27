// Configuración de la API
export const API_CONFIG = {
  // URL base del backend
  BASE_URL: 'http://localhost:5000',
  
  // URL para imágenes (usando el proxy de Vite)
  IMAGE_BASE_URL: 'http://localhost:3000',
  
  // Endpoints
  ENDPOINTS: {
    AUTH: '/api/auth',
    PRODUCTS: '/api/products',
    SALES: '/api/sales',
    USERS: '/api/users',
    UPLOAD: '/api/upload'
  }
}

// Función para construir URLs de imágenes
export const getImageUrl = (url) => {
  if (!url) return null
  
  // Si es una URL completa, usarla directamente
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Si es una URL relativa del servidor, usar la URL del proxy de Vite
  if (url.startsWith('/')) {
    return `${API_CONFIG.IMAGE_BASE_URL}${url}`
  }
  
  return url
}

// Función para construir URLs de la API
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
