<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="450px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="confirm-content">
      <div class="icon-container" :class="type">
        <el-icon v-if="type === 'danger'" class="icon">
          <Warning />
        </el-icon>
        <el-icon v-else-if="type === 'warning'" class="icon">
          <InfoFilled />
        </el-icon>
        <el-icon v-else class="icon">
          <QuestionFilled />
        </el-icon>
      </div>
      <p class="message">{{ message }}</p>
      <p v-if="detail" class="detail">{{ detail }}</p>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" :disabled="loading">
          {{ cancelText }}
        </el-button>
        <el-button
          :type="confirmButtonType"
          @click="handleConfirm"
          :loading="loading"
        >
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Warning, InfoFilled, QuestionFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmar acción'
  },
  message: {
    type: String,
    required: true
  },
  detail: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'warning', // danger, warning, info
    validator: (value) => ['danger', 'warning', 'info'].includes(value)
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const confirmButtonType = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'danger'
    case 'warning':
      return 'warning'
    default:
      return 'primary'
  }
})

async function handleConfirm() {
  loading.value = true
  try {
    await emit('confirm')
    visible.value = false
  } catch (error) {
    console.error('Error en confirmación:', error)
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  emit('cancel')
  visible.value = false
}
</script>

<style scoped>
.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.icon-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.icon-container.danger {
  background: #fee2e2;
}

.icon-container.warning {
  background: #fef3c7;
}

.icon-container.info {
  background: #dbeafe;
}

.icon {
  font-size: 40px;
}

.icon-container.danger .icon {
  color: #dc2626;
}

.icon-container.warning .icon {
  color: #d97706;
}

.icon-container.info .icon {
  color: #2563eb;
}

.message {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.detail {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
