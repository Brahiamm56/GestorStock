<template>
  <div class="sales-page">
    <!-- Modern Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Gestión de Ventas</h1>
        <p class="page-subtitle">Administra y monitorea todas las ventas del sistema</p>
      </div>
      <button class="new-sale-btn" @click="openNewSaleModal" :disabled="navigating">
        <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ navigating ? 'Cargando...' : 'Nueva Venta' }}</span>
      </button>
    </div>
      
    <!-- Enhanced Statistics Cards -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="metric-card sales-total-card">
          <div class="metric-icon sales-total-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M9 21C9.6 21 10 21.4 10 22S9.6 23 9 23 8 22.6 8 22 8.4 21 9 21ZM20 21C20.6 21 21 21.4 21 22S20.6 23 20 23 19 22.6 19 22 19.4 21 20 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="metric-info">
            <div class="metric-number">{{ stats.totalSales }}</div>
            <div class="metric-label">Ventas Totales</div>
          </div>
        </div>
        
        <div class="metric-card sales-today-card">
          <div class="metric-icon sales-today-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1 4 21 4.9 21 6V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V6C3 4.9 3.9 4 5 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 16L11 18L15 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="metric-info">
            <div class="metric-number">{{ stats.todaySales }}</div>
            <div class="metric-label">Ventas Hoy</div>
          </div>
        </div>
        
        <div class="metric-card revenue-card">
          <div class="metric-icon revenue-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 1V23M17 5H9.5C8.1 5 7 6.1 7 7.5S8.1 10 9.5 10H14.5C15.9 10 17 11.1 17 12.5S15.9 15 14.5 15H7M21 12C21 16.97 16.97 21 12 21S3 16.97 3 12 7.03 3 12 3 21 7.03 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="metric-info">
            <div class="metric-number">${{ stats.totalRevenue }}</div>
            <div class="metric-label">Ingresos Totales</div>
          </div>
        </div>
        
        <div class="metric-card pending-card">
          <div class="metric-icon pending-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="metric-info">
            <div class="metric-number">{{ stats.pendingSales }}</div>
            <div class="metric-label">Pendientes</div>
          </div>
        </div>
      </div>
    </div>
      
    <!-- Enhanced Filters Section -->
    <div class="filters-section">
      <div class="filters-container">
        <div class="search-container">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input 
              v-model="searchTerm" 
              type="text" 
              placeholder="Buscar por cliente o número de venta..."
              class="search-input"
              @input="handleSearchInput"
            />
          </div>
        </div>
        
        <div class="filter-group">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="a"
            start-placeholder="Fecha inicio"
            end-placeholder="Fecha fin"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleFilterChange"
            class="date-picker"
          />
          
          <el-select v-model="statusFilter" placeholder="Estado" clearable @change="handleFilterChange" class="status-select">
            <el-option label="Todos" value="" />
            <el-option label="Completadas" value="completed" />
            <el-option label="Pendientes" value="pending" />
            <el-option label="Canceladas" value="cancelled" />
          </el-select>
        </div>
      </div>
    </div>
      
    <!-- Enhanced Sales Table -->
    <div class="table-section">
      <div class="table-card">
        <div class="table-header">
          <h3>Lista de Ventas</h3>
          <div class="table-actions">
            <span class="results-count">{{ total }} resultados</span>
          </div>
        </div>
        
        <el-table :data="filteredSales" class="sales-table" v-loading="loading" empty-text="No se encontraron ventas">
          <el-table-column prop="sale_number" label="Número" width="150" />
          <el-table-column prop="customer_name" label="Cliente" min-width="180" />
          <el-table-column prop="customer_dni" label="DNI" width="120" align="center" />
          <el-table-column prop="total_amount" label="Total" width="120" align="right">
            <template #default="scope">
              <span class="amount-text">${{ scope.row.total_amount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="payment_method" label="Método" width="130" align="center">
            <template #default="scope">
              <span class="payment-method">{{ getPaymentMethodText(scope.row.payment_method) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="Estado" width="120" align="center">
            <template #default="scope">
              <span class="status-badge" :class="`status-${scope.row.status}`">
                {{ getStatusText(scope.row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="Fecha" width="120" align="center">
            <template #default="scope">
              <span class="date-text">{{ formatDate(scope.row.created_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Acciones" width="180" align="center">
            <template #default="scope">
              <div class="action-buttons">
                <button class="action-btn view-btn" @click="viewSale(scope.row)" title="Ver detalles">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button 
                  class="action-btn pdf-btn" 
                  @click="downloadReceipt(scope.row)" 
                  :disabled="downloadingReceipt === scope.row.id"
                  :title="downloadingReceipt === scope.row.id ? 'Generando PDF...' : 'Descargar PDF'"
                >
                  <svg v-if="downloadingReceipt !== scope.row.id" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
                    <path d="M16 13H8" stroke="currentColor" stroke-width="2"/>
                    <path d="M16 17H8" stroke="currentColor" stroke-width="2"/>
                    <path d="M10 9H9H8" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <svg v-else class="loading-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- Enhanced Pagination -->
        <div class="pagination-section">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            class="modern-pagination"
          />
        </div>
      </div>
    </div>
    
    <!-- Nueva Venta Modal -->
    <div v-if="showNewSaleModal" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Generar Nueva Venta</h2>
          <button class="modal-close-btn" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-content">
          <form @submit.prevent="processSale" class="sale-form">
            <!-- Cliente -->
            <div class="form-group">
              <label class="form-label">Cliente *</label>
              <input 
                v-model="saleForm.customerName" 
                type="text" 
                class="form-input" 
                placeholder="Nombre del cliente"
                required
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">DNI</label>
                <input 
                  v-model="saleForm.customerDni" 
                  type="text" 
                  class="form-input" 
                  placeholder="DNI (opcional)"
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input 
                  v-model="saleForm.customerPhone" 
                  type="text" 
                  class="form-input" 
                  placeholder="Teléfono (opcional)"
                />
              </div>
            </div>
            
            <!-- Productos -->
            <div class="form-group">
              <label class="form-label">Productos *</label>
              <div class="products-selector">
                <div class="selected-products" v-if="saleForm.items.length > 0">
                  <div v-for="(item, index) in saleForm.items" :key="index" class="product-item">
                    <div class="product-info">
                      <span class="product-name">{{ item.name }}</span>
                      <span class="product-price">${{ item.price }}</span>
                    </div>
                    <div class="quantity-controls">
                      <button type="button" @click="decreaseQuantity(index)" class="qty-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                      </button>
                      <span class="quantity">{{ item.quantity }}</span>
                      <button type="button" @click="increaseQuantity(index)" class="qty-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                      </button>
                    </div>
                    <button type="button" @click="removeProduct(index)" class="remove-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <button type="button" @click="showProductSelector = true" class="add-product-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Agregar Producto
                </button>
              </div>
            </div>
            
            <!-- Método de Pago -->
            <div class="form-group">
              <label class="form-label">Método de Pago *</label>
              <select v-model="saleForm.paymentMethod" class="form-select" required>
                <option value="">Seleccionar método</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="mercadopago">Mercado Pago</option>
              </select>
            </div>
            
            <!-- Total -->
            <div class="form-group">
              <div class="total-section">
                <div class="total-row">
                  <span class="total-label">Subtotal:</span>
                  <span class="total-value">${{ subtotalAmount.toFixed(2) }}</span>
                </div>
                <div class="total-row final-total">
                  <span class="total-label">Total:</span>
                  <span class="total-value">${{ subtotalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Observaciones -->
            <div class="form-group">
              <label class="form-label">Observaciones</label>
              <textarea 
                v-model="saleForm.notes" 
                class="form-textarea" 
                placeholder="Observaciones adicionales (opcional)"
                rows="3"
              ></textarea>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button type="button" @click="closeModal" class="cancel-btn">
            Cancelar
          </button>
          <button 
            type="button" 
            @click="processSale" 
            :disabled="!canProcessSale || processing"
            class="generate-btn"
          >
            <span v-if="processing">Procesando...</span>
            <span v-else>Generar Venta</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Product Selector Modal -->
    <div v-if="showProductSelector" class="modal-overlay" @click="showProductSelector = false">
      <div class="product-selector-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Seleccionar Productos</h3>
          <button class="modal-close-btn" @click="showProductSelector = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="product-search">
          <input 
            v-model="productSearchTerm" 
            type="text" 
            class="form-input" 
            placeholder="Buscar productos..."
          />
        </div>
        
        <div class="products-list">
          <div 
            v-for="product in filteredProductsForSelector" 
            :key="product.id"
            class="product-option"
            @click="addProductToSale(product)"
          >
            <div class="product-details">
              <span class="product-name">{{ product.name }}</span>
              <span class="product-sku">SKU: {{ product.sku }}</span>
            </div>
            <div class="product-price">${{ product.price }}</div>
            <div class="product-stock">Stock: {{ product.stock_quantity }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { saleService, productService } from '@/services/api'
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
    const downloadingReceipt = ref(null)
    const dateRange = ref([])
    const statusFilter = ref('')
    const searchTerm = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const searchTimeout = ref(null)
    
    // Modal states
    const showNewSaleModal = ref(false)
    const showProductSelector = ref(false)
    const processing = ref(false)
    
    // Products for modal
    const availableProducts = ref([])
    const productSearchTerm = ref('')
    
    // Sale form data
    const saleForm = ref({
      customerName: '',
      customerDni: '',
      customerPhone: '',
      paymentMethod: '',
      items: [],
      notes: ''
    })
    
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

    // Modal functionality
    const openNewSaleModal = async () => {
      showNewSaleModal.value = true
      await loadProductsForModal()
      document.body.style.overflow = 'hidden'
    }
    
    const closeModal = () => {
      showNewSaleModal.value = false
      showProductSelector.value = false
      resetSaleForm()
      document.body.style.overflow = 'auto'
    }
    
    const resetSaleForm = () => {
      saleForm.value = {
        customerName: '',
        customerDni: '',
        customerPhone: '',
        paymentMethod: '',
        items: [],
        notes: ''
      }
    }
    
    const loadProductsForModal = async () => {
      try {
        const response = await productService.getAll({ limit: 1000 })
        availableProducts.value = response.data.products || []
      } catch (error) {
        console.error('Error al cargar productos:', error)
        toast.error('Error al cargar productos')
      }
    }

    const viewSale = (sale) => {
      // Implementar vista detallada de venta
      console.log('Ver venta:', sale)
      toast.info('Funcionalidad en desarrollo')
    }

    const downloadReceipt = async (sale) => {
      try {
        // Prevenir múltiples clicks
        downloadingReceipt.value = sale.id
        
        // Mostrar loading
        toast.info('Generando comprobante...')
        
        const response = await saleService.generateReceipt(sale.id)
        
        // Verificar que la respuesta sea válida
        if (!response.data || response.data.byteLength === 0) {
          throw new Error('El PDF generado está vacío')
        }
        
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
        
        let errorMessage = 'Error al descargar comprobante'
        if (error.response?.status === 404) {
          errorMessage = 'Venta no encontrada'
        } else if (error.response?.status === 500) {
          errorMessage = 'Error del servidor al generar PDF'
        } else if (error.message) {
          errorMessage = error.message
        }
        
        toast.error(errorMessage)
      } finally {
        // Reset loading state
        downloadingReceipt.value = null
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

    // Product selector functionality
    const filteredProductsForSelector = computed(() => {
      return availableProducts.value.filter(product => {
        const searchLower = productSearchTerm.value.toLowerCase()
        return product.name.toLowerCase().includes(searchLower) ||
               product.sku.toLowerCase().includes(searchLower)
      }).filter(product => product.stock_quantity > 0)
    })
    
    const addProductToSale = (product) => {
      const existingItem = saleForm.value.items.find(item => item.id === product.id)
      
      if (existingItem) {
        if (existingItem.quantity < product.stock_quantity) {
          existingItem.quantity++
          toast.success('Cantidad actualizada')
        } else {
          toast.warning('No hay más stock disponible')
        }
      } else {
        saleForm.value.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock_quantity: product.stock_quantity
        })
        toast.success('Producto agregado')
      }
      
      showProductSelector.value = false
      productSearchTerm.value = ''
    }
    
    const increaseQuantity = (index) => {
      const item = saleForm.value.items[index]
      if (item.quantity < item.stock_quantity) {
        item.quantity++
      } else {
        toast.warning('No hay más stock disponible')
      }
    }
    
    const decreaseQuantity = (index) => {
      const item = saleForm.value.items[index]
      if (item.quantity > 1) {
        item.quantity--
      } else {
        removeProduct(index)
      }
    }
    
    const removeProduct = (index) => {
      saleForm.value.items.splice(index, 1)
      toast.success('Producto removido')
    }
    
    // Sale processing
    const subtotalAmount = computed(() => {
      return saleForm.value.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity)
      }, 0)
    })
    
    const canProcessSale = computed(() => {
      return saleForm.value.customerName.trim() &&
             saleForm.value.paymentMethod &&
             saleForm.value.items.length > 0 &&
             subtotalAmount.value > 0
    })
    
    const processSale = async () => {
      if (!canProcessSale.value) {
        toast.error('Por favor completa todos los campos requeridos')
        return
      }

      // Validate phone format if provided
      if (saleForm.value.customerPhone && saleForm.value.customerPhone.trim()) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/
        if (!phoneRegex.test(saleForm.value.customerPhone.trim())) {
          toast.error('Formato de teléfono inválido')
          return
        }
      }

      // Validate DNI format if provided
      if (saleForm.value.customerDni && saleForm.value.customerDni.trim()) {
        const dniRegex = /^\d{7,8}$/
        if (!dniRegex.test(saleForm.value.customerDni.trim())) {
          toast.error('DNI debe tener 7 u 8 dígitos')
          return
        }
      }
      
      processing.value = true
      try {
        const saleData = {
          customer_name: saleForm.value.customerName.trim(),
          customer_dni: saleForm.value.customerDni?.trim() || null,
          customer_phone: saleForm.value.customerPhone?.trim() || null,
          payment_method: saleForm.value.paymentMethod,
          notes: saleForm.value.notes?.trim() || null,
          items: saleForm.value.items.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
          }))
        }
        
        console.log('Enviando datos de venta:', saleData)
        const response = await saleService.create(saleData)
        console.log('Respuesta del servidor:', response)
        
        toast.success('Venta generada correctamente')
        closeModal()
        loadSales() // Refresh the sales list
        
      } catch (error) {
        console.error('Error al procesar venta:', error)
        
        if (error.response) {
          const status = error.response.status
          const message = error.response.data?.error || error.response.data?.message || 'Error desconocido'
          
          switch (status) {
            case 400:
              toast.error(`Error de validación: ${message}`)
              break
            case 401:
              toast.error('Sesión expirada. Por favor inicia sesión nuevamente')
              break
            case 404:
              toast.error('Producto no encontrado')
              break
            case 500:
              toast.error('Error interno del servidor. Intenta nuevamente')
              break
            default:
              toast.error(`Error: ${message}`)
          }
        } else if (error.request) {
          toast.error('Error de conexión. Verifica tu conexión a internet')
        } else {
          toast.error('Error inesperado al procesar la venta')
        }
      } finally {
        processing.value = false
      }
    }
    
    // Keyboard event handler
    const handleKeydown = (event) => {
      if (event.key === 'Escape' && (showNewSaleModal.value || showProductSelector.value)) {
        closeModal()
      }
    }
    
    onMounted(() => {
      loadSales()
      document.addEventListener('keydown', handleKeydown)
    })
    
    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = 'auto'
    })

    return {
      // Original sales data
      sales,
      loading,
      navigating,
      downloadingReceipt,
      dateRange,
      statusFilter,
      searchTerm,
      currentPage,
      pageSize,
      total,
      stats,
      filteredSales,
      
      // Modal states
      showNewSaleModal,
      showProductSelector,
      processing,
      
      // Sale form
      saleForm,
      availableProducts,
      productSearchTerm,
      filteredProductsForSelector,
      subtotalAmount,
      canProcessSale,
      
      // Methods
      openNewSaleModal,
      closeModal,
      addProductToSale,
      increaseQuantity,
      decreaseQuantity,
      removeProduct,
      processSale,
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

:root {
  --primary-blue: #2563eb;
  --light-blue: #dbeafe;
  --success-green: #10b981;
  --warning-orange: #f59e0b;
  --danger-red: #ef4444;
  --purple: #8b5cf6;
  --pink: #ec4899;
  --cyan: #06b6d4;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --background-card: #ffffff;
  --border-color: #e5e7eb;
  --shadow-light: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-large: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.sales-page {
  min-height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: var(--bg-cream-primary);
  padding: 24px;
}

/* Modern Header */
.page-header {
  background: var(--bg-white);
  border-radius: 16px;
  padding: 24px 32px;
  margin-bottom: 32px;
  box-shadow: var(--header-shadow);
  border: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.header-content h1.page-title {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  line-height: 1.2;
}

.page-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 500;
}

.new-sale-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--primary-blue) 0%, #bd7619 100%);
  color: rgb(27, 27, 27);
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-light);
}

.new-sale-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
}

.new-sale-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  transition: transform 0.3s ease;
}

.new-sale-btn:hover:not(:disabled) .btn-icon {
  transform: rotate(90deg);
}

/* Enhanced Statistics Cards */
.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

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
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.metric-card:hover::before {
  opacity: 1;
}

/* Specific card styling */
.sales-total-card::before {
  background: linear-gradient(90deg, var(--purple), #7c3aed);
}

.sales-today-card::before {
  background: linear-gradient(90deg, var(--pink), #db2777);
}

.revenue-card::before {
  background: linear-gradient(90deg, var(--cyan), #0891b2);
}

.pending-card::before {
  background: linear-gradient(90deg, var(--success-green), #059669);
}

.metric-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.sales-total-icon {
  background: rgba(139, 92, 246, 0.1);
  color: var(--purple);
}

.sales-today-icon {
  background: rgba(236, 72, 153, 0.1);
  color: var(--pink);
}

.revenue-icon {
  background: rgba(6, 182, 212, 0.1);
  color: var(--cyan);
}

.pending-icon {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-green);
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

/* Enhanced Filters Section */
.filters-section {
  margin-bottom: 32px;
}

.filters-container {
  background: var(--background-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-light);
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.search-container {
  flex: 1;
  min-width: 300px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--text-secondary);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  background: #fafbfc;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
  font-weight: 400;
}

.filter-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.date-picker, .status-select {
  min-width: 200px;
}

/* Enhanced Table Section */
.table-section {
  margin-bottom: 32px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--text-primary);
}

.results-count {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: rgba(37, 99, 235, 0.1);
  padding: 6px 12px;
  border-radius: 8px;
}

/* Enhanced Table Styling */
.sales-table {
  width: 100%;
}

.sales-table :deep(.el-table__header) {
  background-color: #f8fafc;
}

.sales-table :deep(.el-table__header th) {
  background-color: #f8fafc !important;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid var(--border-color);
  padding: 16px 12px;
}

.sales-table :deep(.el-table__body tr) {
  transition: background-color 0.2s ease;
}

.sales-table :deep(.el-table__body tr:hover) {
  background-color: #f8fafc;
}

.sales-table :deep(.el-table__body td) {
  padding: 16px 12px;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  border-bottom: 1px solid #f1f5f9;
}

.sales-table :deep(.el-table__empty-text) {
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-style: italic;
}

/* Table Content Styling */
.amount-text {
  font-weight: 700;
  color: var(--success-green);
  font-size: 0.9rem;
}

.payment-method {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.date-text {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-completed {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-green);
}

.status-pending {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-orange);
}

.status-cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-red);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.view-btn {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary-blue);
}

.view-btn:hover {
  background: var(--primary-blue);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

.pdf-btn {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-green);
}

.pdf-btn:hover {
  background: var(--success-green);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

/* Enhanced Pagination */
.pagination-section {
  padding: 24px;
  border-top: 1px solid var(--border-color);
  background: #fafbfc;
  display: flex;
  justify-content: center;
}

.modern-pagination :deep(.el-pagination) {
  font-family: 'Inter', sans-serif;
}

.modern-pagination :deep(.el-pagination .el-pager li) {
  font-weight: 500;
  border-radius: 8px;
  margin: 0 2px;
}

.modern-pagination :deep(.el-pagination .el-pager li.is-active) {
  background: var(--primary-blue);
  color: white;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .metric-number {
    font-size: 2rem;
  }
  
  .metric-card {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .sales-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-content h1.page-title {
    font-size: 28px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
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
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .search-container {
    min-width: unset;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .date-picker, .status-select {
    min-width: unset;
  }
  
  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .sales-table :deep(.el-table__body td),
  .sales-table :deep(.el-table__header th) {
    padding: 8px 6px;
    font-size: 0.8rem;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to { 
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-container {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.modal-title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: #1F2937;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.modal-content {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px 24px;
  border-top: 1px solid #e5e7eb;
  background: #fafbfc;
}

/* Form Styles */
.sale-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  color: #1F2937;
  margin-bottom: 4px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #1F2937;
  background: white;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #6b7280;
  font-weight: 400;
}

.form-select {
  cursor: pointer;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Products Selector */
.products-selector {
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #fafbfc;
}

.selected-products {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  gap: 12px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 600;
  color: #1F2937;
  font-size: 0.875rem;
}

.product-price {
  font-weight: 500;
  color: #10b981;
  font-size: 0.8rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.qty-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.05);
}

.quantity {
  font-weight: 600;
  color: #1F2937;
  min-width: 24px;
  text-align: center;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.05);
  color: #ef4444;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #ef4444;
  color: white;
}

.add-product-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px dashed #2563eb;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.05);
  color: #2563eb;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
}

.add-product-btn:hover {
  background: rgba(37, 99, 235, 0.1);
  border-color: #1d4ed8;
}

/* Total Section */
.total-section {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.total-row:last-child {
  margin-bottom: 0;
}

.total-label {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  color: #6b7280;
}

.total-value {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  color: #1F2937;
}

.final-total {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
  margin-top: 8px;
}

.final-total .total-label,
.final-total .total-value {
  font-weight: 700;
  font-size: 1.125rem;
  color: #1F2937;
}

/* Modal Footer Buttons */
.cancel-btn {
  padding: 12px 24px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #6B7280;
  color: white;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #4b5563;
  border-color: #4b5563;
}

.generate-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.generate-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Product Selector Modal */
.product-selector-modal {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.product-search {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.products-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px 0;
}

.product-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.product-option:hover {
  background: #f8fafc;
}

.product-option:last-child {
  border-bottom: none;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-details .product-name {
  font-weight: 600;
  color: #1F2937;
  font-size: 0.875rem;
}

.product-sku {
  font-weight: 400;
  color: #6b7280;
  font-size: 0.75rem;
}

.product-option .product-price {
  font-weight: 600;
  color: #10b981;
  margin: 0 16px;
}

.product-stock {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.75rem;
  min-width: 80px;
  text-align: right;
}

/* Responsive Modal Styles */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .product-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .quantity-controls {
    justify-content: center;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 8px;
  }
  
  .cancel-btn,
  .generate-btn {
    width: 100%;
  }
  
  .product-selector-modal {
    width: 95%;
    max-height: 90vh;
  }
  
  .product-option {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .product-option .product-price,
  .product-stock {
    margin: 0;
    text-align: left;
  }
}

/* Loading Spinner Animation */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
