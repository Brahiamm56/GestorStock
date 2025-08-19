<template>
  <div class="sales-page">
    <el-card>
      <template #header>
        <div class="header-actions">
          <h2>Gestión de Ventas</h2>
          <el-button type="primary" @click="$router.push('/sales/new')">
            <el-icon><Plus /></el-icon>
            Nueva Venta
          </el-button>
        </div>
      </template>
      
      <div class="filters">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="a"
          start-placeholder="Fecha inicio"
          end-placeholder="Fecha fin"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
        <el-select v-model="statusFilter" placeholder="Estado" clearable>
          <el-option label="Todos" value="" />
          <el-option label="Completadas" value="completed" />
          <el-option label="Pendientes" value="pending" />
          <el-option label="Canceladas" value="cancelled" />
        </el-select>
      </div>
      
      <el-table :data="sales" style="width: 100%" v-loading="loading">
        <el-table-column prop="sale_number" label="Número" width="150" />
        <el-table-column prop="customer_name" label="Cliente" />
        <el-table-column prop="customer_dni" label="DNI" width="120" />
        <el-table-column prop="total_amount" label="Total" width="100">
          <template #default="scope">
            ${{ scope.row.total_amount }}
          </template>
        </el-table-column>
        <el-table-column prop="payment_method" label="Método" width="100" />
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { saleService } from '@/services/api'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'

export default {
  name: 'Sales',
  setup() {
    const router = useRouter()
    const sales = ref([])
    const loading = ref(false)
    const dateRange = ref([])
    const statusFilter = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)

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
        sales.value = response.data.sales
        total.value = response.data.total
      } catch (error) {
        console.error('Error al cargar ventas:', error)
        toast.error('Error al cargar ventas')
      } finally {
        loading.value = false
      }
    }

    const viewSale = (sale) => {
      // Implementar vista detallada de venta
      console.log('Ver venta:', sale)
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

    const formatDate = (date) => {
      return format(new Date(date), 'dd/MM/yyyy')
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      loadSales()
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
      dateRange,
      statusFilter,
      currentPage,
      pageSize,
      total,
      viewSale,
      downloadReceipt,
      getStatusType,
      getStatusText,
      formatDate,
      handleSizeChange,
      handleCurrentChange
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

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
