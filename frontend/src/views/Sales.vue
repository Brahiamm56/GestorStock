<template>
  <div class="sales-page">
    <el-card>
      <template #header>
        <div class="header-actions">
          <h2>Gestión de Ventas</h2>
          <el-button type="primary" @click="goToNewSale" :loading="navigating">
            <el-icon><Plus /></el-icon>
            Nueva Venta
          </el-button>
        </div>
      </template>
      
      <!-- Estadísticas rápidas -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon sales-icon">
                  <el-icon><ShoppingCart /></el-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ stats.totalSales }}</h3>
                  <p>Ventas Totales</p>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon today-icon">
                  <el-icon><Calendar /></el-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ stats.todaySales }}</h3>
                  <p>Ventas Hoy</p>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon revenue-icon">
                  <el-icon><Money /></el-icon>
                </div>
                <div class="stat-info">
                  <h3>${{ stats.totalRevenue }}</h3>
                  <p>Ingresos Totales</p>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon pending-icon">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ stats.pendingSales }}</h3>
                  <p>Pendientes</p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <!-- Filtros -->
      <div class="filters">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="a"
          start-placeholder="Fecha inicio"
          end-placeholder="Fecha fin"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleFilterChange"
        />
        <el-select v-model="statusFilter" placeholder="Estado" clearable @change="handleFilterChange">
          <el-option label="Todos" value="" />
          <el-option label="Completadas" value="completed" />
          <el-option label="Pendientes" value="pending" />
          <el-option label="Canceladas" value="cancelled" />
        </el-select>
        <el-input
          v-model="searchTerm"
          placeholder="Buscar por cliente o número de venta..."
          style="width: 300px"
          clearable
          @input="handleSearchInput"
        />
      </div>
      
      <!-- Tabla de ventas -->
      <el-table :data="filteredSales" style="width: 100%" v-loading="loading">
        <el-table-column prop="sale_number" label="Número" width="150" />
        <el-table-column prop="customer_name" label="Cliente" />
        <el-table-column prop="customer_dni" label="DNI" width="120" />
        <el-table-column prop="total_amount" label="Total" width="100">
          <template #default="scope">
            ${{ scope.row.total_amount }}
          </template>
        </el-table-column>
        <el-table-column prop="payment_method" label="Método" width="100">
          <template #default="scope">
            {{ getPaymentMethodText(scope.row.payment_method) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Estado" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="Fecha" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Acciones" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewSale(scope.row)">Ver</el-button>
            <el-button size="small" type="success" @click="downloadReceipt(scope.row)">
              PDF
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- Paginación -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { saleService } from '@/services/api'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'
import { Plus, ShoppingCart, Calendar, Money, Clock } from '@element-plus/icons-vue'

export default {
  name: 'Sales',
  components: {
    Plus,
    ShoppingCart,
    Calendar,
    Money,
    Clock
  },
  setup() {
    const router = useRouter()
    const sales = ref([])
    const loading = ref(false)
    const navigating = ref(false)
    const dateRange = ref([])
    const statusFilter = ref('')
    const searchTerm = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const searchTimeout = ref(null)
    
    // Estadísticas
    const stats = ref({
      totalSales: 0,
      todaySales: 0,
      totalRevenue: 0,
      pendingSales: 0
    })

    // Ventas filtradas
    const filteredSales = computed(() => {
      if (!searchTerm.value) return sales.value
      
      return sales.value.filter(sale => 
        sale.customer_name?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        sale.sale_number?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        sale.customer_dni?.includes(searchTerm.value)
      )
    })

    const loadSales = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value,
          limit: pageSize.value
        }
        
        if (dateRange.value && dateRange.value.length === 2) {
          params.startDate = dateRange.value[0]
          params.endDate = dateRange.value[1]
        }
        
        if (statusFilter.value) {
          params.status = statusFilter.value
        }
        
        const response = await saleService.getAll(params)
        sales.value = response.data.sales || []
        total.value = response.data.total || 0
        
        // Calcular estadísticas
        calculateStats()
      } catch (error) {
        console.error('Error al cargar ventas:', error)
        toast.error('Error al cargar ventas')
        sales.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    const calculateStats = () => {
      const today = new Date().toISOString().split('T')[0]
      
      stats.value = {
        totalSales: sales.value.length,
        todaySales: sales.value.filter(sale => 
          sale.created_at?.startsWith(today)
        ).length,
        totalRevenue: sales.value.reduce((sum, sale) => 
          sum + (parseFloat(sale.total_amount) || 0), 0
        ).toFixed(2),
        pendingSales: sales.value.filter(sale => 
          sale.status === 'pending'
        ).length
      }
    }

    const goToNewSale = async () => {
      navigating.value = true
      try {
        await router.push('/sales/new')
      } catch (error) {
        console.error('Error al navegar:', error)
        toast.error('Error al navegar a nueva venta')
      } finally {
        navigating.value = false
      }
    }

    const viewSale = (sale) => {
      // Implementar vista detallada de venta
      console.log('Ver venta:', sale)
      toast.info('Funcionalidad en desarrollo')
    }

    const downloadReceipt = async (sale) => {
      try {
        const response = await saleService.generateReceipt(sale.id)
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `comprobante-${sale.sale_number}.pdf`
        link.click()
        window.URL.revokeObjectURL(url)
        toast.success('Comprobante descargado correctamente')
      } catch (error) {
        console.error('Error al descargar comprobante:', error)
        toast.error('Error al descargar comprobante')
      }
    }

    const getStatusType = (status) => {
      switch (status) {
        case 'completed': return 'success'
        case 'pending': return 'warning'
        case 'cancelled': return 'danger'
        default: return 'info'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'completed': return 'Completada'
        case 'pending': return 'Pendiente'
        case 'cancelled': return 'Cancelada'
        default: return status
      }
    }

    const getPaymentMethodText = (method) => {
      switch (method) {
        case 'cash': return 'Efectivo'
        case 'card': return 'Tarjeta'
        case 'transfer': return 'Transferencia'
        case 'mercadopago': return 'Mercado Pago'
        default: return method
      }
    }

    const formatDate = (date) => {
      if (!date) return '-'
      try {
        return format(new Date(date), 'dd/MM/yyyy')
      } catch {
        return date
      }
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      loadSales()
    }

    const handleFilterChange = () => {
      currentPage.value = 1 // Reset to first page when filtering
      loadSales()
    }

    const handleSearchInput = () => {
      // Debounce search input
      clearTimeout(searchTimeout.value)
      searchTimeout.value = setTimeout(() => {
        currentPage.value = 1
        loadSales()
      }, 300)
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadSales()
    }

    onMounted(() => {
      loadSales()
    })

    return {
      sales,
      loading,
      navigating,
      dateRange,
      statusFilter,
      searchTerm,
      currentPage,
      pageSize,
      total,
      stats,
      filteredSales,
      goToNewSale,
      viewSale,
      downloadReceipt,
      getStatusType,
      getStatusText,
      getPaymentMethodText,
      formatDate,
      handleSizeChange,
      handleCurrentChange,
      handleFilterChange,
      handleSearchInput
    }
  }
}
</script>

<style scoped>
.sales-page {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions h2 {
  margin: 0;
}

.stats-section {
  margin-bottom: 30px;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.sales-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.today-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.revenue-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.pending-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info h3 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-info p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
