<template>
  <div class="bar-chart-container" ref="chartContainer">
    <canvas ref="chartCanvas"></canvas>
    
    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue'

export default {
  name: 'BarChart',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 200
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['bar-click'],
  setup(props, { emit }) {
    const chartContainer = ref(null)
    const chartCanvas = ref(null)
    let ctx = null

    // Chart configuration with consistent colors
    const config = {
      padding: { top: 20, right: 20, bottom: 40, left: 40 },
      colors: ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#3B82F6'], // Consistent with DonutChart
      barSpacing: 4,
      borderRadius: 4
    }

    // Initialize chart
    const initChart = () => {
      if (!chartCanvas.value) return
      
      ctx = chartCanvas.value.getContext('2d')
      
      // Set canvas size
      chartCanvas.value.width = props.width
      chartCanvas.value.height = props.height
      
      console.log('📊 BarChart - Canvas inicializado:', {
        width: props.width,
        height: props.height
      })
      
      drawChart()
    }

    // Draw the complete chart
    const drawChart = () => {
      if (!ctx || !props.data || props.data.length === 0) {
        console.log('📊 BarChart - No hay datos o contexto')
        return
      }

      console.log('📊 BarChart - Dibujando gráfico con datos:', props.data)

      // Clear canvas
      ctx.clearRect(0, 0, props.width, props.height)
      
      // Set background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, props.width, props.height)

      // Calculate chart area
      const chartArea = {
        x: config.padding.left,
        y: config.padding.top,
        width: props.width - config.padding.left - config.padding.right,
        height: props.height - config.padding.top - config.padding.bottom
      }

      // Filter valid data
      const validData = props.data.filter(item => 
        item && 
        typeof item.revenue === 'number' && 
        isFinite(item.revenue) && 
        item.revenue >= 0
      )

      if (validData.length === 0) {
        console.log('📊 BarChart - No hay datos válidos')
        drawNoDataMessage(chartArea)
        return
      }

      const maxValue = Math.max(...validData.map(d => d.revenue))
      console.log('📊 BarChart - maxValue:', maxValue)

      // Draw grid
      drawGrid(chartArea, maxValue)

      // Draw bars
      const barWidth = (chartArea.width - (validData.length - 1) * config.barSpacing) / validData.length
      
      validData.forEach((item, index) => {
        drawBar(item, index, chartArea, maxValue, barWidth)
      })

      // Draw labels
      drawLabels(chartArea, barWidth)
    }

    // Draw grid lines
    const drawGrid = (chartArea, maxValue) => {
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])

      const gridLines = 5
      for (let i = 0; i <= gridLines; i++) {
        const y = chartArea.y + (i * chartArea.height) / gridLines
        
        ctx.beginPath()
        ctx.moveTo(chartArea.x, y)
        ctx.lineTo(chartArea.x + chartArea.width, y)
        ctx.stroke()
      }
      
      ctx.setLineDash([])
    }

    // Draw individual bar
    const drawBar = (item, index, chartArea, maxValue, barWidth) => {
      const barHeight = maxValue > 0 ? (item.revenue / maxValue) * chartArea.height : 0
      const barX = chartArea.x + index * (barWidth + config.barSpacing)
      const barY = chartArea.y + chartArea.height - barHeight

      console.log(`📊 BarChart - Barra ${index}:`, {
        revenue: item.revenue,
        barHeight: barHeight,
        barX: barX,
        barY: barY,
        barWidth: barWidth
      })

      // Create gradient
      const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight)
      gradient.addColorStop(0, config.colors[index % config.colors.length])
      gradient.addColorStop(1, adjustColor(config.colors[index % config.colors.length], -20))

      // Draw bar with rounded corners
      drawRoundedRect(barX, barY, barWidth, barHeight, config.borderRadius, gradient)

      // Draw bar border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.strokeRect(barX, barY, barWidth, barHeight)
    }

    // Draw rounded rectangle
    const drawRoundedRect = (x, y, width, height, radius, fillStyle) => {
      ctx.save()
      ctx.fillStyle = fillStyle
      
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
      ctx.fill()
      
      ctx.restore()
    }

    // Draw month labels
    const drawLabels = (chartArea, barWidth) => {
      ctx.fillStyle = '#6b7280'
      ctx.font = '12px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      props.data.forEach((item, index) => {
        const x = chartArea.x + index * (barWidth + config.barSpacing) + barWidth / 2
        const y = chartArea.y + chartArea.height + 10
        
        ctx.fillText(item.month, x, y)
      })
    }

    // Draw no data message
    const drawNoDataMessage = (chartArea) => {
      ctx.fillStyle = '#9ca3af'
      ctx.font = '14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      ctx.fillText('No hay datos disponibles', 
        chartArea.x + chartArea.width / 2, 
        chartArea.y + chartArea.height / 2)
    }

    // Adjust color brightness
    const adjustColor = (color, amount) => {
      const usePound = color[0] === '#'
      const col = usePound ? color.slice(1) : color
      const num = parseInt(col, 16)
      let r = (num >> 16) + amount
      let g = (num >> 8 & 0x00FF) + amount
      let b = (num & 0x0000FF) + amount
      r = r > 255 ? 255 : r < 0 ? 0 : r
      g = g > 255 ? 255 : g < 0 ? 0 : g
      b = b > 255 ? 255 : b < 0 ? 0 : b
      return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0')
    }

    // Watch for data changes
    watch(() => props.data, () => {
      nextTick(() => {
        drawChart()
      })
    }, { deep: true })

    // Función para refrescar el gráfico
    const refreshChart = () => {
      console.log('🔄 Refrescando BarChart...')
      nextTick(() => {
        initChart()
        drawChart()
      })
    }

    // Lifecycle
    onMounted(() => {
      if (chartCanvas.value) {
        initChart()
      } else {
        setTimeout(() => {
          initChart()
        }, 100)
      }
    })

    return {
      chartContainer,
      chartCanvas,
      refreshChart
    }
  }
}
</script>

<style scoped>
.bar-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.bar-chart-container canvas {
  display: block;
  width: 100%;
  height: 100%;
  background: transparent;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Animación para el botón de reload */
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