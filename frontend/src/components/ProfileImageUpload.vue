<template>
  <div class="profile-image-upload">
    <div 
      class="image-container"
      :class="{ 'has-image': hasImage, 'dragging': isDragging }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <!-- Imagen actual o avatar por defecto -->
      <div v-if="hasImage" class="current-image">
        <img :src="imagePreview" :alt="userName" />
        <div class="image-overlay">
          <div class="overlay-content">
            <i class="fas fa-camera"></i>
            <span>Cambiar foto</span>
          </div>
        </div>
      </div>
      
      <!-- Avatar por defecto con iniciales -->
      <div v-else class="default-avatar">
        <div class="avatar-initials">{{ userInitials }}</div>
        <div class="avatar-overlay">
          <i class="fas fa-camera"></i>
          <span>Agregar foto</span>
        </div>
      </div>
      
      <!-- Loading spinner -->
      <div v-if="uploading" class="upload-loading">
        <div class="spinner"></div>
        <span>Subiendo...</span>
      </div>
      
      <!-- Input file oculto -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        class="file-input"
      />
    </div>
    
    <!-- Información de la imagen -->
    <div class="image-info">
      <p class="image-hint">
        <i class="fas fa-info-circle"></i>
        JPG, PNG o GIF. Máximo 5MB.
      </p>
      <p v-if="hasImage" class="image-actions">
        <button 
          type="button" 
          class="remove-btn"
          @click="removeImage"
          :disabled="uploading"
        >
          <i class="fas fa-trash"></i>
          Eliminar foto
        </button>
      </p>
    </div>
    
    <!-- Modal de crop (opcional para futuras implementaciones) -->
    <div v-if="showCropModal" class="crop-modal">
      <!-- Aquí se implementaría el crop de imagen -->
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'ProfileImageUpload',
  props: {
    currentImage: {
      type: String,
      default: null
    },
    userName: {
      type: String,
      required: true
    },
    uploading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['image-selected', 'image-removed'],
  setup(props, { emit }) {
    const fileInput = ref(null)
    const imagePreview = ref(props.currentImage)
    const isDragging = ref(false)
    const showCropModal = ref(false)
    
    // Computed properties
    const hasImage = computed(() => !!imagePreview.value)
    
    const userInitials = computed(() => {
      if (!props.userName) return 'U'
      return props.userName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })
    
    // Watch for changes in currentImage prop
    watch(() => props.currentImage, (newImage) => {
      imagePreview.value = newImage
    })
    
    // Methods
    const triggerFileInput = () => {
      if (props.uploading) return
      fileInput.value?.click()
    }
    
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        processImageFile(file)
      }
    }
    
    const handleDrop = (event) => {
      event.preventDefault()
      isDragging.value = false
      
      const files = event.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('image/')) {
          processImageFile(file)
        }
      }
    }
    
    const handleDragOver = (event) => {
      event.preventDefault()
    }
    
    const handleDragEnter = (event) => {
      event.preventDefault()
      isDragging.value = true
    }
    
    const handleDragLeave = (event) => {
      event.preventDefault()
      isDragging.value = false
    }
    
    const processImageFile = (file) => {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        emit('image-selected', { error: 'Solo se permiten archivos de imagen' })
        return
      }
      
      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        emit('image-selected', { error: 'La imagen debe ser menor a 5MB' })
        return
      }
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.value = e.target.result
        
        // Emitir evento con el archivo
        emit('image-selected', { 
          file,
          preview: e.target.result,
          success: true
        })
      }
      reader.readAsDataURL(file)
    }
    
    const removeImage = () => {
      imagePreview.value = null
      emit('image-removed')
      
      // Limpiar input file
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }
    
    return {
      fileInput,
      imagePreview,
      isDragging,
      showCropModal,
      hasImage,
      userInitials,
      triggerFileInput,
      handleFileSelect,
      handleDrop,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      removeImage
    }
  }
}
</script>

<style scoped>
.profile-image-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.image-container {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 3px solid #e2e8f0;
  background: #f8fafc;
}

.image-container:hover {
  border-color: #3b82f6;
  transform: scale(1.02);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
}

.image-container.dragging {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: scale(1.05);
}

.image-container.has-image {
  border-color: #10b981;
}

/* Imagen actual */
.current-image {
  position: relative;
  width: 100%;
  height: 100%;
}

.current-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
  color: white;
}

.overlay-content i {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
}

.overlay-content span {
  font-size: 14px;
  font-weight: 500;
}

/* Avatar por defecto */
.default-avatar {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.avatar-initials {
  font-size: 48px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
}

.image-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  font-size: 24px;
  color: white;
  margin-bottom: 8px;
}

.avatar-overlay span {
  font-size: 14px;
  color: white;
  font-weight: 500;
}

/* Loading state */
.upload-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.upload-loading span {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

/* Input file oculto */
.file-input {
  display: none;
}

/* Información de la imagen */
.image-info {
  text-align: center;
  max-width: 300px;
}

.image-hint {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.image-hint i {
  color: #3b82f6;
}

.image-actions {
  margin: 0;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.remove-btn:hover:not(:disabled) {
  background: #fef2f2;
  color: #dc2626;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .image-container {
    width: 120px;
    height: 120px;
  }
  
  .avatar-initials {
    font-size: 36px;
  }
  
  .overlay-content i,
  .avatar-overlay i {
    font-size: 20px;
  }
  
  .overlay-content span,
  .avatar-overlay span {
    font-size: 12px;
  }
}
</style>
