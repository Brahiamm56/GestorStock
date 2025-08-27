<template>
  <div class="dashboard">
    <el-main>
          <div class="dashboard-content">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-card>
                  <div class="stat-card">
                    <div class="stat-icon">
                      <el-icon><Goods /></el-icon>
                    </div>
                    <div class="stat-info">
                      <h3>{{ stats.totalProducts || 0 }}</h3>
                      <p>Total Productos</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :span="6">
                <el-card>
                  <div class="stat-card">
                    <div class="stat-icon">
                      <el-icon><ShoppingCart /></el-icon>
                    </div>
                    <div class="stat-info">
                      <h3>{{ stats.totalSales || 0 }}</h3>
                      <p>Total Ventas</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :span="6">
                <el-card>
                  <div class="stat-card">
                    <div class="stat-icon">
                      <el-icon><Money /></el-icon>
                    </div>
                    <div class="stat-info">
                      <h3>${{ stats.totalRevenue || 0 }}</h3>
                      <p>Ingresos Totales</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <el-col :span="6">
                <el-card>
                  <div class="stat-card">
                    <div class="stat-icon">
                      <el-icon><Warning /></el-icon>
                    </div>
                    <div class="stat-info">
                      <h3>{{ stats.lowStockProducts || 0 }}</h3>
                      <p>Stock Bajo</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            
            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>Productos con Stock Bajo</span>
                  </template>
                  <el-table :data="lowStockProducts" style="width: 100%">
                    <el-table-column prop="name" label="Producto" />
                    <el-table-column prop="stock_quantity" label="Stock" width="80" />
                    <el-table-column prop="min_stock" label="Mínimo" width="80" />
                  </el-table>
                </el-card>
              </el-col>
              
              <el-col :span="12">
                <el-card>
                  <template #header>
                    <span>Ventas Recientes</span>
                  </template>
                  <el-table :data="recentSales" style="width: 100%">
                    <el-table-column prop="sale_number" label="Número" width="120" />
                    <el-table-column prop="customer_name" label="Cliente" />
                    <el-table-column prop="total_amount" label="Total" width="100">
                      <template #default="scope">
                        ${{ scope.row.total_amount }}
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-main>
  </div>
</template>

<script>
import { ref, onMounted, reactive, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

export default {
  name: 'Dashboard',
  setup() {
    const authStore = useAuthStore()
    
    // Reactive data
    const selectedPeriod = ref('month')
    const animatedValues = reactive({})
    const groupedBarChart = ref(null)
    const donutChart = ref(null)
    
    // Metrics data
    const metrics = ref([
      {
        id: 'products',
        label: 'Total Productos',
        value: 0,
        icon: 'fas fa-box',
        class: 'products-metric',
        trend: { type: 'positive', icon: 'fas fa-arrow-up', value: 12 }
      },
      {
        id: 'sales',
        label: 'Ventas del Mes',
        value: 0,
        icon: 'fas fa-shopping-cart',
        class: 'sales-metric',
        trend: { type: 'positive', icon: 'fas fa-arrow-up', value: 8 }
      },
      {
        id: 'revenue',
        label: 'Ingresos Totales',
        value: 0,
        suffix: '$',
        icon: 'fas fa-dollar-sign',
        class: 'revenue-metric',
        trend: { type: 'positive', icon: 'fas fa-arrow-up', value: 15 }
      },
      {
        id: 'lowStock',
        label: 'Stock Bajo',
        value: 0,
        icon: 'fas fa-exclamation-triangle',
        class: 'warning-metric',
        trend: { type: 'negative', icon: 'fas fa-arrow-down', value: 3 }
      }
    ])

    // Grouped bar chart data
    const groupedBarData = ref({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July'],
      series1: [100, 85, 70, 65, 55, 45, 35], // Serie A - violeta oscuro
      series2: [80, 70, 60, 50, 40, 30, 25]   // Serie B - violeta claro
    })

    // Animation state management
    const barAnimationStates = ref(new Map())
    const animationCleanupFunctions = ref(new Map())

    // Category data for donut chart
    const categoryData = ref([
      { label: 'Envases', percentage: 45, color: '#4F46E5' },
      { label: 'Decoración', percentage: 35, color: '#06B6D4' },
      { label: 'Sahumerios', percentage: 20, color: '#10B981' }
    ])

    // Recent activities
    const recentActivities = ref([
      {
        id: 1,
        number: '#001',
        title: 'Nueva venta registrada',
        time: 'Hace 5 minutos',
        type: 'sale',
        status: 'completed',
        statusText: 'Completada'
      },
      {
        id: 2,
        number: '#002',
        title: 'Producto agregado al inventario',
        time: 'Hace 15 minutos',
        type: 'product',
        status: 'completed',
        statusText: 'Agregado'
      },
      {
        id: 3,
        number: '#003',
        title: 'Stock bajo detectado',
        time: 'Hace 1 hora',
        type: 'warning',
        status: 'pending',
        statusText: 'Pendiente'
      },
      {
        id: 4,
        number: '#004',
        title: 'Reporte mensual generado',
        time: 'Hace 2 horas',
        type: 'report',
        status: 'completed',
        statusText: 'Generado'
      }
    ])

    // Featured products
    const featuredProducts = ref([
      {
        id: 1,
        name: 'Vela Aromática Premium',
        price: 25.99,
        oldPrice: 29.99,
        rating: 5,
        image: 'https://images.unsplash.com/photo-1602874801006-8e0ac97fb4e8?w=150&h=150&fit=crop&crop=center',
        badge: 'Más Vendido'
      },
      {
        id: 2,
        name: 'Sahumerio Natural',
        price: 12.50,
        rating: 4,
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150&h=150&fit=crop&crop=center',
        badge: 'Nuevo'
      },
      {
        id: 3,
        name: 'Envase Decorativo',
        price: 18.75,
        rating: 4,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop&crop=center'
      }
    ])

    // Methods
    const updatePeriod = () => {
      console.log('Período actualizado:', selectedPeriod.value)
      loadDashboardData()
    }

    const animateNumbers = () => {
      metrics.value.forEach(metric => {
        const target = metric.value
        const duration = 2000
        const steps = 60
        const increment = target / steps
        let current = 0
        
        const timer = setInterval(() => {
          current += increment
          if (current >= target) {
            current = target
            clearInterval(timer)
          }
          animatedValues[metric.id] = Math.floor(current)
        }, duration / steps)
      })
    }

    const initCharts = async () => {
      await nextTick()
      
      // Initialize grouped bar chart
      if (groupedBarChart.value) {
        initGroupedBarChart()
      }

      // Initialize animated donut chart with delay
      if (donutChart.value) {
        setTimeout(() => {
          animateDonutChart()
        }, 500) // Start donut animation 0.5s after bars
      }
    }

    const initGroupedBarChart = () => {
      const canvas = groupedBarChart.value
      const ctx = canvas.getContext('2d')
      
      // Set canvas size
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      
      // Chart configuration
      const padding = { top: 40, right: 40, bottom: 60, left: 60 }
      const chartWidth = canvas.width - padding.left - padding.right
      const chartHeight = canvas.height - padding.top - padding.bottom
      const maxValue = Math.max(...groupedBarData.value.series1, ...groupedBarData.value.series2)
      
      // Calculate bar dimensions
      const groupWidth = chartWidth / groupedBarData.value.labels.length
      const barWidth = (groupWidth * 0.8) / 2 // 80% of group width, divided by 2 series
      const barSpacing = groupWidth * 0.1 // 10% spacing between bars in group
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw grid lines
      ctx.strokeStyle = '#f1f5f9'
      ctx.lineWidth = 1
      const gridLines = 5
      for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (i * chartHeight) / gridLines
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(canvas.width - padding.right, y)
        ctx.stroke()
      }
      
      // Draw Y-axis labels
      ctx.fillStyle = '#64748b'
      ctx.font = '12px Inter, sans-serif'
      ctx.textAlign = 'right'
      for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (i * chartHeight) / gridLines
        const value = Math.round((maxValue * (gridLines - i)) / gridLines)
        ctx.fillText(value.toString(), padding.left - 10, y + 4)
      }
      
      // Animate bars for each month with stagger effect
      groupedBarData.value.labels.forEach((label, index) => {
        const groupX = padding.left + index * groupWidth + groupWidth * 0.1
        const series1Value = groupedBarData.value.series1[index]
        const series2Value = groupedBarData.value.series2[index]
        
        // Calculate target bar heights
        const series1TargetHeight = (series1Value / maxValue) * chartHeight
        const series2TargetHeight = (series2Value / maxValue) * chartHeight
        
        // Stagger delay for wave effect
        const staggerDelay = index * 150
        
        // Create unique keys for state management
        const series1Key = `series1_${index}`
        const series2Key = `series2_${index}`
        
        // Set initial state
        barAnimationStates.value.set(series1Key, 'animating')
        barAnimationStates.value.set(series2Key, 'animating')
        
        // Animate Series 1 bar (violeta oscuro)
        const series1X = groupX
        animateBar(ctx, series1X, padding.top + chartHeight, barWidth, series1TargetHeight, '#6a5acd', staggerDelay, () => {
          barAnimationStates.value.set(series1Key, 'completed')
          addBarHoverEffect(canvas, series1X, padding.top + chartHeight - series1TargetHeight, barWidth, series1TargetHeight, series1Value, label, 'Serie A')
        })
        
        // Animate Series 2 bar (violeta claro) with slight delay
        const series2X = groupX + barWidth + barSpacing
        animateBar(ctx, series2X, padding.top + chartHeight, barWidth, series2TargetHeight, '#b19cd9', staggerDelay + 100, () => {
          barAnimationStates.value.set(series2Key, 'completed')
          addBarHoverEffect(canvas, series2X, padding.top + chartHeight - series2TargetHeight, barWidth, series2TargetHeight, series2Value, label, 'Serie B')
        })
        
        // Draw month labels after animation with fade-in effect
        setTimeout(() => {
          animateLabel(ctx, groupX + groupWidth * 0.4, canvas.height - padding.bottom + 20, label)
        }, staggerDelay + 300)
      })
    }

    const animateBar = (ctx, x, startY, width, targetHeight, color, delay, onComplete) => {
      setTimeout(() => {
        let currentHeight = 0
        const duration = 800 // 0.8 seconds
        const startTime = Date.now()
        let cleanupFunction = null
        
        const animate = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          
          // Smooth easing function with bounce effect
          let easeOut
          if (progress < 0.8) {
            // Normal easing for 80% of animation
            easeOut = 1 - Math.pow(1 - (progress / 0.8), 3)
          } else {
            // Bounce effect for last 20%
            const bounceProgress = (progress - 0.8) / 0.2
            const bounce = Math.sin(bounceProgress * Math.PI * 2) * 0.1
            easeOut = 1 + bounce
          }
          
          currentHeight = targetHeight * easeOut
          
          // Clear the bar area
          ctx.clearRect(x - 1, startY - targetHeight - 5, width + 2, targetHeight + 10)
          
          // Draw the animated bar with gradient
          const gradient = ctx.createLinearGradient(x, startY - currentHeight, x, startY)
          gradient.addColorStop(0, color)
          gradient.addColorStop(1, adjustColorBrightness(color, 20))
          ctx.fillStyle = gradient
          ctx.fillRect(x, startY - currentHeight, width, currentHeight)
          
          // Add subtle shadow effect
          ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 2
          ctx.fillRect(x, startY - currentHeight, width, currentHeight)
          
          // Reset shadow
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
          
          if (progress < 1) {
            requestAnimationFrame(animate)
          } else {
            // Animation complete, ensure final state is drawn correctly
            drawFinalBarState(ctx, x, startY, width, targetHeight, color)
            
            // Start continuous animation with cleanup
            cleanupFunction = startContinuousBarAnimation(ctx, x, startY, width, targetHeight, color)
            
            if (onComplete) onComplete()
          }
        }
        
        requestAnimationFrame(animate)
      }, delay)
    }

    const startContinuousBarAnimation = (ctx, x, startY, width, height, color) => {
      let animationTime = 0
      let isAnimating = true
      
      const animate = () => {
        if (!isAnimating) return
        
        animationTime += 0.015
        
        // Calculate breathing effect
        const breathingScale = 1 + Math.sin(animationTime * 1.5) * 0.02
        
        // Clear the bar area with extra space for breathing
        ctx.clearRect(x - 3, startY - height - 5, width + 6, height + 10)
        
        // Create dynamic gradient
        const gradient = createGradient(ctx, x, startY, width, height, color, animationTime)
        ctx.fillStyle = gradient
        
        // Apply breathing effect to bar dimensions
        const scaledWidth = width * breathingScale
        const scaledHeight = height * breathingScale
        const scaledX = x - (scaledWidth - width) / 2
        const scaledY = startY - scaledHeight
        
        // Draw main bar with breathing effect
        ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight)
        
        // Add subtle shadow with variation
        const shadowIntensity = 0.08 + Math.sin(animationTime * 2) * 0.03
        ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity})`
        ctx.shadowBlur = 3 + Math.sin(animationTime * 1.5) * 1
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 1 + Math.sin(animationTime * 2) * 0.5
        ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight)
        
        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        
        // Add subtle highlight at the top
        const highlightOpacity = 0.3 + Math.sin(animationTime * 3) * 0.1
        ctx.save()
        ctx.globalAlpha = highlightOpacity
        ctx.fillStyle = adjustColorBrightness(color, 40)
        ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight * 0.1)
        ctx.restore()
        
        // Add subtle glow effect
        const glowOpacity = 0.05 + Math.sin(animationTime * 2) * 0.02
        ctx.save()
        ctx.globalAlpha = glowOpacity
        ctx.fillStyle = color
        ctx.fillRect(scaledX - 1, scaledY - 1, scaledWidth + 2, scaledHeight + 2)
        ctx.restore()
        
        requestAnimationFrame(animate)
      }
      
      requestAnimationFrame(animate)
      
      // Return cleanup function
      return () => {
        isAnimating = false
        // Ensure final state is drawn correctly
        drawFinalBarState(ctx, x, startY, width, height, color)
      }
    }

    const animateLabel = (ctx, x, y, text) => {
      let opacity = 0
      const duration = 500 // 0.5 seconds
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        opacity = progress
        
        // Clear label area
        ctx.clearRect(x - 30, y - 10, 60, 20)
        
        // Draw label with fade-in effect
        ctx.save()
        ctx.globalAlpha = opacity
        ctx.fillStyle = '#64748b'
        ctx.font = '12px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(text, x, y)
        ctx.restore()
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    }

    const addBarHoverEffect = (canvas, x, y, width, height, value, label, seriesName) => {
      const rect = canvas.getBoundingClientRect()
      
      const handleMouseMove = (e) => {
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        
        // Check if mouse is over this bar
        if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
          canvas.style.cursor = 'pointer'
          showTooltip(e.clientX, e.clientY, `${label} - ${seriesName}: ${value}`)
        } else {
          canvas.style.cursor = 'default'
          hideTooltip()
        }
      }
      
      canvas.addEventListener('mousemove', handleMouseMove)
    }

    const addBarHoverEffectOptimized = (x, y, width, height, value, index) => {
      const canvas = salesChart.value
      const rect = canvas.getBoundingClientRect()
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec']
      
      const handleMouseMove = (e) => {
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        
        // Check if mouse is over this bar
        if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
          canvas.style.cursor = 'pointer'
          // Show tooltip with minimal overhead
          showTooltip(e.clientX, e.clientY, `${months[index]}: $${value}`)
        } else {
          canvas.style.cursor = 'default'
          hideTooltip()
        }
      }
      
      canvas.addEventListener('mousemove', handleMouseMove)
    }

    const animateDonutChart = () => {
      const canvas = donutChart.value
      const ctx = canvas.getContext('2d')
      
      // Optimized chart configuration for proper centering
      const centerX = 125 // Fixed center for 250px canvas
      const centerY = 125 // Fixed center for 250px canvas
      const radius = 80
      const innerRadius = 50
      
      // Set canvas size to match CSS
      canvas.width = 250
      canvas.height = 250
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw background circle (static)
      ctx.strokeStyle = '#f1f5f9'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.stroke()
      
      // Start drawing segments immediately (no rotation delay)
      drawSegmentsProgressivelyOptimized()
    }

    const drawSegmentsProgressivelyOptimized = () => {
      const canvas = donutChart.value
      const ctx = canvas.getContext('2d')
      const centerX = 125 // Fixed center
      const centerY = 125 // Fixed center
      const radius = 80
      const innerRadius = 50
      
      let currentAngle = -Math.PI / 2
      
      categoryData.value.forEach((item, index) => {
        const sliceAngle = (item.percentage / 100) * 2 * Math.PI
        
        setTimeout(() => {
          animateSegmentOptimized(ctx, centerX, centerY, radius, innerRadius, currentAngle, sliceAngle, item.color, index)
          currentAngle += sliceAngle
        }, index * 400) // Reduced to 400ms delay between segments
      })
    }

    const animateSegmentOptimized = (ctx, centerX, centerY, radius, innerRadius, startAngle, targetAngle, color, index) => {
      let currentAngle = 0
      const duration = 800 // Reduced to 0.8 seconds
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Optimized cubic-bezier easing
        const easeOut = 1 - Math.pow(1 - progress, 3)
        currentAngle = targetAngle * easeOut
        
        // Draw segment with minimal operations
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + currentAngle)
        ctx.arc(centerX, centerY, innerRadius, startAngle + currentAngle, startAngle, true)
        ctx.closePath()
        
        // Simple solid fill - NO gradients during animation
        ctx.fillStyle = color
        ctx.fill()
        
        // Minimal stroke
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        ctx.stroke()
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Add hover effect after animation
          addSegmentHoverEffectOptimized(centerX, centerY, radius, innerRadius, startAngle, targetAngle, color, index)
        }
      }
      
      requestAnimationFrame(animate)
    }

    const addSegmentHoverEffectOptimized = (centerX, centerY, radius, innerRadius, startAngle, angle, color, index) => {
      // Optimized hover detection for segments
      const canvas = donutChart.value
      const rect = canvas.getBoundingClientRect()
      
      const handleMouseMove = (e) => {
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        
        // Check if mouse is over this segment
        const dx = mouseX - centerX
        const dy = mouseY - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance >= innerRadius && distance <= radius) {
          const mouseAngle = Math.atan2(dy, dx)
          let normalizedAngle = mouseAngle + Math.PI / 2
          if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI
          
          const segmentStart = startAngle + Math.PI / 2
          const segmentEnd = segmentStart + angle
          
          if (normalizedAngle >= segmentStart && normalizedAngle <= segmentEnd) {
            canvas.style.cursor = 'pointer'
            // Highlight segment and show tooltip
            highlightSegmentOptimized(index)
            showTooltip(e.clientX, e.clientY, `${categoryData.value[index].label}: ${categoryData.value[index].percentage}%`)
          }
        }
      }
      
      canvas.addEventListener('mousemove', handleMouseMove)
    }

    const highlightSegmentOptimized = (index) => {
      // Optimized legend highlighting with minimal DOM manipulation
      const legendItems = document.querySelectorAll('.legend-item')
      legendItems.forEach((item, i) => {
        if (i === index) {
          item.style.transform = 'scale(1.05)'
          item.style.backgroundColor = 'rgba(79, 70, 229, 0.1)'
        } else {
          item.style.transform = 'scale(1)'
          item.style.backgroundColor = 'transparent'
        }
      })
    }

    const adjustColorBrightness = (color, amount) => {
      const hex = color.replace('#', '')
      const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount))
      const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount))
      const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount))
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }

    const createGradient = (ctx, x, y, width, height, color, animationTime) => {
      const gradient = ctx.createLinearGradient(x, y - height, x, y)
      const brightnessVariation = Math.sin(animationTime * 2) * 8
      
      const mainColor = adjustColorBrightness(color, brightnessVariation)
      const lighterColor = adjustColorBrightness(color, 15 + brightnessVariation)
      const lightestColor = adjustColorBrightness(color, 25 + brightnessVariation)
      
      gradient.addColorStop(0, mainColor)
      gradient.addColorStop(0.6, lighterColor)
      gradient.addColorStop(1, lightestColor)
      
      return gradient
    }

    const drawFinalBarState = (ctx, x, startY, width, height, color) => {
      // Clear the bar area completely
      ctx.clearRect(x - 3, startY - height - 5, width + 6, height + 10)
      
      // Reset all context properties to ensure clean state
      ctx.globalAlpha = 1
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      // Create static gradient for final state
      const gradient = ctx.createLinearGradient(x, startY - height, x, startY)
      gradient.addColorStop(0, color)
      gradient.addColorStop(0.6, adjustColorBrightness(color, 15))
      gradient.addColorStop(1, adjustColorBrightness(color, 25))
      
      // Draw main bar with solid color
      ctx.fillStyle = gradient
      ctx.fillRect(x, startY - height, width, height)
      
      // Add subtle shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 1
      ctx.fillRect(x, startY - height, width, height)
      
      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      // Add highlight at the top
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = adjustColorBrightness(color, 40)
      ctx.fillRect(x, startY - height, width, height * 0.1)
      ctx.restore()
    }

    const showTooltip = (x, y, text) => {
      hideTooltip() // Remove existing tooltip
      
      const tooltip = document.createElement('div')
      tooltip.className = 'chart-tooltip'
      tooltip.textContent = text
      tooltip.style.cssText = `
        position: fixed;
        left: ${x + 10}px;
        top: ${y - 30}px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        pointer-events: none;
        z-index: 1000;
        animation: tooltipFadeIn 0.2s ease-out;
      `
      
      document.body.appendChild(tooltip)
    }

    const hideTooltip = () => {
      const existing = document.querySelector('.chart-tooltip')
      if (existing) {
        existing.remove()
      }
    }

    const loadDashboardData = async () => {
      try {
        console.log('🔄 Cargando datos del dashboard...')
        
        // Load products data
        const productsResponse = await api.get('/products')
        if (productsResponse.data.success) {
          const products = productsResponse.data.products
          metrics.value[0].value = products.length
          
          // Count low stock products
          const lowStockCount = products.filter(
            product => product.stock_quantity <= (product.min_stock || 5)
          ).length
          metrics.value[3].value = lowStockCount
          
          // Update category data based on real products
          const categoryStats = products.reduce((acc, product) => {
            const category = product.category || 'OTROS'
            acc[category] = (acc[category] || 0) + 1
            return acc
          }, {})
          
          const totalProducts = products.length
          if (totalProducts > 0) {
            categoryData.value = [
              { 
                label: 'Envases', 
                percentage: Math.round(((categoryStats.ENVASES || 0) / totalProducts) * 100), 
                color: '#4F46E5' 
              },
              { 
                label: 'Decoración', 
                percentage: Math.round(((categoryStats.DECORACION || 0) / totalProducts) * 100), 
                color: '#06B6D4' 
              },
              { 
                label: 'Sahumerios', 
                percentage: Math.round(((categoryStats.SAHUMERIOS || 0) / totalProducts) * 100), 
                color: '#10B981' 
              }
            ]
          }
          
          console.log('✅ Productos cargados:', products.length)
        }

        // Load sales data
        const salesResponse = await api.get('/sales')
        if (salesResponse.data.success) {
          const sales = salesResponse.data.sales
          
          // Filter sales for current month
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()
          const monthlySales = sales.filter(sale => {
            const saleDate = new Date(sale.created_at)
            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
          })
          
          metrics.value[1].value = monthlySales.length
          
          // Calculate total revenue
          const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0)
          metrics.value[2].value = Math.round(totalRevenue)
          
          // Update recent activities with real sales data
          if (sales.length > 0) {
            const recentSales = sales.slice(0, 4).map((sale, index) => ({
              id: sale.id,
              number: `#${sale.sale_number}`,
              title: `Venta a ${sale.customer_name}`,
              time: `$${sale.total_amount}`,
              type: 'sale',
              status: 'completed',
              statusText: 'Completada'
            }))
            
            recentActivities.value = [
              ...recentSales,
              ...recentActivities.value.slice(recentSales.length)
            ]
          }
          
          console.log('✅ Ventas cargadas:', sales.length)
        }

        // Animate numbers after loading data
        setTimeout(animateNumbers, 500)
        console.log('✅ Dashboard cargado exitosamente')
        
      } catch (error) {
        console.error('❌ Error loading dashboard data:', error)
        // Set realistic demo values if API fails
        metrics.value[0].value = 156
        metrics.value[1].value = 23
        metrics.value[2].value = 8750
        metrics.value[3].value = 7
        
        setTimeout(animateNumbers, 500)
      }
    }

    // Performance monitoring function
    const monitorPerformance = () => {
      let frames = 0
      let lastTime = performance.now()
      
      const countFPS = () => {
        frames++
        const currentTime = performance.now()
        
        if (currentTime >= lastTime + 1000) {
          console.log(`📊 Dashboard FPS: ${frames}`)
          frames = 0
          lastTime = currentTime
        }
        
        requestAnimationFrame(countFPS)
      }
      
      countFPS()
    }

    // Handle window resize for responsive charts
    const handleResize = () => {
      if (groupedBarChart.value) {
        initGroupedBarChart()
      }
    }

    const validateBarVisibility = () => {
      // Force redraw of all completed bars to ensure visibility
      const canvas = groupedBarChart.value
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      const padding = { top: 40, right: 40, bottom: 60, left: 60 }
      const chartWidth = canvas.width - padding.left - padding.right
      const chartHeight = canvas.height - padding.top - padding.bottom
      const maxValue = Math.max(...groupedBarData.value.series1, ...groupedBarData.value.series2)
      const groupWidth = chartWidth / groupedBarData.value.labels.length
      const barWidth = (groupWidth * 0.8) / 2
      const barSpacing = groupWidth * 0.1
      
      groupedBarData.value.labels.forEach((label, index) => {
        const groupX = padding.left + index * groupWidth + groupWidth * 0.1
        const series1Value = groupedBarData.value.series1[index]
        const series2Value = groupedBarData.value.series2[index]
        const series1TargetHeight = (series1Value / maxValue) * chartHeight
        const series2TargetHeight = (series2Value / maxValue) * chartHeight
        
        const series1Key = `series1_${index}`
        const series2Key = `series2_${index}`
        
        // Redraw completed bars
        if (barAnimationStates.value.get(series1Key) === 'completed') {
          const series1X = groupX
          drawFinalBarState(ctx, series1X, padding.top + chartHeight, barWidth, series1TargetHeight, '#6a5acd')
        }
        
        if (barAnimationStates.value.get(series2Key) === 'completed') {
          const series2X = groupX + barWidth + barSpacing
          drawFinalBarState(ctx, series2X, padding.top + chartHeight, barWidth, series2TargetHeight, '#b19cd9')
        }
      })
    }

    const emergencyRedraw = () => {
      // Emergency function to completely redraw the chart if bars become invisible
      console.log('🔄 Emergency redraw triggered - ensuring bar visibility')
      
      const canvas = groupedBarChart.value
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      
      // Clear entire canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Redraw grid and labels
      const padding = { top: 40, right: 40, bottom: 60, left: 60 }
      const chartWidth = canvas.width - padding.left - padding.right
      const chartHeight = canvas.height - padding.top - padding.bottom
      const maxValue = Math.max(...groupedBarData.value.series1, ...groupedBarData.value.series2)
      const groupWidth = chartWidth / groupedBarData.value.labels.length
      const barWidth = (groupWidth * 0.8) / 2
      const barSpacing = groupWidth * 0.1
      
      // Redraw grid lines
      ctx.strokeStyle = '#f1f5f9'
      ctx.lineWidth = 1
      const gridLines = 5
      for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (i * chartHeight) / gridLines
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(canvas.width - padding.right, y)
        ctx.stroke()
      }
      
      // Redraw Y-axis labels
      ctx.fillStyle = '#64748b'
      ctx.font = '12px Inter, sans-serif'
      ctx.textAlign = 'right'
      for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (i * chartHeight) / gridLines
        const value = Math.round((maxValue * (gridLines - i)) / gridLines)
        ctx.fillText(value.toString(), padding.left - 10, y + 4)
      }
      
      // Force redraw all bars with final state
      groupedBarData.value.labels.forEach((label, index) => {
        const groupX = padding.left + index * groupWidth + groupWidth * 0.1
        const series1Value = groupedBarData.value.series1[index]
        const series2Value = groupedBarData.value.series2[index]
        const series1TargetHeight = (series1Value / maxValue) * chartHeight
        const series2TargetHeight = (series2Value / maxValue) * chartHeight
        
        // Force redraw Series 1
        const series1X = groupX
        drawFinalBarState(ctx, series1X, padding.top + chartHeight, barWidth, series1TargetHeight, '#6a5acd')
        
        // Force redraw Series 2
        const series2X = groupX + barWidth + barSpacing
        drawFinalBarState(ctx, series2X, padding.top + chartHeight, barWidth, series2TargetHeight, '#b19cd9')
        
        // Redraw labels
        ctx.fillStyle = '#64748b'
        ctx.font = '12px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(label, groupX + groupWidth * 0.4, canvas.height - padding.bottom + 20)
      })
      
      // Reset all states to completed
      groupedBarData.value.labels.forEach((label, index) => {
        barAnimationStates.value.set(`series1_${index}`, 'completed')
        barAnimationStates.value.set(`series2_${index}`, 'completed')
      })
    }

    // Lifecycle
    onMounted(async () => {
      await loadDashboardData()
      setTimeout(initCharts, 500) // Reduced delay
      
      // Add resize listener
      window.addEventListener('resize', handleResize)
      
      // Add visibility validation interval
      const visibilityInterval = setInterval(validateBarVisibility, 2000) // Check every 2 seconds
      
      // Start performance monitoring in development
      if (process.env.NODE_ENV === 'development') {
        monitorPerformance()
      }
      
      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', handleResize)
        clearInterval(visibilityInterval)
      }
    })

    return {
      authStore,
      selectedPeriod,
      animatedValues,
      metrics,
      categoryData,
      recentActivities,
      featuredProducts,
      groupedBarChart,
      donutChart,
      updatePeriod
    }
  }
}
</script>

<style scoped>
.dashboard {
  height: 100vh;
}

.grouped-bar-chart:hover,
.donut-chart:hover {
  transform: translateZ(0) scale(1.02);
}

.donut-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  min-height: 300px;
  padding: 20px;
  box-sizing: border-box;
}

.donut-chart {
  width: 250px;
  height: 250px;
  max-width: 100%;
}

.donut-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2rem;
  color: var(--primary-color);
}

.activity-card,
.products-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideInUp 0.6s ease-out both;
}

.activity-header,
.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.activity-header h3,
.products-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.view-all-btn {
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #4f46e5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: #4f46e5;
  color: white;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.2s ease;
  animation: slideInLeft 0.4s ease-out both;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.activity-item:hover {
  background: #e2e8f0;
  transform: translateX(4px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.activity-icon.sale {
  background: linear-gradient(135deg, #10b981, #059669);
}

.activity-icon.product {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

.activity-icon.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.activity-icon.report {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 0.85rem;
  color: #6b7280;
}

.activity-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.activity-status.completed {
  background: #dcfce7;
  color: #166534;
}

.stat-info p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 0.9rem;
}
</style>

<style>
  .el-card__header {
    background-color: var(--primary-color);
    color: var(--text-color-light);
    font-weight: 600;
    font-size: 1.1rem;
    border-bottom: 1px solid var(--border-color);
  }
</style>
