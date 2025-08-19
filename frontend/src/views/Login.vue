<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Gestor de Stock</h1>
      <el-form @submit.prevent="handleLogin" :model="form" :rules="rules" ref="loginForm">
        <el-form-item prop="email">
          <el-input 
            v-model="form.email" 
            placeholder="Email"
            prefix-icon="User"
            type="email"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            placeholder="Contraseña"
            prefix-icon="Lock"
            type="password"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin" 
            :loading="authStore.loading"
            style="width: 100%"
          >
            Iniciar Sesión
          </el-button>
        </el-form-item>
      </el-form>
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
    const loginForm = ref(null)

    const form = reactive({
      email: '',
      password: ''
    })

    const rules = {
      email: [
        { required: true, message: 'El email es requerido', trigger: 'blur' },
        { type: 'email', message: 'Email inválido', trigger: 'blur' }
      ],
      password: [
        { required: true, message: 'La contraseña es requerida', trigger: 'blur' },
        { min: 6, message: 'La contraseña debe tener al menos 6 caracteres', trigger: 'blur' }
      ]
    }

    const handleLogin = async () => {
      if (!loginForm.value) return
      
      try {
        await loginForm.value.validate()
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
      rules,
      loginForm,
      authStore,
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.8rem;
}
</style>
