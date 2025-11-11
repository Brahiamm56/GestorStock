import { toast } from 'vue3-toastify'
import router from '@/router'

export function handleApiError(error, customMessage = null) {
  console.error('API Error:', error)

  // Si hay un mensaje personalizado, usarlo
  if (customMessage) {
    toast.error(customMessage)
    return
  }

  // Si el error tiene respuesta del servidor
  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    switch (status) {
      case 400:
        // Error de validación o datos inválidos
        if (data.errors && Array.isArray(data.errors)) {
          // Mostrar primer error de validación
          toast.error(data.errors[0].message || 'Datos inválidos')
        } else {
          toast.error(data.error || data.message || 'Datos inválidos')
        }
        break

      case 401:
        // No autenticado
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente')
        setTimeout(() => {
          router.push('/login')
        }, 1500)
        break

      case 403:
        // Sin permisos
        toast.error('No tienes permisos para realizar esta acción')
        break

      case 404:
        // Recurso no encontrado
        toast.error(data.error || 'El recurso solicitado no fue encontrado')
        break

      case 409:
        // Conflicto (ej: SKU duplicado)
        toast.error(data.error || 'Ya existe un registro con esos datos')
        break

      case 422:
        // Error de validación
        toast.error(data.error || 'Error de validación de datos')
        break

      case 500:
        // Error del servidor
        toast.error('Error en el servidor. Por favor, intenta nuevamente más tarde')
        break

      case 503:
        // Servicio no disponible
        toast.error('El servicio no está disponible temporalmente')
        break

      default:
        toast.error(data.error || 'Ocurrió un error inesperado')
    }
  } else if (error.request) {
    // La petición se hizo pero no hubo respuesta
    toast.error('No se pudo conectar con el servidor. Verifica tu conexión a internet')
  } else {
    // Error al configurar la petición
    toast.error('Error al procesar la solicitud')
  }
}

export function showSuccess(message) {
  toast.success(message, {
    autoClose: 3000,
    position: 'top-right'
  })
}

export function showWarning(message) {
  toast.warning(message, {
    autoClose: 4000,
    position: 'top-right'
  })
}

export function showInfo(message) {
  toast.info(message, {
    autoClose: 3000,
    position: 'top-right'
  })
}
