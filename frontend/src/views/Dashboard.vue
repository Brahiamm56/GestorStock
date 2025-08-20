<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Bienvenido, {{ authStore.user?.name }}</p>
    </div>
    
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
.dashboard {
  min-height: 100%;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.dashboard-header p {
  margin: 0;
  color: #606266;
  font-size: 16px;
}

.dashboard-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2rem;
  color: #409eff;
}

.stat-info h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #303133;
}

.stat-info p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 0.9rem;
}
</style>
