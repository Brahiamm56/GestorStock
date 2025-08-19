<template>
  <div class="sale-form-page">
    <el-card>
      <template #header>
        <h2>Nueva Venta</h2>
      </template>
      
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="DNI Cliente" prop="customer_dni">
              <el-input v-model="form.customer_dni" placeholder="DNI del cliente" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="Nombre Cliente" prop="customer_name">
              <el-input v-model="form.customer_name" placeholder="Nombre del cliente" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="Método de Pago" prop="payment_method">
          <el-select v-model="form.payment_method" placeholder="Seleccionar método de pago" style="width: 100%">
            <el-option label="Efectivo" value="cash" />
            <el-option label="Tarjeta" value="card" />
            <el-option label="Transferencia" value="transfer" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Notas">
          <el-input 
            v-model="form.notes" 
            type="textarea" 
            :rows="3"
            placeholder="Notas adicionales"
          />
        </el-form-item>
        
        <el-divider>Productos</el-divider>
        
        <div class="products-section">
          <div class="product-item" v-for="(item, index) in form.items" :key="index">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item :label="`Producto ${index + 1}`" :prop="`items.${index}.product_id`">
                  <el-select 
                    v-model="item.product_id" 
                    placeholder="Seleccionar producto"
                    style="width: 100%"
                    @change="onProductChange(index)"
                  >
                    <el-option 
                      v-for="product in availableProducts" 
                      :key="product.id" 
                      :label="`${product.name} (Stock: ${product.stock_quantity})`" 
                      :value="product.id"
                      :disabled="product.stock_quantity <= 0"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="4">
                <el-form-item label="Cantidad" :prop="`items.${index}.quantity`">
                  <el-input-number 
                    v-model="item.quantity" 
                    :min="1"
                    :max="getMaxQuantity(item.product_id)"
                    style="width: 100%"
                    @change="calculateTotal"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="4">
                <el-form-item label="Precio Unit.">
                  <el-input 
                    :value="getProductPrice(item.product_id)" 
                    readonly 
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="4">
                <el-form-item label="Total">
                  <el-input 
                    :value="getItemTotal(index)" 
                    readonly 
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="4">
                <el-button 
                  type="danger" 
                  @click="removeItem(index)"
                  :disabled="form.items.length === 1"
                >
                  Eliminar
                </el-button>
              </el-col>
            </el-row>
          </div>
          
          <el-button type="primary" @click="addItem" style="margin-top: 10px;">
            Agregar Producto
          </el-button>
        </div>
        
        <el-divider />
        
        <div class="total-section">
          <h3>Total de la Venta: ${{ totalAmount }}</h3>
        </div>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            Registrar Venta
          </el-button>
          <el-button @click="$router.push('/sales')">Cancelar</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { saleService, productService } from '@/services/api'
import { toast } from 'vue3-toastify'

export default {
  name: 'SaleForm',
  setup() {
    const router = useRouter()
    const formRef = ref(null)
    const loading = ref(false)
    const availableProducts = ref([])

    const form = reactive({
      customer_dni: '',
      customer_name: '',
      payment_method: 'cash',
      notes: '',
      items: [{ product_id: '', quantity: 1 }]
    })

    const rules = {
      customer_dni: [
        { required: true, message: 'El DNI es requerido', trigger: 'blur' }
      ],
      customer_name: [
        { required: true, message: 'El nombre es requerido', trigger: 'blur' }
      ],
      payment_method: [
        { required: true, message: 'El método de pago es requerido', trigger: 'blur' }
      ]
    }

    const totalAmount = computed(() => {
      return form.items.reduce((total, item, index) => {
        return total + getItemTotal(index)
      }, 0)
    })

    const loadProducts = async () => {
      try {
        const response = await productService.getAll({ limit: 100 })
        availableProducts.value = response.data.products.filter(p => p.is_active)
      } catch (error) {
        console.error('Error al cargar productos:', error)
        toast.error('Error al cargar productos')
      }
    }

    const getProductPrice = (productId) => {
      const product = availableProducts.value.find(p => p.id === productId)
      return product ? product.price : 0
    }

    const getMaxQuantity = (productId) => {
      const product = availableProducts.value.find(p => p.id === productId)
      return product ? product.stock_quantity : 0
    }

    const getItemTotal = (index) => {
      const item = form.items[index]
      const price = getProductPrice(item.product_id)
      return price * item.quantity
    }

    const onProductChange = (index) => {
      const item = form.items[index]
      const maxQuantity = getMaxQuantity(item.product_id)
      if (item.quantity > maxQuantity) {
        item.quantity = maxQuantity
      }
      calculateTotal()
    }

    const calculateTotal = () => {
      // El total se calcula automáticamente con el computed
    }

    const addItem = () => {
      form.items.push({ product_id: '', quantity: 1 })
    }

    const removeItem = (index) => {
      if (form.items.length > 1) {
        form.items.splice(index, 1)
        calculateTotal()
      }
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
        
        // Validar que todos los items tengan producto seleccionado
        const invalidItems = form.items.filter(item => !item.product_id)
        if (invalidItems.length > 0) {
          toast.error('Todos los productos deben estar seleccionados')
          return
        }
        
        loading.value = true
        
        const saleData = {
          ...form,
          total_amount: totalAmount.value
        }
        
        await saleService.create(saleData)
        toast.success('Venta registrada correctamente')
        router.push('/sales')
      } catch (error) {
        console.error('Error al registrar venta:', error)
        toast.error('Error al registrar venta')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadProducts()
    })

    return {
      formRef,
      form,
      rules,
      loading,
      availableProducts,
      totalAmount,
      getProductPrice,
      getMaxQuantity,
      getItemTotal,
      onProductChange,
      calculateTotal,
      addItem,
      removeItem,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.sale-form-page {
  padding: 20px;
}

.products-section {
  margin: 20px 0;
}

.product-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
}

.total-section {
  text-align: right;
  margin: 20px 0;
}

.total-section h3 {
  color: #409eff;
  font-size: 1.5rem;
}
</style>
