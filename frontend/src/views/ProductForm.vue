<template>
  <div class="product-form-page">
    <el-card>
      <template #header>
        <h2>{{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
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
            <el-form-item label="Nombre" prop="name">
              <el-input v-model="form.name" placeholder="Nombre del producto" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="SKU" prop="sku">
              <el-input v-model="form.sku" placeholder="Código SKU" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="Descripción" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3"
            placeholder="Descripción del producto"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Precio" prop="price">
              <el-input-number 
                v-model="form.price" 
                :precision="2" 
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="Stock" prop="stock_quantity">
              <el-input-number 
                v-model="form.stock_quantity" 
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="Stock Mínimo" prop="min_stock">
              <el-input-number 
                v-model="form.min_stock" 
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Categoría" prop="category">
              <el-select v-model="form.category" placeholder="Seleccionar categoría" style="width: 100%">
                <el-option label="Electrónicos" value="electronics" />
                <el-option label="Ropa" value="clothing" />
                <el-option label="Hogar" value="home" />
                <el-option label="Deportes" value="sports" />
                <el-option label="Otros" value="others" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="Marca" prop="brand">
              <el-input v-model="form.brand" placeholder="Marca del producto" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="Imagen URL" prop="image_url">
          <el-input v-model="form.image_url" placeholder="URL de la imagen" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </el-button>
          <el-button @click="$router.push('/products')">Cancelar</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '@/services/api'
import { toast } from 'vue3-toastify'

export default {
  name: 'ProductForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const formRef = ref(null)
    const loading = ref(false)
    
    const isEditing = computed(() => !!route.params.id)

    const form = reactive({
      name: '',
      description: '',
      sku: '',
      price: 0,
      stock_quantity: 0,
      min_stock: 0,
      category: '',
      brand: '',
      image_url: ''
    })

    const rules = {
      name: [
        { required: true, message: 'El nombre es requerido', trigger: 'blur' }
      ],
      sku: [
        { required: true, message: 'El SKU es requerido', trigger: 'blur' }
      ],
      price: [
        { required: true, message: 'El precio es requerido', trigger: 'blur' },
        { type: 'number', min: 0, message: 'El precio debe ser mayor a 0', trigger: 'blur' }
      ],
      stock_quantity: [
        { required: true, message: 'El stock es requerido', trigger: 'blur' },
        { type: 'number', min: 0, message: 'El stock debe ser mayor o igual a 0', trigger: 'blur' }
      ]
    }

    const loadProduct = async () => {
      if (!isEditing.value) return
      
      try {
        const response = await productService.getById(route.params.id)
        Object.assign(form, response.data.product)
      } catch (error) {
        console.error('Error al cargar producto:', error)
        toast.error('Error al cargar producto')
        router.push('/products')
      }
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      
      try {
        await formRef.value.validate()
        loading.value = true
        
        if (isEditing.value) {
          await productService.update(route.params.id, form)
          toast.success('Producto actualizado correctamente')
        } else {
          await productService.create(form)
          toast.success('Producto creado correctamente')
        }
        
        router.push('/products')
      } catch (error) {
        console.error('Error al guardar producto:', error)
        toast.error('Error al guardar producto')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadProduct()
    })

    return {
      formRef,
      form,
      rules,
      loading,
      isEditing,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.product-form-page {
  padding: 20px;
}
</style>
