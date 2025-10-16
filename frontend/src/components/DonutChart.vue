<template>
  <div class="donut-chart-container">
    <div class="chart-section">
      <canvas ref="chartCanvas" :width="chartSize" :height="chartSize"></canvas>
      
      <!-- Center total display -->
      <div class="center-total" v-if="!loading">
        <div class="total-value">{{ animateTotal }}</div>
        <div class="total-label">Total Orders</div>
      </div>
      
      <!-- Loading overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>
    
    <!-- Legend -->
    <div class="legend-section">
      <div 
        v-for="(item, index) in data" 
        :key="index"
        class="legend-item"
        :class="{ 'hovered': hoveredSegment === index }"
        @mouseenter="highlightSegment(index)"
        @mouseleave="unhighlightSegment"
      >
        <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
        <div class="legend-content">
          <div class="legend-label">{{ item.label }}</div>
          <div class="legend-value">{{ item.value.toLocaleString() }}</div>
        </div>
        <div class="legend-percentage">{{ item.percentage }}%</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'

export default {
  name: 'DonutChart',
  props: {
    data: {
      type: Array,
      required: true,
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
  emits: ['segmentClick', 'segmentHover'],
  setup(props, { emit }) {
    const chartCanvas = ref(null)
    const chartSize = ref(props.size)
    const hoveredSegment = ref(null)
    const tooltip = ref(null)
    
    // Animation state
    const animationProgress = ref(0)
    const segmentProgress = ref({})
    const animateTotal = ref(0)
    const isAnimating = ref(false)
    
    // Chart configuration
    const config = {
      radius: chartSize.value * 0.35,
      innerRadius: chartSize.value * 0.25,
      strokeWidth: chartSize.value * 0.08,
      centerX: chartSize.value / 2,
      centerY: chartSize.value / 2
    }
    
    let ctx = null
    let animationFrame = null
    
    // Computed total
    const totalOrders = computed(() => {
      return props.data.reduce((sum, item) => sum + item.value, 0)
    })
    
    // Initialize chart
    const initChart = () => {
      if (!chartCanvas.value) return
      
      ctx = chartCanvas.value.getContext('2d')
      
      // Set canvas size
      chartCanvas.value.width = chartSize.value
      chartCanvas.value.height = chartSize.value
      
      // Update config for new size
      config.radius = chartSize.value * 0.35
      config.innerRadius = chartSize.value * 0.25
      config.strokeWidth = chartSize.value * 0.08
      config.centerX = chartSize.value / 2
      config.centerY = chartSize.value / 2
      
      // Reset animation progress
      animationProgress.value = 0
      props.data.forEach((item, index) => {
        segmentProgress.value[index] = 0
      })
      
      // Draw initial state (empty chart)
      drawChart()
    }
    
    // Draw the complete chart
    const drawChart = () => {
      if (!ctx) return
      
      // Clear canvas
      ctx.clearRect(0, 0, chartSize.value, chartSize.value)
      
      // Draw background circle
      drawBackgroundCircle()
      
      // Draw segments
      props.data.forEach((item, index) => {
        drawSegment(item, index)
      })
      
      // Draw center circle
      drawCenterCircle()
    }
    
    // Draw background circle
    const drawBackgroundCircle = () => {
      ctx.save()
      
      ctx.strokeStyle = '#f1f5f9'
      ctx.lineWidth = config.strokeWidth
      
      ctx.beginPath()
      ctx.arc(config.centerX, config.centerY, config.radius, 0, 2 * Math.PI)
      ctx.stroke()
      
      ctx.restore()
    }
    
    // Draw individual segment
    const drawSegment = (item, index) => {
      const progress = isAnimating.value ? segmentProgress.value[index] : 1
      const animatedPercentage = item.percentage * progress
      
      if (animatedPercentage <= 0) return
      
      // Calculate angles - we need to consider only the animated segments so far
      let startAngle = -Math.PI / 2
      
      // Calculate start angle based on animated segments only
      for (let i = 0; i < index; i++) {
        const segmentProgress = isAnimating.value ? segmentProgress.value[i] : 1
        const segmentPercentage = props.data[i].percentage * segmentProgress
        startAngle += (segmentPercentage / 100) * 2 * Math.PI
      }
      
      const endAngle = startAngle + (animatedPercentage / 100) * 2 * Math.PI
      
      // Draw segment
      ctx.save()
      
      // Create gradient
      const gradient = ctx.createRadialGradient(
        config.centerX, config.centerY, config.innerRadius,
        config.centerX, config.centerY, config.radius
      )
      gradient.addColorStop(0, adjustColor(item.color, 10))
      gradient.addColorStop(1, item.color)
      
      ctx.fillStyle = gradient
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      
      // Draw segment path
      ctx.beginPath()
      ctx.arc(config.centerX, config.centerY, config.radius, startAngle, endAngle)
      ctx.arc(config.centerX, config.centerY, config.innerRadius, endAngle, startAngle, true)
      ctx.closePath()
      
      ctx.fill()
      ctx.stroke()
      
      // Add hover effect
      if (hoveredSegment.value === index) {
        drawHoverEffect(startAngle, endAngle)
      }
      
      ctx.restore()
    }
    
    // Draw hover effect
    const drawHoverEffect = (startAngle, endAngle) => {
      ctx.save()
      
      // Scale effect
      const scale = 1.05
      const scaledRadius = config.radius * scale
      const scaledInnerRadius = config.innerRadius * scale
      
      // Create glow effect
      const glowGradient = ctx.createRadialGradient(
        config.centerX, config.centerY, scaledInnerRadius,
        config.centerX, config.centerY, scaledRadius
      )
      glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
      glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(config.centerX, config.centerY, scaledRadius, startAngle, endAngle)
      ctx.arc(config.centerX, config.centerY, scaledInnerRadius, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fill()
      
      ctx.restore()
    }
    
    // Draw center circle
    const drawCenterCircle = () => {
      ctx.save()
      
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(config.centerX, config.centerY, config.innerRadius - 5, 0, 2 * Math.PI)
      ctx.fill()
      
      // Add subtle border
      ctx.strokeStyle = '#f1f5f9'
      ctx.lineWidth = 2
      ctx.stroke()
      
      ctx.restore()
    }
    
    // Animate chart on load
    const animateChart = () => {
      isAnimating.value = true
      const duration = 1500
      const startTime = performance.now()
      
      // Reset all segment progress to 0
      props.data.forEach((item, index) => {
        segmentProgress.value[index] = 0
      })
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function (easeOutBounce)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        // Animate individual segments with delay
        props.data.forEach((item, index) => {
          const segmentDelay = index * 300 // Increased delay between segments
          const segmentElapsed = Math.max(0, elapsed - segmentDelay)
          const segmentDuration = duration - segmentDelay
          
          if (segmentElapsed > 0) {
            const segmentProgress = Math.min(segmentElapsed / segmentDuration, 1)
            const segmentEase = 1 - Math.pow(1 - segmentProgress, 2)
            segmentProgress.value[index] = segmentEase
          } else {
            segmentProgress.value[index] = 0
          }
        })
        
        // Animate total counter
        const targetTotal = totalOrders.value
        animateTotal.value = Math.round(targetTotal * easeOut)
        
        drawChart()
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        } else {
          // Ensure all segments are fully drawn
          props.data.forEach((item, index) => {
            segmentProgress.value[index] = 1
          })
          isAnimating.value = false
          animateTotal.value = targetTotal
          drawChart()
        }
      }
      
      animationFrame = requestAnimationFrame(animate)
    }
    
    // Handle mouse events
    const handleMouseMove = (event) => {
      const rect = chartCanvas.value.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      // Find hovered segment
      const segmentIndex = findHoveredSegment(mouseX, mouseY)
      
      if (segmentIndex !== hoveredSegment.value) {
        hoveredSegment.value = segmentIndex
        drawChart()
        
        if (hoveredSegment.value !== null) {
          showTooltip(event.clientX, event.clientY, props.data[hoveredSegment.value])
          emit('segmentHover', props.data[hoveredSegment.value], hoveredSegment.value)
        } else {
          hideTooltip()
        }
      }
    }
    
    const handleMouseLeave = () => {
      hoveredSegment.value = null
      drawChart()
      hideTooltip()
    }
    
    const handleClick = (event) => {
      const rect = chartCanvas.value.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      const segmentIndex = findHoveredSegment(mouseX, mouseY)
      if (segmentIndex !== null) {
        emit('segmentClick', props.data[segmentIndex], segmentIndex)
      }
    }
    
    // Find which segment is being hovered
    const findHoveredSegment = (mouseX, mouseY) => {
      const dx = mouseX - config.centerX
      const dy = mouseY - config.centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Check if mouse is within donut area
      if (distance < config.innerRadius || distance > config.radius) {
        return null
      }
      
      // Calculate angle
      let angle = Math.atan2(dy, dx)
      angle = angle + Math.PI / 2 // Adjust to start from top
      if (angle < 0) angle += 2 * Math.PI
      
      // Find which segment this angle belongs to
      let currentAngle = 0
      for (let i = 0; i < props.data.length; i++) {
        const segmentAngle = (props.data[i].percentage / 100) * 2 * Math.PI
        if (angle >= currentAngle && angle <= currentAngle + segmentAngle) {
          return i
        }
        currentAngle += segmentAngle
      }
      
      return null
    }
    
    // Tooltip functions
    const showTooltip = (x, y, data) => {
      hideTooltip()
      
      tooltip.value = document.createElement('div')
      tooltip.value.className = 'chart-tooltip'
      tooltip.value.innerHTML = `
        <div class="tooltip-title">${data.label}</div>
        <div class="tooltip-value">${data.value.toLocaleString()}</div>
        <div class="tooltip-percentage">${data.percentage}%</div>
      `
      
      tooltip.value.style.cssText = `
        position: fixed;
        left: ${x + 10}px;
        top: ${y - 80}px;
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
        min-width: 120px;
      `
      
      document.body.appendChild(tooltip.value)
      
      // Animate tooltip in
      requestAnimationFrame(() => {
        tooltip.value.style.transform = 'scale(1)'
        tooltip.value.style.opacity = '1'
      })
    }
    
    const hideTooltip = () => {
      if (tooltip.value) {
        tooltip.value.remove()
        tooltip.value = null
      }
    }
    
    // Legend interaction
    const highlightSegment = (index) => {
      hoveredSegment.value = index
      drawChart()
    }
    
    const unhighlightSegment = () => {
      hoveredSegment.value = null
      drawChart()
    }
    
    // Update chart when data changes
    const updateChart = () => {
      if (!ctx) return
      
      // Cancel any ongoing animation
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      
      // Animate transition to new values
      const duration = 1000
      const startTime = performance.now()
      const oldProgress = { ...segmentProgress.value }
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        props.data.forEach((item, index) => {
          const oldValue = oldProgress[index] || 0
          const newValue = 1
          segmentProgress.value[index] = oldValue + (newValue - oldValue) * easeOut
        })
        
        drawChart()
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        } else {
          // Ensure final state is correct
          props.data.forEach((item, index) => {
            segmentProgress.value[index] = 1
          })
          drawChart()
        }
      }
      
      animationFrame = requestAnimationFrame(animate)
    }
    
    // Utility function to adjust color brightness
    const adjustColor = (color, amount) => {
      const hex = color.replace('#', '')
      const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount))
      const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount))
      const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount))
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
    
    // Watch for data changes
    watch(() => props.data, () => {
      nextTick(() => {
        updateChart()
      })
    }, { deep: true })
    
    // Watch for size changes
    watch(() => props.size, (newSize) => {
      chartSize.value = newSize
      nextTick(() => {
        initChart()
        drawChart()
      })
    })
    
    // Lifecycle
    onMounted(() => {
      initChart()
      
      // Start animation after a short delay to ensure everything is ready
      setTimeout(() => {
        animateChart()
      }, 100)
      
      // Add event listeners
      if (chartCanvas.value) {
        chartCanvas.value.addEventListener('mousemove', handleMouseMove)
        chartCanvas.value.addEventListener('mouseleave', handleMouseLeave)
        chartCanvas.value.addEventListener('click', handleClick)
      }
    })

    // Cleanup on unmount
    onUnmounted(() => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      if (tooltip.value) {
        tooltip.value.remove()
      }
    })
    
    return {
      chartCanvas,
      chartSize,
      hoveredSegment,
      animateTotal,
      highlightSegment,
      unhighlightSegment
    }
  }
}
</script>

<style scoped>
.donut-chart-container {
  display: flex;
  align-items: center;
  gap: 32px;
  width: 100%;
  height: 100%;
}

.chart-section {
  position: relative;
  flex-shrink: 0;
}

.center-total {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.total-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}

.total-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
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
  border-radius: 50%;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.legend-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 200px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.legend-item:hover,
.legend-item.hovered {
  background-color: #f8fafc;
  transform: translateX(4px);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.legend-item:hover .legend-color,
.legend-item.hovered .legend-color {
  transform: scale(1.2);
}

.legend-content {
  flex: 1;
  min-width: 0;
}

.legend-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-value {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.legend-percentage {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  flex-shrink: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .donut-chart-container {
    flex-direction: column;
    gap: 24px;
  }
  
  .legend-section {
    width: 100%;
    min-width: auto;
  }
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
  color: #10b981;
  font-weight: 700;
  margin-bottom: 2px;
}

:global(.chart-tooltip .tooltip-percentage) {
  font-size: 12px;
  color: #cbd5e1;
  font-weight: 500;
}
</style>



