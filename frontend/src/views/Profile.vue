<template>
  <div class="profile-bg">
    <div class="profile-sections">
      <!-- Información básica -->
      <div class="profile-card">
        <h2 class="section-title">Información básica</h2>
        <div class="profile-basic-flex">
          <div class="profile-photo-block">
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
            <el-button
              class="edit-photo-btn"
              type="primary"
              size="small"
              @click="triggerImageUpload"
              style="margin-top: 8px;"
            >
              Editar
            </el-button>
          </div>
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="auto"
            @submit.prevent="handleSubmit"
            class="profile-basic-form"
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
      </div>

      <!-- Información de contacto -->
      <div class="profile-card">
        <h2 class="section-title">Información de contacto</h2>
        <el-form :model="form" label-width="140px">
          <el-form-item label="Email">
            <el-input v-model="form.email" disabled />
          </el-form-item>
          <el-form-item label="Teléfono">
            <el-input v-model="form.phone" placeholder="Tu número de teléfono" />
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
      </div>
      <el-button class="profile-btn" type="primary" @click="handleSubmit" :loading="loading">
        Guardar cambios
      </el-button>
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
      gender: '',
      phone: ''
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
        form.phone = authStore.user.phone || ''
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
.profile-basic-flex {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 40px;
}
.profile-photo-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 140px;
  max-width: 180px;
  flex: 0 0 160px;
}
.profile-basic-form {
  flex: 1 1 0%;
  min-width: 0;
}
.profile-label {
  color: var(--text-color-regular);
  font-size: 1rem;
  min-width: 120px;
}
.profile-avatar {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffd6db;
  background: #fafafa;
  cursor: pointer;
}
.edit-photo-btn {
  background: none;
  color: var(--text-color-regular);
  border-radius: 8px;
  border: none;
  font-size: 0.95rem;
  padding: 4px 18px;
  margin-left: 0;
  transition: background 0.2s;
}
.edit-photo-btn:hover {
  color: var(--primary-color);
  text-decoration: underline;
  filter: brightness(0.92);
}
.profile-btn {
  width: 100%;
  padding: 0.8rem 0;
  border-radius: 12px;
  background: var(--primary-color);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  box-shadow: 0 2px 12px #fad0c4aa;
  transition: background 0.2s;
  margin-top: 16px;
}
.profile-btn:hover {
  background: var(--primary-color);
  filter: brightness(0.92);
}
</style>
<style>
.profile-basic-form .el-form-item__label {
  align-items: center;
  line-height: 20px;
  text-align: left !important;
  justify-content: flex-start !important;
}
</style>