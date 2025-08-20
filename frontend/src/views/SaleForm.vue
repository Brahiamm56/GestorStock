<template>
  <div class="new-sale-page">
    <el-card>
      <template #header>
        <div class="header-actions">
          <h2>Nueva Venta</h2>
          <el-button @click="goBack" :disabled="processing">
            <el-icon><ArrowLeft /></el-icon>
            Volver
          </el-button>
        </div>
      </template>
      
      <div class="sale-layout">
        <!-- Sección de Productos (Izquierda) -->
        <div class="products-section">
          <div class="section-header">
            <h3>Productos Disponibles</h3>
            <div class="search-controls">
              <el-input
                v-model="searchTerm"
                placeholder="Buscar productos..."
                clearable
                style="width: 300px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select v-model="categoryFilter" placeholder="Categoría" clearable style="width: 150px">
                <el-option label="Todas" value="" />
                <el-option label="Electrónicos" value="electronics" />
                <el-option label="Ropa" value="clothing" />
                <el-option label="Hogar" value="home" />
                <el-option label="Deportes" value="sports" />
              </el-select>
            </div>
          </div>
          
          <div class="products-grid" v-loading="loadingProducts">
            <div 
              v-for="product in filteredProducts" 
              :key="product.id"
              class="product-card"
              :class="{ 'out-of-stock': product.stock_quantity <= 0 }"
            >
              <div class="product-image">
                <el-image
                  v-if="product.image_url"
                  :src="getImageUrl(product.image_url)"
                  fit="cover"
                  class="product-img"
                >
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div v-else class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>
              
              <div class="product-info">
                <h4 class="product-name">{{ product.name }}</h4>
                <p class="product-sku">SKU: {{ product.sku }}</p>
                <p class="product-price">${{ product.price }}</p>
                <p class="product-stock" :class="{ 'low-stock': product.stock_quantity <= 5 }">
                  Stock: {{ product.stock_quantity }}
                </p>
                
                <el-button
                  type="primary"
                  size="small"
                  @click="addToCart(product)"
                  :disabled="product.stock_quantity <= 0 || isInCart(product.id)"
                  :loading="addingToCart === product.id"
                >
                  <el-icon><Plus /></el-icon>
                  {{ isInCart(product.id) ? 'En carrito' : 'Agregar' }}
                </el-button>
              </div>
            </div>
            
            <div v-if="filteredProducts.length === 0 && !loadingProducts" class="no-products">
              <el-icon><Box /></el-icon>
              <p>No se encontraron productos</p>
            </div>
          </div>
        </div>
        
        <!-- Carrito de Compras (Derecha) -->
        <div class="cart-section">
          <div class="cart-header">
            <h3>Carrito de Compras</h3>
            <el-button 
              type="danger" 
              size="small" 
              @click="clearCart"
              :disabled="cartItems.length === 0"
            >
              <el-icon><Delete /></el-icon>
              Vaciar
            </el-button>
          </div>
          
          <!-- Items del carrito -->
          <div class="cart-items" v-if="cartItems.length > 0">
            <div 
              v-for="item in cartItems" 
              :key="item.id"
              class="cart-item"
            >
              <div class="item-image">
                <el-image
                  v-if="item.image_url"
                  :src="getImageUrl(item.image_url)"
                  fit="cover"
                  class="item-img"
                >
                  <template #error>
                    <div class="image-placeholder small">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div v-else class="image-placeholder small">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>
              
              <div class="item-details">
                <h4 class="item-name">{{ item.name }}</h4>
                <p class="item-price">${{ item.price }} c/u</p>
                
                <div class="quantity-controls">
                  <el-button 
                    size="small" 
                    @click="decreaseQuantity(item)"
                    :disabled="item.quantity <= 1"
                  >
                    <el-icon><Minus /></el-icon>
                  </el-button>
                  <span class="quantity">{{ item.quantity }}</span>
                  <el-button 
                    size="small" 
                    @click="increaseQuantity(item)"
                    :disabled="item.quantity >= item.stock_quantity"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <div class="item-total">
                <span class="subtotal">${{ (item.price * item.quantity).toFixed(2) }}</span>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeFromCart(item)"
                  class="remove-btn"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-cart">
            <el-icon><ShoppingCart /></el-icon>
            <p>El carrito está vacío</p>
            <p>Agrega productos para continuar</p>
          </div>
          
          <!-- Información del cliente -->
          <div class="customer-section">
            <h4>Información del Cliente</h4>
            <el-form :model="customerInfo" label-width="100px">
              <el-form-item label="Nombre" required>
                <el-input 
                  v-model="customerInfo.name" 
                  placeholder="Nombre del cliente"
                  :disabled="processing"
                />
              </el-form-item>
              <el-form-item label="DNI">
                <el-input 
                  v-model="customerInfo.dni" 
                  placeholder="DNI (opcional)"
                  :disabled="processing"
                />
              </el-form-item>
              <el-form-item label="Teléfono">
                <el-input 
                  v-model="customerInfo.phone" 
                  placeholder="Teléfono (opcional)"
                  :disabled="processing"
                />
              </el-form-item>
            </el-form>
          </div>
          
          <!-- Método de pago -->
          <div class="payment-section">
            <h4>Método de Pago</h4>
            <el-select 
              v-model="paymentMethod" 
              placeholder="Seleccionar método de pago"
              style="width: 100%"
              :disabled="processing"
            >
              <el-option label="Efectivo" value="cash" />
              <el-option label="Tarjeta" value="card" />
              <el-option label="Transferencia" value="transfer" />
              <el-option label="Mercado Pago" value="mercadopago" />
              <el-option label="Otro" value="other" />
            </el-select>
          </div>
          
          <!-- Descuento -->
          <div class="discount-section">
            <h4>Descuento</h4>
            <div class="discount-controls">
              <el-radio-group v-model="discountType" :disabled="processing">
                <el-radio label="percentage">Porcentaje (%)</el-radio>
                <el-radio label="fixed">Monto Fijo ($)</el-radio>
              </el-radio-group>
            </div>
            <el-input-number
              v-model="discountValue"
              :min="0"
              :max="discountType === 'percentage' ? 100 : subtotal"
              :precision="discountType === 'percentage' ? 0 : 2"
              placeholder="Ingrese descuento"
              style="width: 100%"
              :disabled="processing"
            />
          </div>
          
          <!-- Totales -->
          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="total-row" v-if="discountApplied > 0">
              <span>Descuento:</span>
              <span class="discount">-${{ discountApplied.toFixed(2) }}</span>
            </div>
            <div class="total-row total-final">
              <span>Total:</span>
              <strong>${{ totalFinal.toFixed(2) }}</strong>
            </div>
            
            <el-button
              type="success"
              size="large"
              @click="processSale"
              :loading="processing"
              :disabled="!canProcessSale"
              style="width: 100%; margin-top: 20px;"
            >
              <el-icon><Check /></el-icon>
              Procesar Venta
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productService, saleService } from '@/services/api'
import { toast } from 'vue3-toastify'
import { getImageUrl } from '@/config/api'
import { 
  ArrowLeft, Search, Plus, Minus, Delete, Picture, 
  ShoppingCart, Box, Check 
} from '@element-plus/icons-vue'

export default {
  name: 'SaleForm',
  components: {
    ArrowLeft,
    Search,
    Plus,
    Minus,
    Delete,
    Picture,
    ShoppingCart,
    Box,
    Check
  },
  setup() {
    const router = useRouter()
    
    // Estados
    const loadingProducts = ref(false)
    const processing = ref(false)
    const addingToCart = ref(null)
    
    // Productos
    const products = ref([])
    const searchTerm = ref('')
    const categoryFilter = ref('')
    
    // Carrito
    const cartItems = ref([])
    
    // Información del cliente
    const customerInfo = ref({
      name: '',
      dni: '',
      phone: ''
    })
    
    // Pago y descuento
    const paymentMethod = ref('')
    const discountType = ref('percentage')
    const discountValue = ref(0)
    
    // Computed
    const filteredProducts = computed(() => {
      return products.value.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                            product.sku.toLowerCase().includes(searchTerm.value.toLowerCase())
        const matchesCategory = !categoryFilter.value || product.category === categoryFilter.value
        return matchesSearch && matchesCategory
      })
    })
    
    const subtotal = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })
    
    const discountApplied = computed(() => {
      if (discountType.value === 'percentage') {
        return (subtotal.value * discountValue.value) / 100
      }
      return Math.min(discountValue.value, subtotal.value)
    })
    
    const totalFinal = computed(() => {
      return subtotal.value - discountApplied.value
    })
    
    const canProcessSale = computed(() => {
      return cartItems.value.length > 0 && 
             customerInfo.value.name.trim() && 
             paymentMethod.value &&
             totalFinal.value > 0
    })
    
    // Métodos
    const loadProducts = async () => {
      loadingProducts.value = true
      try {
        const response = await productService.getAll({ limit: 1000 })
        products.value = response.data.products || []
      } catch (error) {
        console.error('Error al cargar productos:', error)
        toast.error('Error al cargar productos')
      } finally {
        loadingProducts.value = false
      }
    }
    
    const addToCart = async (product) => {
      addingToCart.value = product.id
      try {
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const existingItem = cartItems.value.find(item => item.id === product.id)
        
        if (existingItem) {
          if (existingItem.quantity < product.stock_quantity) {
            existingItem.quantity++
            toast.success('Cantidad actualizada')
          } else {
            toast.warning('No hay más stock disponible')
          }
        } else {
          cartItems.value.push({
            ...product,
            quantity: 1
          })
          toast.success('Producto agregado al carrito')
        }
      } catch (error) {
        console.error('Error al agregar al carrito:', error)
        toast.error('Error al agregar producto')
      } finally {
        addingToCart.value = null
      }
    }
    
    const removeFromCart = (item) => {
      const index = cartItems.value.findIndex(cartItem => cartItem.id === item.id)
      if (index > -1) {
        cartItems.value.splice(index, 1)
        toast.success('Producto removido del carrito')
      }
    }
    
    const increaseQuantity = (item) => {
      if (item.quantity < item.stock_quantity) {
        item.quantity++
      } else {
        toast.warning('No hay más stock disponible')
      }
    }
    
    const decreaseQuantity = (item) => {
      if (item.quantity > 1) {
        item.quantity--
      } else {
        removeFromCart(item)
      }
    }
    
    const clearCart = () => {
      cartItems.value = []
      toast.success('Carrito vaciado')
    }
    
    const isInCart = (productId) => {
      return cartItems.value.some(item => item.id === productId)
    }
    
    const processSale = async () => {
      if (!canProcessSale.value) {
        toast.error('Por favor completa todos los campos requeridos')
        return
      }
      
      processing.value = true
      try {
        const saleData = {
          customer_name: customerInfo.value.name,
          customer_dni: customerInfo.value.dni,
          customer_phone: customerInfo.value.phone,
          payment_method: paymentMethod.value,
          total_amount: totalFinal.value,
          discount_amount: discountApplied.value,
          discount_type: discountType.value,
          items: cartItems.value.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
          }))
        }
        
        await saleService.create(saleData)
        
        toast.success('Venta procesada correctamente')
        
        // Limpiar formulario
        resetForm()
        
        // Redirigir a la lista de ventas
        router.push('/sales')
        
      } catch (error) {
        console.error('Error al procesar venta:', error)
        toast.error('Error al procesar la venta')
      } finally {
        processing.value = false
      }
    }
    
    const resetForm = () => {
      cartItems.value = []
      customerInfo.value = { name: '', dni: '', phone: '' }
      paymentMethod.value = ''
      discountType.value = 'percentage'
      discountValue.value = 0
    }
    
    const goBack = () => {
      if (cartItems.value.length > 0) {
        // Mostrar confirmación si hay items en el carrito
        if (confirm('¿Estás seguro de que quieres salir? Se perderán los items del carrito.')) {
          router.push('/sales')
        }
      } else {
        router.push('/sales')
      }
    }
    
    onMounted(() => {
      loadProducts()
    })
    
    return {
      // Estados
      loadingProducts,
      processing,
      addingToCart,
      
      // Productos
      products,
      searchTerm,
      categoryFilter,
      filteredProducts,
      
      // Carrito
      cartItems,
      
      // Cliente
      customerInfo,
      
      // Pago
      paymentMethod,
      discountType,
      discountValue,
      
      // Computed
      subtotal,
      discountApplied,
      totalFinal,
      canProcessSale,
      
      // Métodos
      loadProducts,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      isInCart,
      processSale,
      resetForm,
      goBack,
      getImageUrl
    }
  }
}
</script>

<style scoped>
.new-sale-page {
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

.sale-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-top: 20px;
}

/* Sección de Productos */
.products-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0 0 15px 0;
  color: #303133;
}

.search-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.product-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-card.out-of-stock {
  opacity: 0.6;
  border-color: #f56c6c;
}

.product-image {
  width: 100%;
  height: 150px;
  margin-bottom: 10px;
  border-radius: 6px;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 24px;
}

.image-placeholder.small {
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.product-info {
  text-align: center;
}

.product-name {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.product-sku {
  margin: 0 0 5px 0;
  font-size: 12px;
  color: #909399;
}

.product-price {
  margin: 0 0 5px 0;
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.product-stock {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #606266;
}

.product-stock.low-stock {
  color: #e6a23c;
  font-weight: bold;
}

.no-products {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #909399;
}

.no-products .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

/* Sección del Carrito */
.cart-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.cart-header h3 {
  margin: 0;
  color: #303133;
}

.cart-items {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 10px;
}

.item-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-img {
  width: 100%;
  height: 100%;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  margin: 0 0 5px 0;
  font-size: 12px;
  color: #909399;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity {
  min-width: 20px;
  text-align: center;
  font-weight: bold;
}

.item-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.subtotal {
  font-weight: bold;
  color: #409eff;
}

.remove-btn {
  padding: 4px 8px;
}

.empty-cart {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.empty-cart .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

/* Secciones del formulario */
.customer-section,
.payment-section,
.discount-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.customer-section h4,
.payment-section h4,
.discount-section h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.discount-controls {
  margin-bottom: 10px;
}

/* Totales */
.totals-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.total-final {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  border-top: 1px solid #e4e7ed;
  padding-top: 10px;
  margin-top: 10px;
}

.discount {
  color: #f56c6c;
}

/* Responsive */
@media (max-width: 1024px) {
  .sale-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }
  
  .cart-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .cart-item {
    flex-direction: column;
    text-align: center;
  }
  
  .item-total {
    align-items: center;
  }
}
</style>
