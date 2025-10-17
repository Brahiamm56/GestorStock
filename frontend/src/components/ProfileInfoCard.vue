<template>
  <div :class="['profile-info-card', variant]">
    <div class="card-header">
      <div class="card-icon" v-if="iconComponent">
        <component :is="iconComponent" :style="iconStyle" />
      </div>
      <div class="card-title">
        <h3>{{ title }}</h3>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </div>
    </div>
    
    <div class="card-content">
      <slot>
        <div class="info-value">{{ value }}</div>
        <div v-if="description" class="info-description">{{ description }}</div>
      </slot>
    </div>
    
    <div v-if="editable" class="card-actions">
      <button 
        type="button" 
        class="edit-btn"
        @click="$emit('edit')"
        :disabled="loading"
      >
        <i class="fas fa-edit"></i>
        Editar
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { ICONS } from '@/constants/icons'

export default {
  name: 'ProfileInfoCard',
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: null },
    value: { type: String, default: '' },
    description: { type: String, default: null },
    icon: { type: String, default: null },
    iconColor: { type: String, default: '#3b82f6' },
    variant: { type: String, default: '' },
    editable: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  },
  emits: ['edit'],
  setup(props) {
    const iconComponent = computed(() => {
      return props.icon ? ICONS[props.icon] || null : null
    })
    const iconStyle = computed(() => {
      const size = '40px'
      return {
        width: size,
        height: size,
        color: props.iconColor,
        display: 'inline-block'
      }
    })
    return { iconComponent, iconStyle }
  }
}
</script>

<style scoped>
.profile-info-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
}

.profile-info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  border-color: #e2e8f0;
}

.profile-info-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.card-icon {
  width: auto;
  height: auto;
  border-radius: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
}

.card-icon svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
  stroke: none;
}

.card-icon i {
  font-size: 20px;
  color: #3b82f6;
}

.card-title h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}

.card-subtitle {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.card-content {
  margin-bottom: 20px;
}

.info-value {
  font-size: 16px;
  color: #334155;
  font-weight: 500;
  margin-bottom: 8px;
  line-height: 1.4;
}

.info-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.edit-btn {
  background: none;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.edit-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #475569;
}

.edit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.edit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-btn i {
  font-size: 12px;
}

/* Variantes de color para diferentes tipos de información */
.profile-info-card.email .card-icon svg {
  color: #0ea5e9;
}

.profile-info-card.role .card-icon svg {
  color: #f59e0b;
}

.profile-info-card.status .card-icon svg {
  color: #10b981;
}

.profile-info-card.login .card-icon svg {
  color: #8b5cf6;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-info-card {
    padding: 20px;
  }
  
  .card-header {
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .card-icon {
    width: 40px;
    height: 40px;
  }
  
  .card-icon i,
  .card-icon svg {
    font-size: 18px;
  }
  
  .card-title h3 {
    font-size: 16px;
  }
  
  .card-subtitle {
    font-size: 13px;
  }
  
  .info-value {
    font-size: 15px;
  }
}
</style>