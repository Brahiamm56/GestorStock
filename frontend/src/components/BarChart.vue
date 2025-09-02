<template>
  <div class="bar-chart-container" ref="chartContainer">
    <canvas ref="chartCanvas" :width="chartWidth" :height="chartHeight"></canvas>
    
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
      required: true,
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
  emits: ['barClick', 'barHover'],
  setup(props, { emit }) {
    const chartContainer = ref(null)
    const chartCanvas = ref(null)
    const chartWidth = ref(props.width)
    const chartHeight = ref(props.height)
    
    let ctx = null
    let animationFrame = null
    let hoveredBar = null
    let tooltip = null
    
    // Animation state
    const animationProgress = ref({})
    const isAnimating = ref(false)
    
    // Chart configuration
    const config = {
      padding: { top: 20, right: 30, bottom: 40, left: 50 },
      barWidth: 0,
      barSpacing: 8,
      colors: ['#8B5FBF', '#A478C7', '#6B46C1', '#7C3AED'],
      gridColor: '#f1f5f9',
      textColor: '#64748b',
      borderRadius: 4
    }
    
    // Initialize chart
    const initChart = () => {
      if (!chartCanvas.value) return
      
      ctx = chartCanvas.value.getContext('2d')
      
      // Set canvas size
      chartCanvas.value.width = chartWidth.value
      chartCanvas.value.height = chartHeight.value
      
      // Calculate bar width
      const availableWidth = chartWidth.value - config.padding.left - config.padding.right
      config.barWidth = (availableWidth - (props.data.length - 1) * config.barSpacing) / props.data.length
      
      // Reset animation progress
      props.data.forEach((item, index) => {
        animationProgress.value[index] = 0
      })
      
      drawChart()
    }
    
    // Draw the complete chart
    const drawChart = () => {
      if (!ctx) return
      
      // Clear canvas
      ctx.clearRect(0, 0, chartWidth.value, chartHeight.value)
      
      // Calculate chart dimensions
      const chartArea = {
        x: config.padding.left,
        y: config.padding.top,
        width: chartWidth.value - config.padding.left - config.padding.right,
        height: chartHeight.value - config.padding.top - config.padding.bottom
      }
      
      const maxValue = Math.max(...props.data.map(d => d.revenue))
      
      // Draw grid lines
      drawGrid(chartArea, maxValue)
      
      // Draw bars
      props.data.forEach((item, index) => {
        drawBar(item, index, chartArea, maxValue)
      })
      
      // Draw labels
      drawLabels(chartArea)
    }
    
    // Draw grid lines
    const drawGrid = (chartArea, maxValue) => {
      ctx.strokeStyle = config.gridColor
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
    const drawBar = (item, index, chartArea, maxValue) => {
      const progress = isAnimating.value ? animationProgress.value[index] : 1
      const animatedValue = item.revenue * progress
      
      const barHeight = (animatedValue / maxValue) * chartArea.height
      const barX = chartArea.x + index * (config.barWidth + config.barSpacing)
      const barY = chartArea.y + chartArea.height - barHeight
      
      // Skip drawing if height is 0
      if (barHeight <= 0) return
      
      // Create gradient
      const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight)
      gradient.addColorStop(0, config.colors[index % config.colors.length])
      gradient.addColorStop(1, adjustColor(config.colors[index % config.colors.length], -20))
      
      // Draw bar with rounded corners
      drawRoundedRect(ctx, barX, barY, config.barWidth, barHeight, config.borderRadius, gradient)
      
      // Add hover effect
      if (hoveredBar === index) {
        drawHoverEffect(barX, barY, config.barWidth, barHeight)
      }
    }
    
    // Draw rounded rectangle
    const drawRoundedRect = (ctx, x, y, width, height, radius, fillStyle) => {
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
    
    // Draw hover effect
    const drawHoverEffect = (x, y, width, height) => {
      ctx.save()
      
      // Add shadow
      ctx.shadowColor = 'rgba(139, 95, 191, 0.3)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4
      
      // Draw highlight rectangle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(x - 2, y - 2, width + 4, height + 4)
      
      ctx.restore()
    }
    
    // Draw labels
    const drawLabels = (chartArea) => {
      ctx.fillStyle = config.textColor
      ctx.font = '12px Inter, sans-serif'
      ctx.textAlign = 'center'
      
      props.data.forEach((item, index) => {
        const x = chartArea.x + index * (config.barWidth + config.barSpacing) + config.barWidth / 2
        const y = chartHeight.value - config.padding.bottom + 20
        
        ctx.fillText(item.month, x, y)
      })
    }
    
    // Animate chart on load
    const animateChart = () => {
      isAnimating.value = true
      const duration = 1200
      const startTime = performance.now()
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function (easeOutQuart)
        const easeOut = 1 - Math.pow(1 - progress, 4)
        
        props.data.forEach((item, index) => {
          const delay = index * 100
          const delayedProgress = Math.max(0, (elapsed - delay) / (duration - delay))
          const easedProgress = Math.min(delayedProgress / duration * duration, 1)
          animationProgress.value[index] = easeOut * easedProgress
        })
        
        drawChart()
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        } else {
          isAnimating.value = false
        }
      }
      
      animationFrame = requestAnimationFrame(animate)
    }
    
    // Handle mouse events
    const handleMouseMove = (event) => {
      const rect = chartCanvas.value.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      const chartArea = {
        x: config.padding.left,
        y: config.padding.top,
        width: chartWidth.value - config.padding.left - config.padding.right,
        height: chartHeight.value - config.padding.top - config.padding.bottom
      }
      
      // Find hovered bar
      const barIndex = findHoveredBar(mouseX, mouseY, chartArea)
      
      if (barIndex !== hoveredBar) {
        hoveredBar = barIndex
        drawChart()
        
        if (hoveredBar !== null) {
          showTooltip(event.clientX, event.clientY, props.data[hoveredBar])
          emit('barHover', props.data[hoveredBar], hoveredBar)
        } else {
          hideTooltip()
        }
      }
    }
    
    const handleMouseLeave = () => {
      hoveredBar = null
      drawChart()
      hideTooltip()
    }
    
    const handleClick = (event) => {
      const rect = chartCanvas.value.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      const chartArea = {
        x: config.padding.left,
        y: config.padding.top,
        width: chartWidth.value - config.padding.left - config.padding.right,
        height: chartHeight.value - config.padding.top - config.padding.bottom
      }
      
      const barIndex = findHoveredBar(mouseX, mouseY, chartArea)
      if (barIndex !== null) {
        emit('barClick', props.data[barIndex], barIndex)
      }
    }
    
    // Find which bar is being hovered
    const findHoveredBar = (mouseX, mouseY, chartArea) => {
      for (let i = 0; i < props.data.length; i++) {
        const barX = chartArea.x + i * (config.barWidth + config.barSpacing)
        const barY = chartArea.y
        const barEndY = chartArea.y + chartArea.height
        
        if (mouseX >= barX && mouseX <= barX + config.barWidth &&
            mouseY >= barY && mouseY <= barEndY) {
          return i
        }
      }
      return null
    }
    
    // Tooltip functions
    const showTooltip = (x, y, data) => {
      hideTooltip()
      
      tooltip = document.createElement('div')
      tooltip.className = 'chart-tooltip'
      tooltip.innerHTML = `
        <div class="tooltip-title">${data.month}</div>
        <div class="tooltip-value">$${data.revenue.toLocaleString()}</div>
      `
      
      tooltip.style.cssText = `
        position: fixed;
        left: ${x + 10}px;
        top: ${y - 60}px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        pointer-events: none;
        z-index: 1000;
        transform: scale(0.8);
        opacity: 0;
        transition: all 0.2s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      `
      
      document.body.appendChild(tooltip)
      
      // Animate tooltip in
      requestAnimationFrame(() => {
        tooltip.style.transform = 'scale(1)'
        tooltip.style.opacity = '1'
      })
    }
    
    const hideTooltip = () => {
      if (tooltip) {
        tooltip.remove()
        tooltip = null
      }
    }
    
    // Utility function to adjust color brightness
    const adjustColor = (color, amount) => {
      const hex = color.replace('#', '')
      const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount))
      const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount))
      const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount))
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
    
    // Update chart when data changes
    const updateChart = () => {
      if (!ctx) return
      
      // Animate transition to new values
      const duration = 800
      const startTime = performance.now()
      const oldProgress = { ...animationProgress.value }
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        props.data.forEach((item, index) => {
          const oldValue = oldProgress[index] || 0
          const newValue = 1
          animationProgress.value[index] = oldValue + (newValue - oldValue) * easeOut
        })
        
        drawChart()
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    }
    
    // Handle resize
    const handleResize = () => {
      if (chartContainer.value) {
        const container = chartContainer.value
        chartWidth.value = container.clientWidth
        chartHeight.value = container.clientHeight
        
        nextTick(() => {
          initChart()
          drawChart()
        })
      }
    }
    
    // Watch for data changes
    watch(() => props.data, () => {
      nextTick(() => {
        updateChart()
      })
    }, { deep: true })
    
    // Lifecycle
    onMounted(() => {
      initChart()
      animateChart()
      
      // Add event listeners
      if (chartCanvas.value) {
        chartCanvas.value.addEventListener('mousemove', handleMouseMove)
        chartCanvas.value.addEventListener('mouseleave', handleMouseLeave)
        chartCanvas.value.addEventListener('click', handleClick)
      }
      
      // Add resize listener
      window.addEventListener('resize', handleResize)
    })
    
    return {
      chartContainer,
      chartCanvas,
      chartWidth,
      chartHeight
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
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Tooltip styles */
:global(.chart-tooltip) {
  font-family: 'Inter', sans-serif;
}

:global(.chart-tooltip .tooltip-title) {
  font-weight: 600;
  margin-bottom: 4px;
  color: #f9fafb;
}

:global(.chart-tooltip .tooltip-value) {
  font-size: 16px;
  color: #8b5cf6;
  font-weight: 700;
}
</style>


