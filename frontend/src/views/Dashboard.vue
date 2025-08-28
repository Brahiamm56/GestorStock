<template>
  <div class="sales-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1 class="dashboard-title">Invoice Overview</h1>
        <div class="sort-filter">
          <label>Sort by:</label>
          <select v-model="selectedPeriod" @change="updatePeriod" class="period-dropdown">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      <div class="header-right">
        <h2 class="order-stats-title">Order Stats</h2>
        <div class="period-selector">
          <select v-model="orderStatsPeriod" class="period-dropdown">
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Revenue Section -->
      <div class="revenue-section">
        <div class="revenue-card">
          <h3>Total Revenue:</h3>
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
              <span class="metric-label">● Net Profit</span>
              <span class="metric-value">{{ formatNumber(overview.netProfit) }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">● Net Revenue</span>
              <span class="metric-value">{{ formatNumber(overview.netRevenue) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bar Chart Section -->
      <div class="chart-section">
        <h3 class="chart-title">Monthly Revenue</h3>
        <BarChart 
          :data="monthlyData" 
          :width="400" 
          :height="200"
          :loading="loading"
          @bar-click="handleBarClick"
          @bar-hover="handleBarHover"
        />
      </div>

      <!-- Donut Chart Section -->
      <div class="donut-section">
        <h3 class="chart-title">Order Statistics</h3>
        <DonutChart 
          :data="orderStatsChartData" 
          :size="200"
          :loading="loading"
          @segment-click="handleSegmentClick"
          @segment-hover="handleSegmentHover"
        />
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="bottom-section">
      <!-- Sales by Social Source -->
      <div class="social-sales-section">
        <h3 class="section-title">Sales By Social Source</h3>
        <div class="social-list">
          <div v-for="source in socialSources" :key="source.name" class="social-item">
            <div class="social-icon" :class="source.platform">
              <i :class="source.icon"></i>
            </div>
            <div class="social-info">
              <div class="social-name">{{ source.name }}</div>
              <div class="social-stats">{{ source.sales }} Sale</div>
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

      <!-- Product Trading Activity -->
      <div class="activity-section">
        <div class="activity-header">
          <h3 class="section-title">Product Trading</h3>
          <button class="view-all-btn">View All</button>
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

      <!-- Best Selling Products -->
      <div class="products-section">
        <h3 class="section-title">Best Selling Product</h3>
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
              <button class="buy-now-btn">Buy Now</button>
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
      dateRange: 'Last 30 days',
      growth: 20.1,
      netProfit: 12560,
      netRevenue: 32671
    })
    
    const monthlyData = ref([
      { month: 'Jan', revenue: 12000 },
      { month: 'Feb', revenue: 19000 },
      { month: 'Mar', revenue: 15000 },
      { month: 'Apr', revenue: 25000 },
      { month: 'May', revenue: 22000 },
      { month: 'Jun', revenue: 30000 },
      { month: 'Jul', revenue: 28000 },
      { month: 'Aug', revenue: 35000 },
      { month: 'Sep', revenue: 32000 },
      { month: 'Oct', revenue: 40000 },
      { month: 'Nov', revenue: 38000 },
      { month: 'Dec', revenue: 45000 }
    ])
    
    const orderStatsData = reactive({
      completed: { count: 1234, percentage: 70 },
      processing: { count: 234, percentage: 20 },
      cancelled: { count: 123, percentage: 10 }
    })

    // Computed data for donut chart
    const orderStatsChartData = computed(() => [
      {
        label: 'Order Completed',
        value: orderStatsData.completed.count,
        percentage: orderStatsData.completed.percentage,
        color: '#10B981'
      },
      {
        label: 'Order Processing',
        value: orderStatsData.processing.count,
        percentage: orderStatsData.processing.percentage,
        color: '#3B82F6'
      },
      {
        label: 'Order Cancel',
        value: orderStatsData.cancelled.count,
        percentage: orderStatsData.cancelled.percentage,
        color: '#EF4444'
      }
    ])
    
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

    // Chart event handlers
    const handleBarClick = (data, index) => {
      console.log('Bar clicked:', data, index)
      // Handle bar click event
    }

    const handleBarHover = (data, index) => {
      console.log('Bar hovered:', data, index)
      // Handle bar hover event
    }

    const handleSegmentClick = (data, index) => {
      console.log('Segment clicked:', data, index)
      // Handle segment click event
    }

    const handleSegmentHover = (data, index) => {
      console.log('Segment hovered:', data, index)
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
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        loading.value = false
      }
    }
    

    
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
      orderStatsChartData,
      orderStatsData,
      socialSources,
      recentActivities,
      bestProducts,
      formatNumber,
      updatePeriod,
      handleBarClick,
      handleBarHover,
      handleSegmentClick,
      handleSegmentHover
    }
  }
}
</script>

<style scoped>
.sales-dashboard {
  padding: 20px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header Section */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
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

.sort-filter label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.period-dropdown {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.period-dropdown:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

/* Main Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

/* Revenue Section */
.revenue-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.revenue-card h3 {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.revenue-amount {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.revenue-period {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
}

.revenue-growth {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
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
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 280px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
  text-align: center;
}

/* Bottom Section */
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.social-sales-section, .activity-section, .products-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
}

/* Social Sales */
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
