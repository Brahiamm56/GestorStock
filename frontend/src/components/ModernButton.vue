<template>
  <button
    :class="[
      'modern-button',
      `modern-button--${variant}`,
      `modern-button--${size}`,
      { 'modern-button--loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
    type="button"
  >
    <div class="button-content">
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
      </div>
      
      <i v-else-if="icon" :class="icon" class="button-icon"></i>
      
      <span class="button-text">
        <slot>{{ text }}</slot>
      </span>
      
      <i v-if="loading && success" class="fas fa-check success-icon"></i>
    </div>
  </button>
</template>

<script>
export default {
  name: 'ModernButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'success', 'danger', 'ghost'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: null
    },
    text: {
      type: String,
      default: ''
    },
    success: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const handleClick = (event) => {
      if (!props.loading && !props.disabled) {
        emit('click', event)
      }
    }
    
    return {
      handleClick
    }
  }
}
</script>

<style scoped>
.modern-button {
  position: relative;
  border: none;
  border-radius: 12px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  overflow: hidden;
  user-select: none;
  white-space: nowrap;
}

.modern-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modern-button:active:not(:disabled) {
  transform: scale(0.98);
}

/* Variantes */
.modern-button--primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
}

.modern-button--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
  transform: translateY(-1px);
}

.modern-button--secondary {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.modern-button--secondary:hover:not(:disabled) {
  border-color: #d1d5db;
  background: #f9fafb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.modern-button--success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.modern-button--success:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
  transform: translateY(-1px);
}

.modern-button--danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
}

.modern-button--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
  transform: translateY(-1px);
}

.modern-button--ghost {
  background: transparent;
  color: #6b7280;
  border: 2px solid transparent;
}

.modern-button--ghost:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

/* Tamaños */
.modern-button--small {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 36px;
}

.modern-button--medium {
  padding: 12px 24px;
  font-size: 16px;
  min-height: 48px;
}

.modern-button--large {
  padding: 16px 32px;
  font-size: 18px;
  min-height: 56px;
}

/* Estados */
.modern-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.modern-button--loading {
  cursor: wait;
}

.modern-button--loading .button-text {
  opacity: 0.7;
}

/* Contenido del botón */
.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
}

.button-icon {
  font-size: 1em;
}

.button-text {
  font-weight: 600;
  letter-spacing: -0.025em;
}

/* Loading spinner */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.modern-button--secondary .spinner {
  border-color: rgba(55, 65, 81, 0.3);
  border-top-color: #374151;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Success icon */
.success-icon {
  color: #10b981;
  animation: successPop 0.3s ease-out;
}

@keyframes successPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modern-button--medium {
    padding: 10px 20px;
    font-size: 15px;
    min-height: 44px;
  }
  
  .modern-button--large {
    padding: 14px 28px;
    font-size: 16px;
    min-height: 48px;
  }
}

/* Focus ring para accesibilidad */
.modern-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Hover states mejorados */
.modern-button--primary:focus-visible {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 6px 20px rgba(59, 130, 246, 0.35);
}

.modern-button--secondary:focus-visible {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
