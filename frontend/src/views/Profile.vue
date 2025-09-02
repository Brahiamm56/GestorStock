<template>
  <div class="profile-page">
    <!-- Breadcrumbs -->
    <nav class="breadcrumbs">
      <span class="breadcrumb-item">Dashboard</span>
      <i class="fas fa-chevron-right breadcrumb-separator"></i>
      <span class="breadcrumb-item active">Mi Perfil</span>
    </nav>

    <!-- Header del perfil -->
    <div class="profile-header">
      <div class="profile-header-content">
        <div class="profile-image-section">
          <ProfileImageUpload
            :current-image="userProfileImage"
            :user-name="form.name"
            :uploading="uploadingImage"
            @image-selected="handleImageSelected"
            @image-removed="handleImageRemoved"
          />
        </div>
        
        <div class="profile-info-header">
          <h1 class="profile-name">{{ form.name || 'Usuario' }}</h1>
          <div class="profile-role">
            <i class="fas fa-crown"></i>
            <span>{{ getRoleText(authStore.user?.role) }}</span>
          </div>
          <div class="profile-status">
            <span class="status-badge" :class="getStatusClass()">
              <i class="fas fa-circle"></i>
              {{ authStore.user?.is_active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="profile-content">
      <!-- Información personal -->
      <div class="profile-section">
        <h2 class="section-title">
          <i class="fas fa-user"></i>
          Información Personal
        </h2>
        
        <div class="info-grid">
          <ProfileInfoCard
            class="email"
            title="Email"
            subtitle="Dirección de correo electrónico"
            :value="form.email"
            icon="fas fa-envelope"
            :editable="true"
            @edit="editField('email')"
          />
          
          <ProfileInfoCard
            class="role"
            title="Rol"
            subtitle="Nivel de acceso en el sistema"
            :value="getRoleText(authStore.user?.role)"
            icon="fas fa-user-shield"
            :editable="false"
          />
          
          <ProfileInfoCard
            class="status"
            title="Estado"
            subtitle="Estado de la cuenta"
            :value="authStore.user?.is_active ? 'Activo' : 'Inactivo'"
            icon="fas fa-check-circle"
            :editable="false"
          />
          
          <ProfileInfoCard
            class="login"
            title="Último Login"
            subtitle="Última vez que accedió"
            :value="formatDate(authStore.user?.last_login)"
            icon="fas fa-clock"
            :editable="false"
          />
        </div>
      </div>

      <!-- Formulario de edición -->
      <div v-if="editingField" class="profile-section">
        <div class="edit-form-container">
          <h3 class="edit-form-title">
            <i class="fas fa-edit"></i>
            Editar {{ getFieldLabel(editingField) }}
          </h3>
          
          <form @submit.prevent="handleFieldUpdate" class="edit-form">
            <div class="form-group">
              <label :for="editingField" class="form-label">
                {{ getFieldLabel(editingField) }}
              </label>
              <input
                :id="editingField"
                v-model="editForm[editingField]"
                :type="getFieldType(editingField)"
                class="form-input"
                :placeholder="getFieldPlaceholder(editingField)"
                required
              />
            </div>
            
            <div class="form-actions">
              <ModernButton
                variant="secondary"
                size="medium"
                @click="cancelEdit"
              >
                Cancelar
              </ModernButton>
              
              <ModernButton
                variant="primary"
                size="medium"
                :loading="updatingField"
                @click="handleFieldUpdate"
              >
                Guardar Cambios
              </ModernButton>
            </div>
          </form>
        </div>
      </div>

      <!-- Acciones del perfil -->
      <div class="profile-section">
        <div class="profile-actions">
          <ModernButton
            variant="primary"
            size="large"
            :loading="loading"
            :success="updateSuccess"
            @click="handleSubmit"
            icon="fas fa-save"
          >
            Actualizar Perfil
          </ModernButton>
          
          <ModernButton
            variant="ghost"
            size="medium"
            @click="refreshProfile"
            icon="fas fa-refresh"
          >
            Actualizar Datos
          </ModernButton>
        </div>
      </div>
    </div>

    <!-- Toast de éxito -->
    <div v-if="showSuccessToast" class="success-toast">
      <div class="toast-content">
        <i class="fas fa-check-circle"></i>
        <span>Perfil actualizado correctamente</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'
import ProfileImageUpload from '@/components/ProfileImageUpload.vue'
import ProfileInfoCard from '@/components/ProfileInfoCard.vue'
import ModernButton from '@/components/ModernButton.vue'

export default {
  name: 'Profile',
  components: {
    ProfileImageUpload,
    ProfileInfoCard,
    ModernButton
  },
  setup() {
    const authStore = useAuthStore()
    const loading = ref(false)
    const uploadingImage = ref(false)
    const updatingField = ref(false)
    const updateSuccess = ref(false)
    const showSuccessToast = ref(false)
    const editingField = ref(null)
    
    const form = reactive({
      name: '',
      email: ''
    })
    
    const editForm = reactive({
      name: '',
      email: ''
    })
    
    // Computed properties
    const userProfileImage = computed(() => {
      return authStore.user?.profile_image || null
    })
    
    // Methods
    const loadProfile = () => {
      if (authStore.user) {
        form.name = authStore.user.name
        form.email = authStore.user.email
      }
    }
    
    const handleSubmit = async () => {
      try {
        loading.value = true
        
        const success = await authStore.updateProfile(form)
        if (success) {
          updateSuccess.value = true
          showSuccessToast.value = true
          
          setTimeout(() => {
            updateSuccess.value = false
            showSuccessToast.value = false
          }, 3000)
          
          toast.success('Perfil actualizado correctamente')
        }
      } catch (error) {
        console.error('Error al actualizar perfil:', error)
        toast.error('Error al actualizar perfil')
      } finally {
        loading.value = false
      }
    }
    
    const handleImageSelected = async (imageData) => {
      if (imageData.error) {
        toast.error(imageData.error)
        return
      }
      
      try {
        uploadingImage.value = true
        
        const success = await authStore.updateProfileImage(imageData.file)
        if (success) {
          // La imagen se actualizó correctamente en el store
          // No necesitamos hacer nada más aquí
        }
      } catch (error) {
        console.error('Error al subir imagen:', error)
        toast.error('Error al subir imagen')
      } finally {
        uploadingImage.value = false
      }
    }
    
    const handleImageRemoved = () => {
      toast.info('Imagen de perfil removida')
    }
    
    const editField = (field) => {
      editingField.value = field
      editForm[field] = form[field]
    }
    
    const cancelEdit = () => {
      editingField.value = null
      editForm.name = ''
      editForm.email = ''
    }
    
    const handleFieldUpdate = async () => {
      try {
        updatingField.value = true
        
        // Validar el campo
        if (editingField.value === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(editForm.email)) {
            toast.error('Email inválido')
            return
          }
        }
        
        // Actualizar el campo
        form[editingField.value] = editForm[editingField.value]
        
        // Aquí se implementaría la actualización en el backend
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        toast.success('Campo actualizado correctamente')
        editingField.value = null
        editForm.name = ''
        editForm.email = ''
        
      } catch (error) {
        console.error('Error al actualizar campo:', error)
        toast.error('Error al actualizar campo')
      } finally {
        updatingField.value = false
      }
    }
    
    const refreshProfile = () => {
      loadProfile()
      toast.info('Datos del perfil actualizados')
    }
    
    const getRoleText = (role) => {
      return role === 'admin' ? 'Administrador' : 'Usuario'
    }
    
    const formatDate = (date) => {
      if (!date) return 'Nunca'
      return format(new Date(date), 'dd/MM/yyyy HH:mm')
    }
    
    const getStatusClass = () => {
      return authStore.user?.is_active ? 'status-active' : 'status-inactive'
    }
    
    const getFieldLabel = (field) => {
      const labels = {
        name: 'Nombre',
        email: 'Email'
      }
      return labels[field] || field
    }
    
    const getFieldType = (field) => {
      const types = {
        name: 'text',
        email: 'email'
      }
      return types[field] || 'text'
    }
    
    const getFieldPlaceholder = (field) => {
      const placeholders = {
        name: 'Tu nombre completo',
        email: 'tu@email.com'
      }
      return placeholders[field] || ''
    }
    
    // Lifecycle
    onMounted(() => {
      loadProfile()
    })
    
    return {
      authStore,
      form,
      editForm,
      loading,
      uploadingImage,
      updatingField,
      updateSuccess,
      showSuccessToast,
      editingField,
      userProfileImage,
      handleSubmit,
      handleImageSelected,
      handleImageRemoved,
      editField,
      cancelEdit,
      handleFieldUpdate,
      refreshProfile,
      getRoleText,
      formatDate,
      getStatusClass,
      getFieldLabel,
      getFieldType,
      getFieldPlaceholder
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg-cream-primary);
  padding: 0;
}

/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 32px 16px;
  font-size: 14px;
  color: #64748b;
}

.breadcrumb-item {
  font-weight: 500;
  transition: color 0.2s ease;
}

.breadcrumb-item.active {
  color: #3b82f6;
  font-weight: 600;
}

.breadcrumb-separator {
  font-size: 12px;
  color: #cbd5e1;
}

/* Header del perfil */
.profile-header {
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-light);
  padding: 40px 32px;
  margin-bottom: 32px;
  box-shadow: var(--header-shadow);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.profile-header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 32px;
}

.profile-image-section {
  flex-shrink: 0;
}

.profile-info-header {
  flex: 1;
}

.profile-name {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.profile-role {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 8px;
}

.profile-role i {
  color: #f59e0b;
  font-size: 16px;
}

.profile-status {
  margin-top: 16px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.status-active {
  background: #ecfdf5;
  color: #059669;
}

.status-badge.status-active i {
  color: #10b981;
  font-size: 8px;
}

.status-badge.status-inactive {
  background: #fef2f2;
  color: #dc2626;
}

.status-badge.status-inactive i {
  color: #ef4444;
  font-size: 8px;
}

/* Contenido principal */
.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 40px;
}

.profile-section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.section-title i {
  color: #3b82f6;
  font-size: 20px;
}

/* Grid de información */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

/* Formulario de edición */
.edit-form-container {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.edit-form-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
}

.edit-form-title i {
  color: #3b82f6;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  color: #1e293b;
  background: white;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

/* Acciones del perfil */
.profile-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

/* Toast de éxito */
.success-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  background: #10b981;
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.toast-content i {
  font-size: 18px;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .profile-header-content {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  
  .info-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 0;
  }
  
  .breadcrumbs {
    padding: 20px 20px 12px;
  }
  
  .profile-header {
    padding: 32px 20px;
    margin-bottom: 24px;
  }
  
  .profile-content {
    padding: 0 20px 32px;
  }
  
  .profile-name {
    font-size: 28px;
  }
  
  .section-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .edit-form-container {
    padding: 24px;
  }
  
  .profile-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .success-toast {
    top: 16px;
    right: 16px;
    left: 16px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .profile-header {
    padding: 24px 16px;
  }
  
  .profile-content {
    padding: 0 16px 24px;
  }
  
  .edit-form-container {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
