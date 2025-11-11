<template>
  <div class="empty-state">
    <div class="empty-icon-container">
      <component :is="getIcon" class="empty-icon" />
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description">{{ description }}</p>
    <el-button 
      v-if="buttonText" 
      type="primary" 
      @click="$emit('action')"
      class="empty-button"
    >
      <el-icon class="button-icon">
        <Plus />
      </el-icon>
      {{ buttonText }}
    </el-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Box, 
  ShoppingCart, 
  User, 
  Document,
  Folder,
  Plus
} from '@element-plus/icons-vue'

const props = defineProps({
  type: {
    type: String,
    default: 'default', // products, sales, users, documents, custom
    validator: (value) => ['default', 'products', 'sales', 'users', 'documents', 'custom'].includes(value)
  },
  title: {
    type: String,
    default: 'No hay datos'
  },
  description: {
    type: String,
    default: 'Comienza agregando el primer registro'
  },
  buttonText: {
    type: String,
    default: ''
  },
  customIcon: {
    type: Object,
    default: null
  }
})

defineEmits(['action'])

const getIcon = computed(() => {
  if (props.customIcon) return props.customIcon
  
  switch (props.type) {
    case 'products':
      return Box
    case 'sales':
      return ShoppingCart
    case 'users':
      return User
    case 'documents':
      return Document
    default:
      return Folder
  }
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  min-height: 400px;
}

.empty-icon-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fffbf5 0%, #fff7ed 100%);
  border: 3px solid #fed7aa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-icon {
  font-size: 48px;
  color: #fb923c;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.empty-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 32px 0;
  max-width: 400px;
  line-height: 1.6;
}

.empty-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
}

.button-icon {
  font-size: 18px;
}
</style>
