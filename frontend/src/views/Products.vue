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

export default {
  name: 'Products',
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
      try {
        await productService.delete(product.id)
        toast.success('Producto eliminado correctamente')
        loadProducts()
      } catch (error) {
        console.error('Error al eliminar producto:', error)
        toast.error('Error al eliminar producto')
      }
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      loadProducts()
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadProducts()
    }

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
      handleCurrentChange
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
</style>
