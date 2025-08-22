<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo PIPAX -->
      <div class="logo-container">
        <div class="logo-circle">
          <span class="logo-text">PIPAX</span>
        </div>
      </div>
      
      <!-- Título -->
      <h1 class="login-title">Bienvenido</h1>
      <p class="login-subtitle">Ingresa a tu cuenta para continuar</p>
      
      <!-- Formulario -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Campo Usuario/Email -->
        <div class="input-group">
          <div class="input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="Email"
            class="form-input"
            :class="{ 'error': errors.email }"
            @blur="validateField('email')"
            @input="clearError('email')"
          />
        </div>
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        
        <!-- Campo Contraseña -->
        <div class="input-group">
          <div class="input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <input 
            v-model="form.password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="Contraseña"
            class="form-input"
            :class="{ 'error': errors.password }"
            @blur="validateField('password')"
            @input="clearError('password')"
          />
          <button 
            type="button" 
            class="password-toggle"
            @click="showPassword = !showPassword"
          >
            <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65661 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1747 15.0074 10.8019 14.8565C10.4291 14.7056 10.0917 14.4811 9.80385 14.1962C9.51597 13.9113 9.29326 13.5727 9.14624 13.1999C8.99922 12.8271 8.93041 12.4265 8.94345 12.0237C8.95649 11.6209 9.05118 11.2236 9.22247 10.8556C9.39376 10.4876 9.63747 10.1563 9.94 9.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M1 1L23 23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        
        <!-- Enlace Olvidé contraseña -->
        <div class="forgot-password">
          <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
        </div>
        
        <!-- Botón de Login -->
        <button 
          type="submit" 
          class="login-button"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading" class="loading-spinner"></span>
          <span v-else>Ingresar</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const form = reactive({
      email: '',
      password: ''
    })
    
    const errors = reactive({
      email: '',
      password: ''
    })
    
    const showPassword = ref(false)
    
    const validateField = (field) => {
      errors[field] = ''
      
      if (field === 'email') {
        if (!form.email) {
          errors.email = 'El email es requerido'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          errors.email = 'Email inválido'
        }
      }
      
      if (field === 'password') {
        if (!form.password) {
          errors.password = 'La contraseña es requerida'
        } else if (form.password.length < 6) {
          errors.password = 'La contraseña debe tener al menos 6 caracteres'
        }
      }
    }
    
    const clearError = (field) => {
      errors[field] = ''
    }
    
    const validateForm = () => {
      validateField('email')
      validateField('password')
      return !errors.email && !errors.password
    }
    
    const handleLogin = async () => {
      if (!validateForm()) return
      
      try {
        const success = await authStore.login(form.email, form.password)
        if (success) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error en login:', error)
      }
    }
    
    return {
      form,
      errors,
      showPassword,
      authStore,
      validateField,
      clearError,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffd5db 0%, #f7dcd1 50%, #FFB6C1 100%);
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
  pointer-events: none;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 3rem 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Logo */
.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.logo-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fffcfd 0%, #d89e87 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(255, 60, 0, 0.3);
  transition: transform 0.3s ease;
}

.logo-circle:hover {
  transform: scale(1.05);
}

.logo-text {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #000000;
  letter-spacing: 1px;
}

/* Títulos */
.login-title {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #333333;
  font-size: 2rem;
  font-weight: 600;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.login-subtitle {
  text-align: center;
  margin-bottom: 2.5rem;
  color: #666666;
  font-size: 1rem;
  font-weight: 400;
}

/* Formulario */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #ec0000;
  z-index: 2;
  transition: color 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: #FFB6C1;
  box-shadow: 0 0 0 3px rgba(255, 182, 193, 0.1);
}

.form-input:focus + .input-icon {
  color: #FFB6C1;
}

.form-input.error {
  border-color: #EF4444;
}

.form-input.error:focus {
  border-color: #EF4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #999999;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #FFB6C1;
}

.error-message {
  color: #000000;
  font-size: 0.875rem;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
}

/* Enlace olvidé contraseña */
.forgot-password {
  text-align: right;
  margin-bottom: 1rem;
}

.forgot-link {
  color: #000000;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #FFB6C1;
  text-decoration: underline;
}

/* Botón de login */
.login-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #c99999 0%, #FFA07A 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 182, 193, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Loading spinner */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .logo-circle {
    width: 70px;
    height: 70px;
  }
  
  .logo-text {
    font-size: 1.3rem;
  }
  
  .login-title {
    font-size: 1.75rem;
  }
  
  .form-input {
    padding: 0.875rem 0.875rem 0.875rem 2.75rem;
  }
  
  .input-icon {
    left: 0.875rem;
  }
  
  .password-toggle {
    right: 0.875rem;
  }
}

/* Animaciones de entrada */
.login-card {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Efectos hover en inputs */
.input-group:hover .input-icon {
  color: #FFB6C1;
}

.input-group:hover .form-input:not(:focus) {
  border-color: #D1D5DB;
}
</style>
