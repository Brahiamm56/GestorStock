<template>
  <div class="donut-chart-container">
    <div class="chart-wrapper">
      <!-- Chart -->
      <div class="donut-chart">
        <canvas ref="chartCanvas" :width="config.size" :height="config.size"></canvas>
      </div>
      
      <!-- Legend -->
      <div class="order-stats-legend" v-if="paymentMethodsData.length > 0">
        <div 
          v-for="(item, index) in paymentMethodsData" 
          :key="index"
          class="legend-item"
          :class="{ 'legend-item-disabled': item.value === 0 }"
        >
          <div 
            class="legend-dot" 
            :style="{ backgroundColor: item.value > 0 ? item.color : '#e5e7eb' }"
          ></div>
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-value">{{ item.value }}</span>
          <span class="legend-percentage">{{ getPercentage(item) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

export default {
  name: 'DonutChart',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    size: {
      type: Number,
      default: 200
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    
    // Configuración del gráfico
    const config = {
      size: 200,
      centerX: 100,
      centerY: 100,
      radius: 75,
      innerRadius: 37,
      colors: ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    }
    
    // Datos de métodos de pago
    const paymentMethodsData = computed(() => {
      if (!props.data || props.data.length === 0) {
        return [
          { label: 'Efectivo', value: 0, color: '#10B981' },
          { label: 'Tarjeta', value: 0, color: '#F59E0B' },
          { label: 'Transferencia', value: 0, color: '#EF4444' },
          { label: 'Mercado Pago', value: 0, color: '#8B5CF6' }
        ]
      }
      
      return props.data.map((item, index) => ({
        label: item.label || item.name,
        value: item.value || item.count || 0,
        color: config.colors[index % config.colors.length]
      }))
    })
    
    // Total de ventas
    const totalSales = computed(() => {
      return paymentMethodsData.value.reduce((sum, item) => sum + item.value, 0)
    })
    
    // Función para obtener porcentaje
    const getPercentage = (item) => {
      if (totalSales.value === 0) return 0
      return Math.round((item.value / totalSales.value) * 100)
    }
    
    // Inicializar canvas
    const initChart = () => {
      if (!chartCanvas.value) return
      
      const canvas = chartCanvas.value
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      // Configurar canvas
      canvas.width = config.size
      canvas.height = config.size
      
      // Configurar contexto
      ctx.clearRect(0, 0, config.size, config.size)
    }
    
    // Dibujar gráfico
    const drawChart = () => {
      if (!chartCanvas.value) return
      
      const ctx = chartCanvas.value.getContext('2d')
      if (!ctx) return
      
      ctx.clearRect(0, 0, config.size, config.size)
      
      const validData = paymentMethodsData.value.filter(item => item.value > 0)
      
      if (validData.length === 0) {
        drawNoDataMessage(ctx)
        return
      }
      
      const totalValue = validData.reduce((sum, item) => sum + item.value, 0)
      let currentAngle = -Math.PI / 2 // Empezar desde arriba
      
      validData.forEach((item, index) => {
        const segmentAngle = (item.value / totalValue) * 2 * Math.PI
        
        // Dibujar segmento
        ctx.beginPath()
        ctx.arc(config.centerX, config.centerY, config.radius, currentAngle, currentAngle + segmentAngle)
        ctx.arc(config.centerX, config.centerY, config.innerRadius, currentAngle + segmentAngle, currentAngle, true)
        ctx.closePath()
        
        // Relleno con color
        ctx.fillStyle = item.color
        ctx.fill()
        
        // Borde sutil
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
        
        currentAngle += segmentAngle
      })
    }
    
    // Mensaje sin datos
    const drawNoDataMessage = (ctx) => {
      ctx.fillStyle = '#9ca3af'
      ctx.font = '14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('No hay datos disponibles', config.centerX, config.centerY)
    }
    
    // Función para refrescar el gráfico
    const refreshChart = () => {
      console.log('🔄 Refrescando DonutChart...')
      nextTick(() => {
        initChart()
        drawChart()
      })
    }
    
    // Watchers
    watch(() => props.data, () => {
      nextTick(() => {
        initChart()
        drawChart()
      })
    }, { deep: true })
    
    watch(paymentMethodsData, () => {
      nextTick(() => {
        drawChart()
      })
    }, { deep: true })
    
    // Montar componente
    onMounted(() => {
      nextTick(() => {
        initChart()
        drawChart()
        
        // Re-inicializar después de un delay
        setTimeout(() => {
          initChart()
          drawChart()
        }, 300)
      })
    })
    
    return {
      chartCanvas,
      paymentMethodsData,
      totalSales,
      getPercentage,
      refreshChart,
      config
    }
  }
}
</script>

<style scoped>
.donut-chart-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 16px;
}

.chart-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.donut-chart {
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.order-stats-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  flex: 1;
  padding: 8px 0px;
}

.legend-item {
  display: grid;
  grid-template-columns: 12px 1fr auto auto;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  min-width: fit-content;
  flex-shrink: 0;
  width: 100%;
}

.legend-item:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.legend-item-disabled {
  opacity: 0.6;
}

.legend-item-disabled:hover {
  background-color: transparent;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.legend-item:hover .legend-dot {
  transform: scale(1.1);
}

.legend-label {
  color: #374151;
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
  overflow: visible;
  text-overflow: unset;
  min-width: max-content;
}

.legend-value {
  color: #6b7280;
  font-weight: 600;
  font-size: 11px;
  min-width: 20px;
  text-align: right;
  font-family: 'Inter', monospace;
  flex-shrink: 0;
}

.legend-percentage {
  color: #8b5cf6;
  font-weight: 700;
  font-size: 11px;
  min-width: 32px;
  text-align: right;
  font-family: 'Inter', monospace;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .chart-wrapper {
    flex-direction: column;
    gap: 20px;
  }
  
  .donut-chart {
    width: 180px;
    height: 180px;
  }
  
  .order-stats-legend {
    gap: 10px;
    padding: 6px 12px;
  }
  
  .legend-item {
    grid-template-columns: 10px 1fr auto auto;
    gap: 6px;
    padding: 6px 10px;
    font-size: 11px;
  }
  
  .legend-dot {
    width: 8px;
    height: 8px;
  }
  
  .legend-label {
    font-size: 11px;
  }
  
  .legend-value,
  .legend-percentage {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .donut-chart-container {
    padding: 12px;
  }
  
  .chart-wrapper {
    gap: 16px;
  }
  
  .donut-chart {
    width: 160px;
    height: 160px;
  }
  
  .order-stats-legend {
    gap: 8px;
  }
  
  .legend-item {
    grid-template-columns: 8px 1fr auto auto;
    gap: 4px;
    padding: 4px 8px;
    font-size: 10px;
  }
  
  .legend-dot {
    width: 6px;
    height: 6px;
  }
}

/* Animación para el botón de reload */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.refresh-button {
  transition: all 0.3s ease;
}

.refresh-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.refresh-button:active {
  transform: scale(0.95);
}

.refresh-button.rotating {
  animation: spin 0.6s ease-in-out;
}
</style>