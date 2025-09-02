<template>
  <div class="sales-dashboard">
    <!-- Enhanced Header Section -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1 class="dashboard-title">Invoice Overview</h1>
        <p class="dashboard-subtitle">Análisis completo de ventas y rendimiento</p>
        <div class="sort-filter">
          <label class="filter-label">Filtrar por período:</label>
          <select v-model="selectedPeriod" @change="updatePeriod" class="period-dropdown">
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
      </div>
      <div class="header-right">
        <h2 class="order-stats-title">Estadísticas de Pedidos</h2>
        <div class="period-selector">
          <select v-model="orderStatsPeriod" class="period-dropdown">
            <option value="monthly">Mensual</option>
            <option value="weekly">Semanal</option>
            <option value="daily">Diario</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Enhanced Revenue Section -->
      <div class="revenue-section">
        <div class="revenue-card">
          <div class="card-header">
            <h3 class="card-title">Ingresos Totales</h3>
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          <div class="revenue-amount">${{ formatNumber(overview.totalRevenue) }}</div>
          <div class="revenue-period">{{ overview.dateRange }}</div>
          <div class="revenue-metrics">
            <div class="revenue-growth" :class="{ positive: overview.growth >= 0, negative: overview.growth < 0 }">
              <span class="growth-arrow">{{ overview.growth >= 0 ? '↗' : '↘' }}</span>
              {{ Math.abs(overview.growth) }}%
            </div>
          </div>
          <div class="profit-metrics">
            <div class="metric">
              <span class="metric-label">● Beneficio Neto</span>
              <span class="metric-value">{{ formatNumber(overview.netProfit) }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">● Ingresos Netos</span>
              <span class="metric-value">{{ formatNumber(overview.netRevenue) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Bar Chart Section -->
      <div class="chart-section">
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Ingresos Mensuales</h3>
            <div class="chart-actions">
              <button class="chart-btn" @click="refreshChart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                  <path d="M3 22v-6h6"></path>
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="chart-content">
            <BarChart 
              :data="monthlyData" 
              :width="400" 
              :height="200"
              :loading="loading"
              @bar-click="handleBarClick"
              @bar-hover="handleBarHover"
            />
          </div>
        </div>
      </div>

      <!-- Enhanced Donut Chart Section -->
      <div class="donut-section">
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Estadísticas de Pedidos</h3>
            <div class="chart-actions">
              <button class="chart-btn" @click="refreshChart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                  <path d="M3 22v-6h6"></path>
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="chart-content">
            <DonutChart 
              :data="orderStatsChartData" 
              :size="200"
              :loading="loading"
              @segment-click="handleSegmentClick"
              @segment-hover="handleSegmentHover"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Bottom Section -->
    <div class="bottom-section">
      <!-- Enhanced Sales by Social Source -->
      <div class="social-sales-section">
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">Ventas por Red Social</h3>
            <div class="section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </div>
          </div>
          <div class="social-list">
            <div v-for="source in socialSources" :key="source.name" class="social-item">
              <div class="social-icon" :class="source.platform">
                <i :class="source.icon"></i>
              </div>
              <div class="social-info">
                <div class="social-name">{{ source.name }}</div>
                <div class="social-stats">{{ source.sales }} Venta</div>
              </div>
              <div class="social-revenue">
                <div class="revenue-amount">${{ formatNumber(source.revenue) }}</div>
                <div class="revenue-growth" :class="{ positive: source.growth >= 0 }">
                  {{ source.growth >= 0 ? '+' : '' }}{{ source.growth }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Product Trading Activity -->
      <div class="activity-section">
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">Actividad de Productos</h3>
            <button class="view-all-btn">Ver Todo</button>
          </div>
          <div class="activity-list">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-avatar">
                <img :src="activity.avatar" :alt="activity.user" />
              </div>
              <div class="activity-content">
                <div class="activity-description">{{ activity.description }}</div>
                <div class="activity-status" :class="activity.status">{{ activity.statusText }}</div>
              </div>
              <div class="activity-time">
                <div class="time">{{ activity.time }}</div>
                <div class="date">{{ activity.date }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Best Selling Products -->
      <div class="products-section">
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">Productos Más Vendidos</h3>
            <div class="section-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 7l-8-4-8 4"></path>
                <path d="M20 7v10l-8 4-8-4V7"></path>
                <path d="M12 3v16"></path>
              </svg>
            </div>
          </div>
          <div class="products-grid">
            <div v-for="product in bestProducts" :key="product.id" class="product-card">
              <div class="product-image">
                <img :src="product.image" :alt="product.name" />
                <div v-if="product.badge" class="product-badge">{{ product.badge }}</div>
              </div>
              <div class="product-info">
                <h4 class="product-name">{{ product.name }}</h4>
                <div class="product-pricing">
                  <span v-if="product.originalPrice" class="original-price">${{ product.originalPrice }}</span>
                  <span class="current-price">${{ product.price }}</span>
                </div>
                <button class="buy-now-btn">Comprar Ahora</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, nextTick, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import BarChart from '@/components/BarChart.vue'
import DonutChart from '@/components/DonutChart.vue'

export default {
  name: 'Dashboard',
  components: {
    BarChart,
    DonutChart
  },
  setup() {
    const authStore = useAuthStore()
    
    // Reactive data
    const selectedPeriod = ref('monthly')
    const orderStatsPeriod = ref('monthly')
    const loading = ref(false)
    
    const overview = reactive({
      totalRevenue: 45231.89,
      dateRange: 'Últimos 30 días',
      growth: 20.1,
      netProfit: 12560,
      netRevenue: 32671
    })
    
    const monthlyData = ref([
      { month: 'Ene', revenue: 12000 },
      { month: 'Feb', revenue: 19000 },
      { month: 'Mar', revenue: 15000 },
      { month: 'Abr', revenue: 25000 },
      { month: 'May', revenue: 22000 },
      { month: 'Jun', revenue: 30000 },
      { month: 'Jul', revenue: 28000 },
      { month: 'Ago', revenue: 35000 },
      { month: 'Sep', revenue: 32000 },
      { month: 'Oct', revenue: 40000 },
      { month: 'Nov', revenue: 38000 },
      { month: 'Dic', revenue: 45000 }
    ])
    
    const orderStatsData = reactive({
      completed: { count: 1234, percentage: 70 },
      processing: { count: 234, percentage: 20 },
      cancelled: { count: 123, percentage: 10 }
    })
    
    const socialSources = ref([
      {
        name: 'Facebook',
        platform: 'facebook',
        icon: 'fab fa-facebook-f',
        sales: 234,
        revenue: 12500,
        growth: 12.5
      },
      {
        name: 'Instagram',
        platform: 'instagram', 
        icon: 'fab fa-instagram',
        sales: 156,
        revenue: 8900,
        growth: 8.2
      },
      {
        name: 'Twitter',
        platform: 'twitter',
        icon: 'fab fa-twitter',
        sales: 89,
        revenue: 4500,
        growth: -2.1
      },
      {
        name: 'LinkedIn',
        platform: 'linkedin',
        icon: 'fab fa-linkedin-in',
        sales: 67,
        revenue: 3200,
        growth: 5.8
      }
    ])
    
    const recentActivities = ref([
      {
        id: 1,
        user: 'John Doe',
        avatar: 'https://via.placeholder.com/40',
        description: 'Purchased iPhone 14 Pro',
        status: 'completed',
        statusText: 'Completed',
        time: '2:30 PM',
        date: 'Today'
      },
      {
        id: 2,
        user: 'Jane Smith',
        avatar: 'https://via.placeholder.com/40',
        description: 'Added MacBook Air to cart',
        status: 'processing',
        statusText: 'Processing',
        time: '1:15 PM',
        date: 'Today'
      },
      {
        id: 3,
        user: 'Mike Johnson',
        avatar: 'https://via.placeholder.com/40',
        description: 'Cancelled AirPods order',
        status: 'cancelled',
        statusText: 'Cancelled',
        time: '11:45 AM',
        date: 'Today'
      }
    ])
    
    const bestProducts = ref([
      {
        id: 1,
        name: 'iPhone 14 Pro',
        image: 'https://via.placeholder.com/150',
        price: 999,
        originalPrice: 1099,
        badge: 'Best Seller'
      },
      {
        id: 2,
        name: 'MacBook Air M2',
        image: 'https://via.placeholder.com/150',
        price: 1199,
        badge: 'New'
      },
      {
        id: 3,
        name: 'AirPods Pro',
        image: 'https://via.placeholder.com/150',
        price: 249,
        originalPrice: 279
      }
    ])
    
    // Methods
    const formatNumber = (num) => {
      return new Intl.NumberFormat('en-US').format(num)
    }
    
    const updatePeriod = () => {
      fetchDashboardData()
    }

    const refreshChart = () => {
      console.log('Chart refreshed')
      // Implement actual chart refresh logic here if needed
    }

    const handleBarClick = (data) => {
      console.log('Bar chart clicked:', data)
      // Handle bar click event
    }

    const handleBarHover = (data) => {
      console.log('Bar chart hovered:', data)
      // Handle bar hover event
    }

    const handleSegmentClick = (data) => {
      console.log('Donut chart segment clicked:', data)
      // Handle segment click event
    }

    const handleSegmentHover = (data) => {
      console.log('Donut chart segment hovered:', data)
      // Handle segment hover event
    }
    
    const fetchDashboardData = async () => {
      loading.value = true
      try {
        const token = authStore.token
        const headers = { Authorization: `Bearer ${token}` }
        
        // Fetch overview data
        const overviewRes = await axios.get(`/api/dashboard/overview?period=${selectedPeriod.value}`, { headers })
        if (overviewRes.data.success) {
          Object.assign(overview, overviewRes.data.overview)
        }
        
        // Fetch monthly sales
        const monthlyRes = await axios.get('/api/dashboard/monthly-sales', { headers })
        if (monthlyRes.data.success) {
          monthlyData.value = monthlyRes.data.monthlyData
        }
        
        // Fetch order stats
        const orderRes = await axios.get('/api/dashboard/order-stats', { headers })
        if (orderRes.data.success) {
          Object.assign(orderStatsData, orderRes.data.orderStats)
        }
        
        // Fetch social sources
        const socialRes = await axios.get('/api/dashboard/social-sources', { headers })
        if (socialRes.data.success) {
          socialSources.value = socialRes.data.socialSources
        }
        
        // Fetch activities
        const activitiesRes = await axios.get('/api/dashboard/activities', { headers })
        if (activitiesRes.data.success) {
          recentActivities.value = activitiesRes.data.activities
        }
        
        // Fetch best products
        const productsRes = await axios.get('/api/dashboard/best-products', { headers })
        if (productsRes.data.success) {
          bestProducts.value = productsRes.data.bestProducts
        }
        
        // Redraw charts
        await nextTick()
        // drawBarChart() // This function is replaced by BarChart component
        // drawDonutChart() // This function is replaced by DonutChart component
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        loading.value = false
      }
    }
    
    // Computed properties
    const orderStatsChartData = computed(() => {
      return [
        {
          label: 'Completados',
          value: orderStatsData.completed.count,
          percentage: orderStatsData.completed.percentage,
          color: '#10B981'
        },
        {
          label: 'En Proceso',
          value: orderStatsData.processing.count,
          percentage: orderStatsData.processing.percentage,
          color: '#F59E0B'
        },
        {
          label: 'Cancelados',
          value: orderStatsData.cancelled.count,
          percentage: orderStatsData.cancelled.percentage,
          color: '#EF4444'
        }
      ]
    })
    
    // Lifecycle
    onMounted(async () => {
      await fetchDashboardData()
    })
    
    return {
      selectedPeriod,
      orderStatsPeriod,
      loading,
      overview,
      monthlyData,
      orderStatsData,
      socialSources,
      recentActivities,
      bestProducts,
      formatNumber,
      updatePeriod,
      refreshChart,
      handleBarClick,
      handleBarHover,
      handleSegmentClick,
      handleSegmentHover,
      orderStatsChartData
    }
  }
}
</script>

<style scoped>
.sales-dashboard {
  padding: 32px;
  background: var(--bg-cream-primary);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sales-dashboard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.02) 0%, transparent 50%);
  pointer-events: none;
}

/* Header Section */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  background: var(--bg-white);
  padding: 24px 32px;
  border-radius: 16px;
  box-shadow: var(--header-shadow);
  border: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981);
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.dashboard-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-subtitle {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 10px;
}

.order-stats-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.sort-filter, .period-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.period-dropdown {
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 120px;
}

.period-dropdown:hover {
  border-color: #8b5cf6;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
}

.period-dropdown:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  transform: translateY(-1px);
}

/* Main Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

/* Revenue Section */
.revenue-section {
  background: var(--bg-white);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  animation: slideInLeft 0.8s ease-out 0.1s both;
}

.revenue-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
  border-color: #8b5cf6;
}

.revenue-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981, #3b82f6);
}

.revenue-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  color: #6b7280;
  font-size: 20px;
}

.revenue-amount {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  text-align: center;
}

.revenue-period {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
}

.revenue-metrics {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.revenue-growth {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.revenue-growth.positive {
  color: #10b981;
}

.revenue-growth.negative {
  color: #ef4444;
}

.growth-arrow {
  font-size: 16px;
}

.profit-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.metric-label {
  color: #64748b;
}

.metric-value {
  font-weight: 600;
  color: #1e293b;
}

/* Chart Sections */
.chart-section, .donut-section {
  background: var(--bg-white);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.chart-section {
  animation: slideInUp 0.8s ease-out 0.2s both;
}

.donut-section {
  animation: slideInUp 0.8s ease-out 0.3s both;
}

.chart-section:hover, .donut-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
  border-color: #8b5cf6;
}

.chart-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #8b5cf6, #a478c7);
}

.donut-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981, #3b82f6, #ef4444);
}

.chart-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chart-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-btn {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e2e8f0;
  color: #64748b;
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-btn:hover {
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
  border-color: #8b5cf6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
}

.chart-btn svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.chart-btn:hover svg {
  transform: rotate(180deg);
}

.chart-content {
  width: 100%;
  max-width: 400px;
  height: 200px;
}

.bar-chart {
  width: 100%;
  max-width: 400px;
  height: 200px;
}

.donut-chart {
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
}

.order-stats-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.completed {
  background-color: #10b981;
}

.legend-dot.processing {
  background-color: #f59e0b;
}

.legend-dot.cancelled {
  background-color: #ef4444;
}

.legend-label {
  flex: 1;
  color: #374151;
}

.legend-value {
  font-weight: 600;
  color: #1e293b;
  margin-right: 8px;
}

.legend-percentage {
  font-size: 12px;
  color: #64748b;
}

/* Bottom Section */
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
}

.section-card {
  background: var(--bg-white);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.social-sales-section {
  animation: slideInUp 0.8s ease-out 0.4s both;
}

.activity-section {
  animation: slideInUp 0.8s ease-out 0.5s both;
}

.products-section {
  animation: slideInUp 0.8s ease-out 0.6s both;
}

.section-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
  border-color: #8b5cf6;
}

.section-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #8b5cf6, #3b82f6);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  color: #6b7280;
  font-size: 20px;
}

.social-sales-section, .activity-section, .products-section {
  background: var(--bg-white);
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
}

.social-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.social-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.social-item:hover {
  background-color: #f8fafc;
}

.social-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.social-icon.facebook {
  background-color: #1877f2;
}

.social-icon.instagram {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}

.social-icon.twitter {
  background-color: #1da1f2;
}

.social-icon.linkedin {
  background-color: #0077b5;
}

.social-info {
  flex: 1;
}

.social-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.social-stats {
  font-size: 12px;
  color: #64748b;
}

.social-revenue {
  text-align: right;
}

.social-revenue .revenue-amount {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.social-revenue .revenue-growth {
  font-size: 12px;
  font-weight: 500;
}

.social-revenue .revenue-growth.positive {
  color: #10b981;
}

/* Activity Section */
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-all-btn {
  background: none;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-all-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.activity-item:hover {
  background-color: #f8fafc;
}

.activity-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.activity-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-content {
  flex: 1;
}

.activity-description {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  display: inline-block;
}

.activity-status.completed {
  background-color: #dcfce7;
  color: #166534;
}

.activity-status.processing {
  background-color: #fef3c7;
  color: #92400e;
}

.activity-status.cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

.activity-time {
  text-align: right;
  font-size: 12px;
  color: #64748b;
}

.activity-time .time {
  font-weight: 500;
  margin-bottom: 2px;
}

/* Products Section */
.products-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s;
  border: 1px solid #f1f5f9;
}

.product-card:hover {
  background-color: #f8fafc;
  border-color: #e2e8f0;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.product-image {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 600;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.product-pricing {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.original-price {
  font-size: 12px;
  color: #64748b;
  text-decoration: line-through;
}

.current-price {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.buy-now-btn {
  background-color: #8b5cf6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  align-self: flex-start;
}

.buy-now-btn:hover {
  background-color: #7c3aed;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .bottom-section {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .sales-dashboard {
    padding: 16px;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-left, .header-right {
    justify-content: space-between;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .bottom-section {
    grid-template-columns: 1fr;
  }
  
  .dashboard-title {
    font-size: 20px;
  }
  
  .order-stats-title {
    font-size: 18px;
  }
}
</style>
