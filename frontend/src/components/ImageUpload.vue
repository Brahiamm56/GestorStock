<template>
  <div class="image-upload">
    <div class="upload-area" @click="triggerFileInput" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileChange"
        style="display: none"
      />
      
      <div v-if="!imagePreview && !modelValue" class="upload-placeholder">
        <el-icon class="upload-icon"><Upload /></el-icon>
        <p class="upload-text">Haz clic o arrastra una imagen aquí</p>
        <p class="upload-hint">Formatos: JPG, PNG, GIF, WEBP, SVG (máx. 5MB)</p>
      </div>
      
      <div v-else-if="imagePreview" class="image-preview">
        <img :src="imagePreview" alt="Preview" class="preview-image" />
        <div class="image-overlay">
          <el-button type="primary" size="small" @click="triggerFileInput">
            <el-icon><Edit /></el-icon>
            Cambiar
          </el-button>
          <el-button type="danger" size="small" @click="removeImage">
            <el-icon><Delete /></el-icon>
            Eliminar
          </el-button>
        </div>
      </div>
      
             <div v-else-if="modelValue" class="image-preview">
         <img :src="getImageUrl(modelValue)" alt="Current image" class="preview-image" />
         <div class="image-overlay">
           <el-button type="primary" size="small" @click="triggerFileInput">
             <el-icon><Edit /></el-icon>
             Cambiar
           </el-button>
           <el-button type="danger" size="small" @click="removeImage">
             <el-icon><Delete /></el-icon>
             Eliminar
           </el-button>
         </div>
       </div>
    </div>
    
    <div v-if="error" class="upload-error">
      <el-icon><Warning /></el-icon>
      <span>{{ error }}</span>
    </div>
    
    <div v-if="uploading" class="upload-progress">
      <el-progress :percentage="uploadProgress" />
      <p>Subiendo imagen...</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { Upload, Edit, Delete, Warning } from '@element-plus/icons-vue'
import { getImageUrl } from '@/config/api'

export default {
  name: 'ImageUpload',
  components: {
    Upload,
    Edit,
    Delete,
    Warning
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    maxSize: {
      type: Number,
      default: 5 * 1024 * 1024 // 5MB
    },
    acceptedFormats: {
      type: Array,
      default: () => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    }
  },
  emits: ['update:modelValue', 'file-selected'],
  setup(props, { emit }) {
    const fileInput = ref(null)
    const imagePreview = ref('')
    const error = ref('')
    const uploading = ref(false)
    const uploadProgress = ref(0)

    const triggerFileInput = () => {
      fileInput.value?.click()
    }

    const validateFile = (file) => {
      // Validar formato
      if (!props.acceptedFormats.includes(file.type)) {
        throw new Error('Formato de archivo no válido. Solo se permiten imágenes.')
      }

      // Validar tamaño
      if (file.size > props.maxSize) {
        throw new Error(`El archivo es demasiado grande. Máximo ${props.maxSize / (1024 * 1024)}MB.`)
      }

      return true
    }

    const createPreview = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve(e.target.result)
        }
        reader.readAsDataURL(file)
      })
    }

    const handleFileChange = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      try {
        error.value = ''
        validateFile(file)
        
        uploading.value = true
        uploadProgress.value = 0

        // Simular progreso de carga
        const progressInterval = setInterval(() => {
          if (uploadProgress.value < 90) {
            uploadProgress.value += 10
          }
        }, 100)

        // Crear preview
        const preview = await createPreview(file)
        imagePreview.value = preview

        // Emitir evento con el archivo
        emit('file-selected', file)
        
        // Simular finalización de carga
        setTimeout(() => {
          uploadProgress.value = 100
          clearInterval(progressInterval)
          setTimeout(() => {
            uploading.value = false
            uploadProgress.value = 0
          }, 500)
        }, 1000)

      } catch (err) {
        error.value = err.message
        uploading.value = false
        uploadProgress.value = 0
      }
    }

    const handleDrop = async (event) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (!file) return

      // Simular el evento change
      const fakeEvent = { target: { files: [file] } }
      await handleFileChange(fakeEvent)
    }

    // Usar la función getImageUrl importada desde la configuración

    const removeImage = () => {
      imagePreview.value = ''
      error.value = ''
      uploading.value = false
      uploadProgress.value = 0
      emit('update:modelValue', '')
      emit('file-selected', null)
      
      // Limpiar input
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    // Limpiar error cuando cambie el modelo
    watch(() => props.modelValue, () => {
      if (props.modelValue) {
        error.value = ''
      }
    })

    return {
      fileInput,
      imagePreview,
      error,
      uploading,
      uploadProgress,
      triggerFileInput,
      handleFileChange,
      handleDrop,
      removeImage,
      getImageUrl
    }
  }
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.upload-area:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
}

.upload-text {
  margin: 0;
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.upload-hint {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.upload-error {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f56c6c;
  font-size: 14px;
}

.upload-progress {
  margin-top: 12px;
}

.upload-progress p {
  margin: 8px 0 0 0;
  text-align: center;
  color: #606266;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .upload-area {
    min-height: 150px;
    padding: 16px;
  }

  .image-preview {
    height: 150px;
  }

  .image-overlay {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.7);
  }
}
</style>
