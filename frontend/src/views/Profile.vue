<template>
  <div class="profile-bg">
    <div class="profile-sections">
      <!-- Información básica -->
      <div class="profile-card">
        <h2 class="section-title">Información básica</h2>
        <div class="profile-row">
          <span class="profile-label">Foto de perfil</span>
          <img
            class="profile-avatar"
            :src="form.photo || defaultAvatar"
            alt="Foto de perfil"
            @click="triggerImageUpload"
          />
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onImageChange"
          />
        </div>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="140px"
          @submit.prevent="handleSubmit"
        >
          <el-form-item label="Nombre" prop="name">
            <el-input v-model="form.name" placeholder="Tu nombre" />
          </el-form-item>
          <el-form-item label="Fecha de nacimiento" prop="birthdate">
            <el-date-picker
              v-model="form.birthdate"
              type="date"
              placeholder="Selecciona fecha"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="Género" prop="gender">
            <el-select v-model="form.gender" placeholder="Selecciona género">
              <el-option label="Masculino" value="Masculino" />
              <el-option label="Femenino" value="Femenino" />
              <el-option label="Otro" value="Otro" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- Información de contacto -->
      <div class="profile-card">
        <h2 class="section-title">Información de contacto</h2>
        <el-form :model="form" label-width="140px">
          <el-form-item label="Email">
            <el-input v-model="form.email" disabled />
          </el-form-item>
        </el-form>
      </div>

      <!-- Otros datos -->
      <div class="profile-card">
        <h2 class="section-title">Otros datos</h2>
        <el-form :model="form" label-width="140px">
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
        </el-form>
        <el-button class="profile-btn" type="primary" @click="handleSubmit" :loading="loading">
          Guardar cambios
        </el-button>
      </div>
    </div>
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
    const defaultAvatar = '/logo-icon.svg'

    const form = reactive({
      name: '',
      email: '',
      photo: '',
      birthdate: '',
      gender: ''
    })

    const rules = {
      name: [
        { required: true, message: 'El nombre es requerido', trigger: 'blur' }
      ],
      email: [
        { required: true, message: 'El email es requerido', trigger: 'blur' },
        { type: 'email', message: 'Email inválido', trigger: 'blur' }
      ],
      birthdate: [
        { required: false }
      ],
      gender: [
        { required: false }
      ]
    }

    const loadProfile = () => {
      if (authStore.user) {
        form.name = authStore.user.name
        form.email = authStore.user.email
        form.photo = authStore.user.photo || ''
        form.birthdate = authStore.user.birthdate || ''
        form.gender = authStore.user.gender || ''
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

    // Imagen de perfil
    const fileInput = ref(null)
    const triggerImageUpload = () => {
      fileInput.value && fileInput.value.click()
    }
    const onImageChange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          form.photo = ev.target.result
        }
        reader.readAsDataURL(file)
      }
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
      formatDate,
      defaultAvatar,
      fileInput,
      triggerImageUpload,
      onImageChange
    }
  }
}
</script>

<style scoped>
.profile-bg {
  padding: 32px 0;
}
.profile-sections {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.profile-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px #fad0c4aa;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #222;
}
.profile-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.profile-label {
  color: #888;
  font-size: 1rem;
  min-width: 120px;
}
.profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffd6db;
  background: #fafafa;
  cursor: pointer;
}
.profile-btn {
  width: 100%;
  padding: 0.8rem 0;
  border-radius: 12px;
  background: linear-gradient(90deg, #ffd6db 0%, #f7b7a3 100%);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  box-shadow: 0 2px 12px #fad0c4aa;
  transition: background 0.2s;
  margin-top: 16px;
}
.profile-btn:hover {
  background: linear-gradient(90deg, #f7b7a3 0%, #ffd6db 100%);
}
</style>
<style>
.el-form-item__label {
  line-height: 20px !important;
  align-items: center;
}
</style>