<template>
  <div class="dashboard">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>Dashboard</h1>
          <div class="user-info">
            <span>Bienvenido, {{ authStore.user?.name }}</span>
            <el-button @click="authStore.logout" type="text">Cerrar Sesión</el-button>
          </div>
        </div>
      </el-header>
      
      <el-container>
        <el-aside width="250px">
          <el-menu
            :default-active="$route.path"
            router
            class="sidebar-menu"
          >
            <el-menu-item index="/dashboard">
              <el-icon><DataBoard /></el-icon>
              <span>Dashboard</span>
            </el-menu-item>
            
            <el-menu-item index="/products">
              <el-icon><Goods /></el-icon>
              <span>Productos</span>
            </el-menu-item>
            
            <el-menu-item index="/sales">
              <el-icon><ShoppingCart /></el-icon>
              <span>Ventas</span>
            </el-menu-item>
            
            <el-menu-item v-if="authStore.isAdmin" index="/users">
              <el-icon><User /></el-icon>
              <span>Usuarios</span>
            </el-menu-item>
            
            <el-menu-item index="/profile">
              <el-icon><Setting /></el-icon>
              <span>Perfil</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        
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
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { productService, saleService } from '@/services/api'

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
        lowStockProducts.value = lowStockResponse.data.products.slice(0, 5)

        // Cargar ventas recientes
        const salesResponse = await saleService.getAll({ limit: 5 })
        recentSales.value = salesResponse.data.sales

        // Cargar estadísticas
        const statsResponse = await saleService.getStats()
        stats.value = statsResponse.data
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error)
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
  height: 100vh;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.el-aside {
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
}

.sidebar-menu {
  border-right: none;
}

.dashboard-content {
  padding: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2rem;
  color: #7c5a43;
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
