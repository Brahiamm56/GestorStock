<template>
  <div class="products-page">
    <el-card>
      <template #header>
        <div class="header-actions">
          <h2>Gestión de Productos</h2>
          <el-button type="primary" @click="$router.push('/products/new')">
            <el-icon><Plus /></el-icon>
            Nuevo Producto
          </el-button>
        </div>
      </template>
      
      <div class="filters">
        <el-input
          v-model="search"
          placeholder="Buscar productos..."
          style="width: 300px"
          clearable
        />
        <el-select v-model="categoryFilter" placeholder="Categoría" clearable>
          <el-option label="Todas" value="" />
          <el-option label="Electrónicos" value="electronics" />
          <el-option label="Ropa" value="clothing" />
          <el-option label="Hogar" value="home" />
        </el-select>
      </div>
      
      <el-table :data="filteredProducts" style="width: 100%" v-loading="loading">
        <el-table-column label="Imagen" width="80">
          <template #default="scope">
            <el-image
              v-if="scope.row.image_url"
              :src="getImageUrl(scope.row.image_url)"
              :preview-src-list="[getImageUrl(scope.row.image_url)]"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px;"
              @error="handleImageError"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="no-image">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Nombre" />
        <el-table-column prop="sku" label="SKU" width="120" />
        <el-table-column prop="price" label="Precio" width="100">
          <template #default="scope">
            ${{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock_quantity" label="Stock" width="80" />
        <el-table-column prop="category" label="Categoría" width="120" />
        <el-table-column label="Acciones" width="200">
          <template #default="scope">
            <el-button size="small" @click="editProduct(scope.row)">Editar</el-button>
            <el-button size="small" type="danger" @click="deleteProduct(scope.row)">Eliminar</el-button>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productService } from '@/services/api'
import { toast } from 'vue3-toastify'
import { ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { getImageUrl } from '@/config/api'

export default {
  name: 'Products',
  components: {
    Picture
  },
  setup() {
    const router = useRouter()
    const products = ref([])
    const loading = ref(false)
    const search = ref('')
    const categoryFilter = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)

    const filteredProducts = computed(() => {
      return products.value.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search.value.toLowerCase()) ||
                            product.sku.toLowerCase().includes(search.value.toLowerCase())
        const matchesCategory = !categoryFilter.value || product.category === categoryFilter.value
        return matchesSearch && matchesCategory
      })
    })

    const loadProducts = async () => {
      loading.value = true
      try {
        const response = await productService.getAll({
          page: currentPage.value,
          limit: pageSize.value
        })
        products.value = response.data.products
        total.value = response.data.total
        

      } catch (error) {
        console.error('Error al cargar productos:', error)
        toast.error('Error al cargar productos')
      } finally {
        loading.value = false
      }
    }

    const editProduct = (product) => {
      router.push(`/products/${product.id}/edit`)
    }

    const deleteProduct = async (product) => {
      console.log(`=== INICIO ELIMINACIÓN FRONTEND ===`);
      console.log(`Producto a eliminar:`, product);
      
      try {
        // Confirmación simple
        const confirmed = await ElMessageBox.confirm(
          `¿Estás seguro de que quieres eliminar el producto "${product.name}"?`,
          'Confirmar eliminación',
          {
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            type: 'warning',
          }
        )
        
        if (!confirmed) {
          console.log('Eliminación cancelada por el usuario');
          return;
        }
        
        console.log(`Enviando DELETE request a: /api/products/${product.id}`);
        
        // Mostrar loading
        loading.value = true
        
        const response = await productService.delete(product.id)
        
        console.log(`Respuesta del servidor:`, response);
        
        if (response.data.success) {
          // Eliminar del array local para actualizar la UI inmediatamente
          products.value = products.value.filter(p => p.id !== product.id)
          
          toast.success('Producto eliminado correctamente')
          console.log(`✅ Producto eliminado del frontend`);
          
          // Recargar la lista para asegurar sincronización
          await loadProducts()
        } else {
          throw new Error(response.data.message || 'Error desconocido');
        }
        
      } catch (error) {
        console.error(`❌ ERROR en eliminación frontend:`, error);
        
        let errorMessage = 'Error al eliminar el producto'
        
        if (error.response) {
          console.error(`Status: ${error.response.status}`);
          console.error(`Data:`, error.response.data);
          
          switch (error.response.status) {
            case 403:
              errorMessage = 'Sin permisos para eliminar este producto'
              break;
            case 404:
              errorMessage = 'El producto no existe o ya fue eliminado'
              break;
            case 500:
              errorMessage = 'Error interno del servidor. Inténtalo más tarde'
              break;
            default:
              errorMessage = `Error ${error.response.status}: ${error.response.data?.message || error.response.data?.error || 'Error desconocido'}`
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage)
      } finally {
        loading.value = false
        console.log(`=== FIN ELIMINACIÓN FRONTEND ===`);
      }
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      loadProducts()
    }

    // Usar la función getImageUrl importada desde la configuración

    const handleImageError = (event) => {
      console.error('Error al cargar imagen:', event)
      // El template ya maneja el error con el slot #error
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadProducts()
    }

    // Función de test directo para debugging
    const testDeleteAPI = async (productId) => {
      console.log(`=== TEST DELETE API ===`);
      console.log(`Testing delete for product ID: ${productId}`);
      
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Test response status:', response.status);
        const data = await response.json();
        console.log('Test response data:', data);
        
        return { status: response.status, data };
        
      } catch (error) {
        console.error('Test error:', error);
        return { error: error.message };
      }
    };

    // Exponer función de test globalmente
    window.testDeleteAPI = testDeleteAPI;

    onMounted(() => {
      loadProducts()
    })

    return {
      products,
      loading,
      search,
      categoryFilter,
      currentPage,
      pageSize,
      total,
      filteredProducts,
      editProduct,
      deleteProduct,
      handleSizeChange,
      handleCurrentChange,
      getImageUrl,
      handleImageError
    }
  }
}
</script>

<style scoped>
.products-page {
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

.image-error,
.no-image {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #c0c4cc;
  font-size: 20px;
  border: 1px solid #e4e7ed;
}

/* Estilos para las imágenes de productos */
.el-image {
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.el-image:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive para imágenes */
@media (max-width: 768px) {
  .image-error,
  .no-image {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}
</style>
