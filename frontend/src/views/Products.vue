<template>
  <div class="products-admin-page" :class="{ 'sidebar-open': sidebarOpen }">
    <!-- Header Principal -->
    <div class="page-header">
      <h1 class="page-title">Administrar Productos</h1>
      <button class="add-product-btn" @click="openSidebar">
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

    <!-- Sidebar Panel for New Product -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="closeSidebar">
      <div class="sidebar-panel" @click.stop>
        <!-- Sidebar Header -->
        <div class="sidebar-header">
          <div>
            <h2 class="sidebar-title">{{ editMode ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
            <p v-if="editMode && originalProductData" class="sidebar-subtitle">{{ originalProductData.name }}</p>
          </div>
          <button type="button" class="close-btn" @click="closeSidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Sidebar Content -->
        <div class="sidebar-content">
          <!-- Loading State -->
          <div v-if="loadingProductData" class="loading-container">
            <div class="loading-spinner">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="loading-text">Cargando datos del producto...</p>
          </div>
          
          <!-- Form -->
          <form v-else class="product-form" @submit.prevent="handleSubmit">
            <!-- Product Name -->
            <div class="form-group">
              <label class="form-label">Nombre del Producto *</label>
              <input 
                v-model="productForm.name" 
                type="text" 
                class="form-input"
                :class="{ 'error': formErrors.name }"
                placeholder="Ingrese el nombre del producto"
                required
                ref="firstInput"
                @blur="validateField('name', productForm.name)"
              />
              <span v-if="formErrors.name" class="error-message">{{ formErrors.name }}</span>
            </div>

            <!-- SKU -->
            <div class="form-group">
              <label class="form-label">SKU/Código *</label>
              <div class="input-with-validation">
                <input 
                  v-model="productForm.sku" 
                  type="text" 
                  class="form-input"
                  :class="{ 'error': formErrors.sku || skuExists, 'checking': skuChecking }"
                  placeholder="Código único del producto"
                  required
                  @input="handleSkuChange($event.target.value)"
                  @blur="validateField('sku', productForm.sku)"
                />
                <div v-if="skuChecking" class="validation-spinner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <span v-if="formErrors.sku" class="error-message">{{ formErrors.sku }}</span>
              <span v-else-if="skuExists" class="error-message">Este SKU ya existe</span>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea 
                v-model="productForm.description" 
                class="form-textarea"
                placeholder="Descripción detallada del producto"
                rows="3"
              ></textarea>
            </div>

            <!-- Price and Stock Row -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Precio *</label>
                <input 
                  v-model.number="productForm.price" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  class="form-input"
                  :class="{ 'error': formErrors.price }"
                  placeholder="0.00"
                  required
                  @blur="validateField('price', productForm.price)"
                />
                <span v-if="formErrors.price" class="error-message">{{ formErrors.price }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Stock Inicial *</label>
                <input 
                  v-model.number="productForm.stock_quantity" 
                  type="number" 
                  min="0" 
                  class="form-input"
                  :class="{ 'error': formErrors.stock_quantity }"
                  placeholder="0"
                  required
                  @blur="validateField('stock_quantity', productForm.stock_quantity)"
                />
                <span v-if="formErrors.stock_quantity" class="error-message">{{ formErrors.stock_quantity }}</span>
              </div>
            </div>

            <!-- Min Stock and Category Row -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Stock Mínimo</label>
                <input 
                  v-model.number="productForm.min_stock" 
                  type="number" 
                  min="0" 
                  class="form-input"
                  placeholder="10"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Categoría *</label>
                <select 
                  v-model="productForm.category" 
                  class="form-select" 
                  :class="{ 'error': formErrors.category }"
                  required
                  @change="validateField('category', productForm.category)"
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="ENVASES">ENVASES</option>
                  <option value="DECORACIÓN">DECORACIÓN</option>
                  <option value="SAHUMERIOS">SAHUMERIOS</option>
                </select>
                <span v-if="formErrors.category" class="error-message">{{ formErrors.category }}</span>
              </div>
            </div>

            <!-- Brand -->
            <div class="form-group">
              <label class="form-label">Marca</label>
              <input 
                v-model="productForm.brand" 
                type="text" 
                class="form-input"
                placeholder="Marca del producto"
              />
            </div>

            <!-- Image Upload -->
            <div class="form-group">
              <label class="form-label">Imagen del Producto</label>
              <div class="image-upload-area" @click="triggerFileInput" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
                <input 
                  ref="fileInput" 
                  type="file" 
                  accept="image/*" 
                  @change="handleFileSelect" 
                  style="display: none;"
                />
                <div v-if="!productForm.image_url" class="upload-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.828 14.828A4 4 0 0 1 12 16A4 4 0 0 1 12 8A4 4 0 0 1 14.828 9.172" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
                </div>
                <div v-else class="image-preview">
                  <img :src="getImageUrl(productForm.image_url)" alt="Preview" />
                  <button type="button" class="remove-image-btn" @click.stop="removeImage">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <button type="button" class="cancel-btn" @click="closeSidebar">Cancelar</button>
          <button type="button" class="create-btn" @click="handleSubmit" :disabled="!isFormValid || submitting">
            <span v-if="submitting">{{ editMode ? 'Actualizando...' : 'Creando...' }}</span>
            <span v-else>{{ editMode ? 'Actualizar Producto' : 'Crear Producto' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { productService, uploadService } from '@/services/api'
import { toast } from 'vue3-toastify'
import { ElMessageBox } from 'element-plus'
import { getImageUrl } from '@/config/api'

export default {
  name: 'Products',
  setup() {
    const router = useRouter()
    const products = ref([])
    const loading = ref(false)
    
    // Sidebar state
    const sidebarOpen = ref(false)
    const submitting = ref(false)
    const firstInput = ref(null)
    const fileInput = ref(null)
    const editMode = ref(false)
    const editingProductId = ref(null)
    const originalProductData = ref(null)
    const loadingProductData = ref(false)
    
    // Product form
    const productForm = reactive({
      name: '',
      sku: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      min_stock: 10,
      category: '',
      brand: '',
      image_url: ''
    })
    
    // Form validation states
    const formErrors = reactive({
      name: '',
      sku: '',
      price: '',
      stock_quantity: '',
      category: ''
    })
    
    const skuChecking = ref(false)
    const skuExists = ref(false)
    
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

    const isFormValid = computed(() => {
      const baseValidation = productForm.name.trim() && 
                            productForm.sku.trim() && 
                            productForm.price > 0 && 
                            productForm.stock_quantity >= 0 && 
                            productForm.category &&
                            !skuExists.value &&
                            !Object.values(formErrors).some(error => error)
      
      // In edit mode, also require changes to be made
      if (editMode.value) {
        return baseValidation && hasUnsavedChanges.value
      }
      
      return baseValidation
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
      console.log('=== DEBUGGING EDIT ===')
      console.log('Product object:', product)
      console.log('Product ID:', product.id)
      console.log('Type of product:', typeof product)
      console.log('Keys of product:', Object.keys(product))
      console.log('========================')
      
      // Verify product is an object and has ID
      if (typeof product !== 'object' || !product) {
        console.error('Product is not an object:', product)
        toast.error('Error: Datos del producto inválidos')
        return
      }
      
      // Get the product ID
      const productId = product.id || product._id
      
      if (!productId) {
        console.error('No ID found in product object')
        toast.error('Error: No se puede editar - ID no encontrado')
        return
      }
      
      // Open sidebar in edit mode
      openSidebar('edit', productId)
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

    // Sidebar methods
    const openSidebar = (mode = 'create', productId = null) => {
      editMode.value = mode === 'edit'
      editingProductId.value = productId
      
      if (editMode.value && productId) {
        loadProductForEdit(productId)
      } else {
        resetForm()
      }
      
      sidebarOpen.value = true
      nextTick(() => {
        firstInput.value?.focus()
      })
    }

    const closeSidebar = () => {
      if (hasUnsavedChanges.value) {
        ElMessageBox.confirm(
          '¿Está seguro de cerrar? Los cambios no guardados se perderán.',
          'Confirmar cierre',
          {
            confirmButtonText: 'Cerrar sin guardar',
            cancelButtonText: 'Continuar editando',
            type: 'warning',
          }
        ).then(() => {
          performCloseSidebar()
        }).catch(() => {
          // User cancelled, do nothing
        })
      } else {
        performCloseSidebar()
      }
    }
    
    const performCloseSidebar = () => {
      sidebarOpen.value = false
      editMode.value = false
      editingProductId.value = null
      originalProductData.value = null
      resetForm()
    }

    const resetForm = () => {
      Object.assign(productForm, {
        name: '',
        sku: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        min_stock: 10,
        category: '',
        brand: '',
        image_url: ''
      })
      
      // Reset validation states
      Object.assign(formErrors, {
        name: '',
        sku: '',
        price: '',
        stock_quantity: '',
        category: ''
      })
      
      skuExists.value = false
      skuChecking.value = false
      originalProductData.value = null
    }

    const triggerFileInput = () => {
      fileInput.value?.click()
    }

    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        uploadImage(file)
      }
    }

    const handleDrop = (event) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        uploadImage(file)
      }
    }

    const getImageUrl = (imageUrl) => {
      if (!imageUrl) return null
      return imageUrl.startsWith('http') ? imageUrl : `/uploads/${imageUrl}`
    }

    const uploadImage = async (file) => {
      try {
        submitting.value = true
        const response = await uploadService.uploadImage(file)
        
        if (response.data.success) {
          productForm.image_url = response.data.data.url
          toast.success('Imagen subida correctamente')
        }
      } catch (error) {
        console.error('Error al subir imagen:', error)
        toast.error('Error al subir la imagen')
      } finally {
        submitting.value = false
      }
    }

    const removeImage = () => {
      productForm.image_url = ''
    }

    const handleSubmit = async () => {
      if (!isFormValid.value) {
        if (editMode.value && !hasUnsavedChanges.value) {
          toast.error('No se han realizado cambios')
        } else {
          toast.error('Por favor completa todos los campos requeridos')
        }
        return
      }

      try {
        submitting.value = true
        
        // Prepare data with proper structure
        const productData = {
          name: productForm.name.trim(),
          sku: productForm.sku.trim().toUpperCase(),
          description: productForm.description?.trim() || '',
          price: parseFloat(productForm.price),
          stock_quantity: parseInt(productForm.stock_quantity),
          min_stock: parseInt(productForm.min_stock) || 0,
          category: productForm.category,
          brand: productForm.brand?.trim() || '',
          image_url: productForm.image_url || ''
        }
        
        console.log(`${editMode.value ? 'Actualizando' : 'Creando'} producto:`, productData)
        
        let response
        if (editMode.value) {
          // Update existing product
          response = await productService.update(editingProductId.value, productData)
          
          // Update product in the list
          const index = products.value.findIndex(p => p.id === editingProductId.value)
          if (index !== -1) {
            products.value[index] = response.data.product
          }
          
          toast.success('Producto actualizado correctamente')
        } else {
          // Create new product
          response = await productService.create(productData)
          
          // Add new product to the list
          products.value.unshift(response.data.product)
          toast.success('Producto creado correctamente')
        }
        
        performCloseSidebar()
        
      } catch (error) {
        console.error(`Error al ${editMode.value ? 'actualizar' : 'crear'} producto:`, error)
        
        // Handle specific error types
        if (error.response?.status === 409) {
          // SKU conflict
          toast.error('El SKU ya existe. Por favor, utiliza un código único.')
          // Focus on SKU field
          const skuInput = document.querySelector('input[placeholder="Código único del producto"]')
          if (skuInput) {
            skuInput.focus()
            skuInput.select()
          }
        } else if (error.response?.status === 400) {
          // Validation errors
          const errorMessage = error.response.data?.error || 'Datos inválidos'
          toast.error(errorMessage)
        } else if (error.response?.status === 401) {
          // Authentication error
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        } else if (error.response?.status === 500) {
          // Server error
          toast.error('Error del servidor. Por favor, inténtalo más tarde.')
        } else {
          // Generic error
          const action = editMode.value ? 'actualizar' : 'crear'
          toast.error(`Error al ${action} el producto. Verifica los datos e inténtalo nuevamente.`)
        }
      } finally {
        submitting.value = false
      }
    }

    // Load product data for editing
    const loadProductForEdit = async (productId) => {
      try {
        loadingProductData.value = true
        const response = await productService.getById(productId)
        const product = response.data.product
        
        // Store original data for comparison
        originalProductData.value = { ...product }
        
        // Populate form with product data
        Object.assign(productForm, {
          name: product.name || '',
          sku: product.sku || '',
          description: product.description || '',
          price: product.price || 0,
          stock_quantity: product.stock_quantity || 0,
          min_stock: product.min_stock || 10,
          category: product.category || '',
          brand: product.brand || '',
          image_url: product.image_url || ''
        })
        
        // Reset validation states
        Object.assign(formErrors, {
          name: '',
          sku: '',
          price: '',
          stock_quantity: '',
          category: ''
        })
        
        skuExists.value = false
        
      } catch (error) {
        console.error('Error loading product:', error)
        toast.error('Error al cargar los datos del producto')
        performCloseSidebar()
      } finally {
        loadingProductData.value = false
      }
    }
    
    // Check for unsaved changes
    const hasUnsavedChanges = computed(() => {
      if (!editMode.value || !originalProductData.value) return false
      
      return (
        productForm.name !== (originalProductData.value.name || '') ||
        productForm.sku !== (originalProductData.value.sku || '') ||
        productForm.description !== (originalProductData.value.description || '') ||
        productForm.price !== (originalProductData.value.price || 0) ||
        productForm.stock_quantity !== (originalProductData.value.stock_quantity || 0) ||
        productForm.min_stock !== (originalProductData.value.min_stock || 10) ||
        productForm.category !== (originalProductData.value.category || '') ||
        productForm.brand !== (originalProductData.value.brand || '') ||
        productForm.image_url !== (originalProductData.value.image_url || '')
      )
    })
    
    // Real-time SKU validation
    const checkSkuUniqueness = async (sku) => {
      if (!sku || sku.length < 2) {
        skuExists.value = false
        formErrors.sku = ''
        return
      }
      
      try {
        skuChecking.value = true
        // Check if SKU exists in current products list (excluding current product in edit mode)
        const existsLocally = products.value.some(p => 
          p.sku.toUpperCase() === sku.toUpperCase() && 
          (!editMode.value || p.id !== editingProductId.value)
        )
        
        if (existsLocally) {
          skuExists.value = true
          formErrors.sku = 'Este SKU ya existe'
        } else {
          skuExists.value = false
          formErrors.sku = ''
        }
      } catch (error) {
        console.error('Error checking SKU:', error)
      } finally {
        skuChecking.value = false
      }
    }
    
    // Debounced SKU check
    let skuTimeout = null
    const handleSkuChange = (value) => {
      clearTimeout(skuTimeout)
      skuTimeout = setTimeout(() => {
        checkSkuUniqueness(value)
      }, 500)
    }
    
    // Form validation functions
    const validateField = (field, value) => {
      switch (field) {
        case 'name':
          formErrors.name = !value?.trim() ? 'El nombre es requerido' : ''
          break
        case 'sku':
          if (!value?.trim()) {
            formErrors.sku = 'El SKU es requerido'
          } else if (value.length < 2) {
            formErrors.sku = 'El SKU debe tener al menos 2 caracteres'
          }
          break
        case 'price':
          formErrors.price = (!value || value <= 0) ? 'El precio debe ser mayor a 0' : ''
          break
        case 'stock_quantity':
          formErrors.stock_quantity = (value < 0) ? 'El stock no puede ser negativo' : ''
          break
        case 'category':
          formErrors.category = !value ? 'La categoría es requerida' : ''
          break
      }
    }
    
    // Keyboard event handler
    const handleKeydown = (event) => {
      if (event.key === 'Escape' && sidebarOpen.value) {
        closeSidebar()
      }
    }

    // Watchers
    watch([searchQuery, selectedCategory, showLowStock], () => {
      currentPage.value = 1
    })

    onMounted(() => {
      loadProducts()
      document.addEventListener('keydown', handleKeydown)
    })

    // Cleanup
    const cleanup = () => {
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    }

    // Watch for component unmount
    watch(() => sidebarOpen.value, (newVal) => {
      if (!newVal) {
        document.body.style.overflow = ''
      }
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
      handleImageError,
      // Sidebar
      sidebarOpen,
      submitting,
      firstInput,
      fileInput,
      productForm,
      formErrors,
      skuChecking,
      skuExists,
      editMode,
      editingProductId,
      loadingProductData,
      hasUnsavedChanges,
      isFormValid,
      openSidebar,
      closeSidebar,
      resetForm,
      triggerFileInput,
      handleFileSelect,
      handleDrop,
      removeImage,
      handleSubmit,
      handleSkuChange,
      validateField
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

/* Sidebar Styles */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.3s ease;
}

.sidebar-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 450px;
  height: 100vh;
  background: #FFFFFF;
  box-shadow: -10px 0 25px -5px rgba(0, 0, 0, 0.1), -5px 0 10px -5px rgba(0, 0, 0, 0.05);
  transform: translateX(0);
  transition: transform 0.3s ease-out;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  animation: slideInFromRight 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInFromRight {
  from { 
    transform: translateX(100%);
  }
  to { 
    transform: translateX(0);
  }
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.sidebar-title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  color: #1F2937;
}

.sidebar-close-btn {
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

.sidebar-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Sidebar Content */
.sidebar-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.product-form {
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

/* Image Upload Area */
.image-upload-area {
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.image-upload-area:hover {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #6b7280;
}

.upload-placeholder svg {
  color: #9ca3af;
}

.upload-placeholder p {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.image-preview img {
  max-width: 100%;
  max-height: 120px;
  border-radius: 8px;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-image-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* Sidebar Footer */
.sidebar-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background: #fafbfc;
}

.cancel-btn {
  flex: 1;
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

.create-btn {
  flex: 1;
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

.create-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.create-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Layout Adjustment for Main Content */
.products-admin-page.sidebar-open {
  margin-right: 450px;
  transition: margin-right 0.3s ease-out;
}

/* Responsive Sidebar Styles */
@media (max-width: 1024px) {
  .sidebar-panel {
    width: 400px;
  }
  
  .products-admin-page.sidebar-open {
    margin-right: 400px;
  }
}

@media (max-width: 768px) {
  .sidebar-panel {
    width: 100%;
    max-width: 100vw;
  }
  
  .products-admin-page.sidebar-open {
    margin-right: 0;
  }
  
  .sidebar-header,
  .sidebar-content,
  .sidebar-footer {
    padding: 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .sidebar-footer {
    flex-direction: column;
    gap: 8px;
  }
  
  .cancel-btn,
  .create-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .sidebar-header {
    padding: 12px;
  }
  
  .sidebar-content {
    padding: 12px;
  }
  
  .sidebar-footer {
    padding: 12px;
  }
  
  .form-group {
    gap: 6px;
  }
  
  .product-form {
    gap: 16px;
  }
}

/* Form Validation Styles */
.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-input.checking {
  border-color: #f59e0b;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 4px;
  display: block;
}

.input-with-validation {
  position: relative;
}

.validation-spinner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #f59e0b;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: translateY(-50%) rotate(0deg); }
  to { transform: translateY(-50%) rotate(360deg); }
}

.form-input:focus.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-select:focus.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Loading Container Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.loading-container .loading-spinner {
  color: #3b82f6;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

/* Sidebar Header Updates */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.sidebar-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
  font-weight: normal;
}
</style>
