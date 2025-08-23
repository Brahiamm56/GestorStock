<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Bienvenido, {{ authStore.user?.name }}</p>
    </div>
    
    <div class="dashboard-content">
            <el-row :gutter="24">
              <el-col :span="6">
                <div class="metric-card products-card">
                  <div class="metric-icon products-icon">
                    <el-icon><Goods /></el-icon>
                  </div>
                  <div class="metric-info">
                    <div class="metric-number">{{ stats.totalProducts || 0 }}</div>
                    <div class="metric-label">Total Productos</div>
                  </div>
                </div>
              </el-col>
              
              <el-col :span="6">
                <div class="metric-card sales-card">
                  <div class="metric-icon sales-icon">
                    <el-icon><ShoppingCart /></el-icon>
                  </div>
                  <div class="metric-info">
                    <div class="metric-number">{{ stats.totalSales || 0 }}</div>
                    <div class="metric-label">Total Ventas</div>
                  </div>
                </div>
              </el-col>
              
              <el-col :span="6">
                <div class="metric-card revenue-card">
                  <div class="metric-icon revenue-icon">
                    <el-icon><Money /></el-icon>
                  </div>
                  <div class="metric-info">
                    <div class="metric-number">${{ stats.totalRevenue || 0 }}</div>
                    <div class="metric-label">Ingresos Totales</div>
                  </div>
                </div>
              </el-col>
              
              <el-col :span="6">
                <div class="metric-card warning-card">
                  <div class="metric-icon warning-icon">
                    <el-icon><Warning /></el-icon>
                  </div>
                  <div class="metric-info">
                    <div class="metric-number">{{ stats.lowStockProducts || 0 }}</div>
                    <div class="metric-label">Stock Bajo</div>
                  </div>
                </div>
              </el-col>
            </el-row>
            
            <el-row :gutter="24" class="tables-row">
              <el-col :span="12">
                <div class="table-card">
                  <div class="table-header">
                    <h3>Productos con Stock Bajo</h3>
                  </div>
                  <el-table :data="lowStockProducts" class="dashboard-table" empty-text="No hay productos con stock bajo">
                    <el-table-column prop="name" label="Producto" />
                    <el-table-column prop="stock_quantity" label="Stock" width="80" align="center" />
                    <el-table-column prop="min_stock" label="Mínimo" width="80" align="center" />
                  </el-table>
                </div>
              </el-col>
              
              <el-col :span="12">
                <div class="table-card">
                  <div class="table-header">
                    <h3>Ventas Recientes</h3>
                  </div>
                  <el-table :data="recentSales" class="dashboard-table" empty-text="No hay ventas recientes">
                    <el-table-column prop="sale_number" label="Número" width="120" />
                    <el-table-column prop="customer_name" label="Cliente" />
                    <el-table-column prop="total_amount" label="Total" width="100" align="right">
                      <template #default="scope">
                        <span class="amount-text">${{ scope.row.total_amount }}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-col>
            </el-row>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { productService, saleService } from '@/services/api'
import api from '@/services/api'

export default {
  name: 'Dashboard',
  setup() {
    const authStore = useAuthStore()
    const stats = ref({})
    const lowStockProducts = ref([])
    const recentSales = ref([])

    const loadDashboardData = async () => {
      try {
        // Cargar productos con stock bajo
        const lowStockResponse = await productService.getLowStock()
        lowStockProducts.value = lowStockResponse.data.products?.slice(0, 5) || []

        // Cargar ventas recientes
        const salesResponse = await saleService.getAll({ limit: 5 })
        recentSales.value = salesResponse.data.sales || []

        // Cargar estadísticas del dashboard
        const statsResponse = await api.get('/dashboard/stats')
        if (statsResponse.data.success) {
          stats.value = statsResponse.data.data
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error)
        // Datos por defecto en caso de error
        stats.value = {
          products: { total: 0, lowStock: 0 },
          sales: { today: 0, month: 0, pending: 0 },
          revenue: { today: 0, month: 0 },
          users: { active: 0 }
        }
      }
    }

    onMounted(() => {
      loadDashboardData()
    })

    return {
      authStore,
      stats,
      lowStockProducts,
      recentSales
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

:root {
  --primary-blue: #2563eb;
  --light-blue: #dbeafe;
  --success-green: #10b981;
  --warning-orange: #f59e0b;
  --danger-red: #ef4444;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --background-card: #ffffff;
  --border-color: #e5e7eb;
  --shadow-light: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dashboard {
  min-height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-header h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
}

.dashboard-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 500;
}

.dashboard-content {
  background-color: transparent;
  padding: 0;
}

/* Metric Cards */
.metric-card {
  background: var(--background-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--shadow-light);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-4px);
  border-color: var(--primary-blue);
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-blue), var(--success-green));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.metric-card:hover::before {
  opacity: 1;
}

/* Specific card colors */
.products-card:hover::before {
  background: var(--primary-blue);
}

.sales-card:hover::before {
  background: var(--success-green);
}

.revenue-card:hover::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.warning-card:hover::before {
  background: var(--warning-orange);
}

.metric-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 28px;
  transition: all 0.3s ease;
}

.products-icon {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary-blue);
}

.sales-icon {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-green);
}

.revenue-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.warning-icon {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-orange);
}

.metric-info {
  flex: 1;
}

.metric-number {
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 2.25rem;
  color: var(--text-primary);
  line-height: 1.2;
  margin-bottom: 4px;
}

.metric-label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Tables Section */
.tables-row {
  margin-top: 32px;
}

.table-card {
  background: var(--background-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: var(--shadow-light);
  overflow: hidden;
  transition: all 0.3s ease;
}

.table-card:hover {
  box-shadow: var(--shadow-medium);
}

.table-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.table-header h3 {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--text-primary);
}

/* Table Styling */
.dashboard-table {
  width: 100%;
}

.dashboard-table :deep(.el-table__header) {
  background-color: #f8fafc;
}

.dashboard-table :deep(.el-table__header th) {
  background-color: #f8fafc !important;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid var(--border-color);
  padding: 16px 12px;
}

.dashboard-table :deep(.el-table__body tr) {
  transition: background-color 0.2s ease;
}

.dashboard-table :deep(.el-table__body tr:hover) {
  background-color: #f8fafc;
}

.dashboard-table :deep(.el-table__body td) {
  padding: 16px 12px;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: 1px solid #f1f5f9;
}

.dashboard-table :deep(.el-table__empty-text) {
  color: var(--text-secondary);
  font-weight: 500;
  font-style: italic;
}

.amount-text {
  font-weight: 700;
  color: var(--success-green);
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .metric-number {
    font-size: 2rem;
  }
  
  .metric-card {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 28px;
  }
  
  .metric-number {
    font-size: 1.75rem;
  }
  
  .metric-card {
    padding: 16px;
    gap: 16px;
  }
  
  .metric-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
}
</style>
