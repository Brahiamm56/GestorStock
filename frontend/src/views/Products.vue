<template>
  <div class="products-admin-page">
    <!-- Header Principal -->
    <div class="page-header">
      <h1 class="page-title">Administrar Productos</h1>
      <button class="add-product-btn" @click="$router.push('/products/new')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Nuevo Producto
      </button>
    </div>

    <!-- Sistema de Filtros -->
    <div class="filters-section">
      <div class="filters-container">
        <!-- Barra de Búsqueda -->
        <div class="search-container">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Buscar productos..."
              class="search-input"
              @input="handleSearch"
            />
          </div>
        </div>

        <!-- Dropdown de Categorías -->
        <div class="filter-dropdown">
          <select v-model="selectedCategory" class="category-select" @change="applyFilters">
            <option value="">Todos</option>
            <option v-for="category in availableCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <!-- Filtro por Nombre -->
        <button 
          class="filter-btn"
          :class="{ 'active': sortBy === 'name' }"
          @click="toggleSort('name')"
          title="Ordenar por nombre"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Nombre
        </button>

        <!-- Filtro por Precio -->
        <button 
          class="filter-btn"
          :class="{ 'active': sortBy === 'price' }"
          @click="toggleSort('price')"
          title="Ordenar por precio"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1V23M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Precio
        </button>

        <!-- Filtro por Stock Mínimo -->
        <button 
          class="filter-btn warning"
          :class="{ 'active': showLowStock }"
          @click="toggleLowStock"
          title="Mostrar productos con stock bajo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.54 21H20.46A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Stock Mínimo
        </button>

        <!-- Botón Recargar -->
        <button 
          class="filter-btn reload"
          @click="reloadData"
          title="Recargar datos"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23 4V10H17M1 20V14H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 9C19.2214 7.33125 17.2207 6.26562 15 6.26562C10.5817 6.26562 7 9.84333 7 14.2656C7 18.6879 10.5817 22.2656 15 22.2656C17.2207 22.2656 19.2214 21.2 20.49 19.5312" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Recargar
        </button>
      </div>

      <!-- Indicadores de Filtros Activos -->
      <div v-if="hasActiveFilters" class="active-filters">
        <span class="filter-indicator">
          {{ filteredProducts.length }} productos encontrados
        </span>
        <button class="clear-filters-btn" @click="clearAllFilters">
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Tabla de Productos -->
    <div class="table-container">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Cargando productos...</p>
      </div>

      <table class="products-table" v-else>
        <thead>
          <tr>
            <th>NOMBRE</th>
            <th>CATEGORÍA</th>
            <th>DESCRIPCIÓN</th>
            <th>STOCK</th>
            <th>PRECIO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in paginatedProducts" :key="product.id" class="product-row">
            <td class="product-name">
              <div class="product-info">
                <div class="product-image">
                  <img 
                    v-if="product.image_url" 
                    :src="getImageUrl(product.image_url)" 
                    :alt="product.name"
                    @error="handleImageError"
                  />
                  <div v-else class="no-image">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.828 14.828A4 4 0 0 1 12 16A4 4 0 0 1 12 8A4 4 0 0 1 14.828 9.172" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 21V15H15V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div class="product-details">
                  <strong>{{ product.name }}</strong>
                  <small class="sku">SKU: {{ product.sku }}</small>
                </div>
              </div>
            </td>
            <td class="product-category">
              <span class="category-badge">{{ product.category }}</span>
            </td>
            <td class="product-description">
              {{ truncateDescription(product.description) }}
            </td>
            <td class="product-stock">
              <span 
                class="stock-amount"
                :class="{ 'low-stock': isLowStock(product) }"
              >
                {{ product.stock_quantity }}
              </span>
            </td>
            <td class="product-price">
              ${{ formatPrice(product.price) }}
            </td>
            <td class="product-actions">
              <button 
                class="action-btn edit"
                @click="editProduct(product)"
                title="Editar producto"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4A2 2 0 0 0 2 6V20A2 2 0 0 0 4 22H18A2 2 0 0 0 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5A2.121 2.121 0 0 1 21 5L11 15L7 16L8 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button 
                class="action-btn delete"
                @click="deleteProduct(product)"
                title="Eliminar producto"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 6V4A2 2 0 0 1 10 2H14A2 2 0 0 1 16 4V6M19 6V20A2 2 0 0 1 17 22H7A2 2 0 0 1 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div class="pagination-container">
        <div class="pagination-info">
          Mostrando {{ startIndex + 1 }}-{{ endIndex }} de {{ filteredProducts.length }} productos
        </div>
        <div class="pagination-controls">
          <button 
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="page-info">{{ currentPage }} de {{ totalPages }}</span>
          <button 
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { productService } from '@/services/api'
import { toast } from 'vue3-toastify'
import { ElMessageBox } from 'element-plus'
import { getImageUrl } from '@/config/api'

export default {
  name: 'Products',
  setup() {
    const router = useRouter()
    const products = ref([])
    const loading = ref(false)
    
    // Filtros
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const sortBy = ref('')
    const sortOrder = ref('asc')
    const showLowStock = ref(false)
    
    // Paginación
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    
    // Debounce para búsqueda
    let searchTimeout = null

    // Computed properties
    const availableCategories = computed(() => {
      const categories = [...new Set(products.value.map(p => p.category))]
      return categories.sort()
    })

    const filteredProducts = computed(() => {
      let filtered = [...products.value]

      // Filtro por búsqueda
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        )
      }

      // Filtro por categoría
      if (selectedCategory.value) {
        filtered = filtered.filter(product => product.category === selectedCategory.value)
      }

      // Filtro por stock mínimo
      if (showLowStock.value) {
        filtered = filtered.filter(product => isLowStock(product))
      }

      // Ordenamiento
      if (sortBy.value) {
        filtered.sort((a, b) => {
          let aVal = a[sortBy.value]
          let bVal = b[sortBy.value]

          if (sortBy.value === 'name') {
            aVal = aVal.toLowerCase()
            bVal = bVal.toLowerCase()
          }

          if (sortOrder.value === 'asc') {
            return aVal > bVal ? 1 : -1
          } else {
            return aVal < bVal ? 1 : -1
          }
        })
      }

      return filtered
    })

    const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value))
    
    const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
    const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, filteredProducts.value.length))
    
    const paginatedProducts = computed(() => {
      return filteredProducts.value.slice(startIndex.value, endIndex.value)
    })

    const hasActiveFilters = computed(() => {
      return searchQuery.value || selectedCategory.value || sortBy.value || showLowStock.value
    })

    // Métodos
    const loadProducts = async () => {
      loading.value = true
      try {
        const response = await productService.getAll({
          page: 1,
          limit: 1000 // Cargar todos para filtros locales
        })
        products.value = response.data.products
      } catch (error) {
        console.error('Error al cargar productos:', error)
        toast.error('Error al cargar productos')
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        currentPage.value = 1
      }, 300)
    }

    const applyFilters = () => {
      currentPage.value = 1
    }

    const toggleSort = (field) => {
      if (sortBy.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = field
        sortOrder.value = 'asc'
      }
      currentPage.value = 1
    }

    const toggleLowStock = () => {
      showLowStock.value = !showLowStock.value
      currentPage.value = 1
    }

    const clearAllFilters = () => {
      searchQuery.value = ''
      selectedCategory.value = ''
      sortBy.value = ''
      sortOrder.value = 'asc'
      showLowStock.value = false
      currentPage.value = 1
    }

    const reloadData = () => {
      clearAllFilters()
      loadProducts()
    }

    const changePage = (page) => {
      currentPage.value = page
    }

    const editProduct = (product) => {
      router.push(`/products/${product.id}/edit`)
    }

    const deleteProduct = async (product) => {
      try {
        await ElMessageBox.confirm(
          `¿Estás seguro de que quieres eliminar el producto "${product.name}"?`,
          'Confirmar eliminación',
          {
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            type: 'warning',
          }
        )
        
        loading.value = true
        const response = await productService.delete(product.id)
        
        if (response.data.success) {
          products.value = products.value.filter(p => p.id !== product.id)
          toast.success('Producto eliminado correctamente')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Error al eliminar producto:', error)
          toast.error('Error al eliminar el producto')
        }
      } finally {
        loading.value = false
      }
    }

    const truncateDescription = (description) => {
      if (!description) return ''
      return description.length > 50 ? description.substring(0, 50) + '...' : description
    }

    const formatPrice = (price) => {
      return parseFloat(price).toFixed(2)
    }

    const isLowStock = (product) => {
      return product.stock_quantity <= 10 // Stock mínimo configurable
    }

    const handleImageError = (event) => {
      event.target.style.display = 'none'
    }

    // Watchers
    watch([searchQuery, selectedCategory, showLowStock], () => {
      currentPage.value = 1
    })

    onMounted(() => {
      loadProducts()
    })

    return {
      products,
      loading,
      searchQuery,
      selectedCategory,
      sortBy,
      sortOrder,
      showLowStock,
      currentPage,
      itemsPerPage,
      availableCategories,
      filteredProducts,
      totalPages,
      startIndex,
      endIndex,
      paginatedProducts,
      hasActiveFilters,
      handleSearch,
      applyFilters,
      toggleSort,
      toggleLowStock,
      clearAllFilters,
      reloadData,
      changePage,
      editProduct,
      deleteProduct,
      truncateDescription,
      formatPrice,
      isLowStock,
      getImageUrl,
      handleImageError
    }
  }
}
</script>

<style scoped>
.products-admin-page {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333333;
  margin: 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.add-product-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #FFB6C1 0%, #FFA07A 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 182, 193, 0.3);
}

.add-product-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 182, 193, 0.4);
}

/* Filtros */
.filters-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.filters-container {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

/* Búsqueda */
.search-container {
  flex: 1;
  min-width: 250px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #FFB6C1;
  box-shadow: 0 0 0 3px rgba(255, 182, 193, 0.1);
}

/* Dropdown */
.filter-dropdown {
  min-width: 150px;
}

.category-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.category-select:focus {
  border-color: #FFB6C1;
  box-shadow: 0 0 0 3px rgba(255, 182, 193, 0.1);
}

/* Botones de filtro */
.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: #FFB6C1;
  color: #FFB6C1;
  transform: translateY(-1px);
}

.filter-btn.active {
  background: #FFB6C1;
  border-color: #FFB6C1;
  color: white;
}

.filter-btn.warning {
  border-color: #f59e0b;
  color: #f59e0b;
}

.filter-btn.warning:hover,
.filter-btn.warning.active {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

.filter-btn.reload {
  border-color: #10b981;
  color: #10b981;
}

.filter-btn.reload:hover {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

/* Filtros activos */
.active-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.filter-indicator {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.clear-filters-btn {
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filters-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Tabla */
.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #FFB6C1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.products-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.products-table tr:hover {
  background: #f8fafc;
}

/* Producto */
.product-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-details strong {
  color: #111827;
  font-weight: 600;
}

.sku {
  color: #6b7280;
  font-size: 0.75rem;
}

.category-badge {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.product-description {
  color: #6b7280;
  font-size: 0.875rem;
  max-width: 200px;
}

.stock-amount {
  font-weight: 600;
  color: #059669;
}

.stock-amount.low-stock {
  color: #dc2626;
}

.product-price {
  font-weight: 600;
  color: #111827;
}

/* Acciones */
.product-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn.edit {
  background: #f3f4f6;
  color: #374151;
}

.action-btn.edit:hover {
  background: #FFB6C1;
  color: white;
}

.action-btn.delete {
  background: #fef2f2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #dc2626;
  color: white;
}

/* Paginación */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #FFB6C1;
  color: #FFB6C1;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 1024px) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    min-width: auto;
  }
  
  .filter-btn {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .products-admin-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 2rem;
    text-align: center;
  }
  
  .products-table {
    font-size: 0.875rem;
  }
  
  .products-table th,
  .products-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .product-description {
    max-width: 150px;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .products-table {
    display: block;
    overflow-x: auto;
  }
  
  .product-info {
    min-width: 200px;
  }
}
</style>
