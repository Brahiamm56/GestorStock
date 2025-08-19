<template>
  <div class="profile-page">
    <el-card>
      <template #header>
        <h2>Mi Perfil</h2>
      </template>
      
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Nombre" prop="name">
              <el-input v-model="form.name" placeholder="Tu nombre" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" placeholder="Tu email" type="email" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="Rol">
          <el-input :value="getRoleText(authStore.user?.role)" readonly />
        </el-form-item>
        
        <el-form-item label="Estado">
          <el-tag :type="authStore.user?.is_active ? 'success' : 'danger'">
            {{ authStore.user?.is_active ? 'Activo' : 'Inactivo' }}
          </el-tag>
        </el-form-item>
        
        <el-form-item label="Último Login">
          <el-input :value="formatDate(authStore.user?.last_login)" readonly />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            Actualizar Perfil
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()
    const formRef = ref(null)
    const loading = ref(false)

    const form = reactive({
      name: '',
      email: ''
    })

    const rules = {
      name: [
        { required: true, message: 'El nombre es requerido', trigger: 'blur' }
      ],
      email: [
        { required: true, message: 'El email es requerido', trigger: 'blur' },
        { type: 'email', message: 'Email inválido', trigger: 'blur' }
      ]
    }

    const loadProfile = () => {
      if (authStore.user) {
        form.name = authStore.user.name
        form.email = authStore.user.email
      }
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
        loading.value = true
        
        const success = await authStore.updateProfile(form)
        if (success) {
          toast.success('Perfil actualizado correctamente')
        }
      } catch (error) {
        console.error('Error al actualizar perfil:', error)
        toast.error('Error al actualizar perfil')
      } finally {
        loading.value = false
      }
    }

    const getRoleText = (role) => {
      return role === 'admin' ? 'Administrador' : 'Usuario'
    }

    const formatDate = (date) => {
      if (!date) return 'Nunca'
      return format(new Date(date), 'dd/MM/yyyy HH:mm')
    }

    onMounted(() => {
      loadProfile()
    })

    return {
      formRef,
      form,
      rules,
      loading,
      authStore,
      handleSubmit,
      getRoleText,
      formatDate
    }
  }
}
</script>

<style scoped>
.profile-page {
  padding: 20px;
}
</style>
