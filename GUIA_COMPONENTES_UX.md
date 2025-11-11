# 🎨 GUÍA DE USO - COMPONENTES UX CRÍTICOS

## ✅ COMPONENTES IMPLEMENTADOS

1. **LoadingOverlay** - Overlay global de carga
2. **ConfirmDialog** - Diálogos de confirmación
3. **SkeletonTable** - Skeleton loader para tablas
4. **SkeletonCard** - Skeleton loader para cards
5. **EmptyState** - Estados vacíos
6. **errorHandler** - Utilidad para manejo de errores

---

## 1️⃣ LOADING OVERLAY GLOBAL

### 📦 Uso Básico

```vue
<script setup>
import { useLoadingStore } from '@/stores/loading'
import { handleApiError, showSuccess } from '@/utils/errorHandler'
import api from '@/services/api'

const loadingStore = useLoadingStore()

async function createProduct(productData) {
  // Mostrar loading
  loadingStore.show('Creando producto...')
  
  try {
    const response = await api.post('/products', productData)
    showSuccess('Producto creado exitosamente')
    return response.data
  } catch (error) {
    handleApiError(error)
  } finally {
    // Ocultar loading
    loadingStore.hide()
  }
}

async function deleteProduct(id) {
  loadingStore.show('Eliminando producto...')
  
  try {
    await api.delete(`/products/${id}`)
    showSuccess('Producto eliminado')
  } catch (error) {
    handleApiError(error)
  } finally {
    loadingStore.hide()
  }
}
</script>
```

### 🎯 Mensajes Personalizados

```javascript
loadingStore.show('Procesando venta...')
loadingStore.show('Subiendo imagen...')
loadingStore.show('Generando reporte...')
loadingStore.show('Actualizando datos...')
```

---

## 2️⃣ CONFIRM DIALOG

### 📦 Implementación en Component

```vue
<template>
  <div>
    <!-- Botón que activa confirmación -->
    <el-button type="danger" @click="showConfirmDelete">
      Eliminar Producto
    </el-button>

    <!-- Dialog de confirmación -->
    <ConfirmDialog
      v-model="confirmDialogVisible"
      title="Eliminar Producto"
      message="¿Estás seguro de eliminar este producto?"
      detail="Esta acción no se puede deshacer."
      type="danger"
      confirm-text="Sí, eliminar"
      cancel-text="Cancelar"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useLoadingStore } from '@/stores/loading'
import { handleApiError, showSuccess } from '@/utils/errorHandler'
import api from '@/services/api'

const loadingStore = useLoadingStore()
const confirmDialogVisible = ref(false)
const productToDelete = ref(null)

function showConfirmDelete(product) {
  productToDelete.value = product
  confirmDialogVisible.value = true
}

async function handleDeleteConfirm() {
  loadingStore.show('Eliminando producto...')
  
  try {
    await api.delete(`/products/${productToDelete.value.id}`)
    showSuccess('Producto eliminado exitosamente')
    // Recargar listado
    await fetchProducts()
  } catch (error) {
    handleApiError(error)
  } finally {
    loadingStore.hide()
    confirmDialogVisible.value = false
  }
}

function handleDeleteCancel() {
  productToDelete.value = null
}
</script>
```

### 🎨 Tipos de Confirmación

```vue
<!-- DANGER - Para eliminaciones -->
<ConfirmDialog
  type="danger"
  title="Eliminar Producto"
  message="¿Estás seguro?"
/>

<!-- WARNING - Para acciones importantes -->
<ConfirmDialog
  type="warning"
  title="Cancelar Venta"
  message="¿Deseas cancelar esta venta?"
/>

<!-- INFO - Para acciones generales -->
<ConfirmDialog
  type="info"
  title="Actualizar Stock"
  message="¿Confirmas el ajuste de stock?"
/>
```

---

## 3️⃣ SKELETON LOADERS

### 📦 Skeleton Table

```vue
<template>
  <div>
    <!-- Mostrar skeleton mientras carga -->
    <SkeletonTable 
      v-if="loading" 
      :rows="10" 
      :columns="6" 
    />
    
    <!-- Tabla real -->
    <el-table v-else :data="products">
      <el-table-column prop="name" label="Nombre" />
      <el-table-column prop="price" label="Precio" />
      <!-- ... -->
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SkeletonTable from '@/components/SkeletonTable.vue'
import api from '@/services/api'

const loading = ref(true)
const products = ref([])

onMounted(async () => {
  await fetchProducts()
})

async function fetchProducts() {
  loading.value = true
  try {
    const response = await api.get('/products')
    products.value = response.data.products
  } finally {
    loading.value = false
  }
}
</script>
```

### 📦 Skeleton Card

```vue
<template>
  <div class="cards-grid">
    <!-- Skeletons mientras carga -->
    <SkeletonCard v-if="loading" v-for="n in 4" :key="n" />
    
    <!-- Cards reales -->
    <div v-else v-for="stat in stats" :key="stat.id" class="stat-card">
      <h3>{{ stat.title }}</h3>
      <p>{{ stat.value }}</p>
    </div>
  </div>
</template>

<script setup>
import SkeletonCard from '@/components/SkeletonCard.vue'
</script>
```

---

## 4️⃣ EMPTY STATES

### 📦 Uso en Products

```vue
<template>
  <div>
    <!-- Mostrar empty state cuando no hay productos -->
    <EmptyState
      v-if="!loading && products.length === 0"
      type="products"
      title="No hay productos"
      description="Comienza agregando tu primer producto al inventario"
      button-text="Agregar Producto"
      @action="openNewProductDialog"
    />
    
    <!-- Tabla de productos -->
    <el-table v-else :data="products">
      <!-- ... -->
    </el-table>
  </div>
</template>

<script setup>
import EmptyState from '@/components/EmptyState.vue'

const products = ref([])

function openNewProductDialog() {
  // Abrir dialog de nuevo producto
}
</script>
```

### 📦 Uso en Sales

```vue
<EmptyState
  v-if="!loading && sales.length === 0"
  type="sales"
  title="No hay ventas registradas"
  description="Crea tu primera venta y comienza a registrar tus transacciones"
  button-text="Nueva Venta"
  @action="openNewSaleDialog"
/>
```

### 📦 Uso en Users

```vue
<EmptyState
  v-if="!loading && users.length === 0"
  type="users"
  title="No hay usuarios"
  description="Invita a tu equipo para comenzar a colaborar"
  button-text="Invitar Usuario"
  @action="openInviteDialog"
/>
```

### 🎨 Custom Icon

```vue
<script setup>
import { Calendar } from '@element-plus/icons-vue'
</script>

<EmptyState
  type="custom"
  :custom-icon="Calendar"
  title="No hay reportes"
  description="Genera tu primer reporte para ver estadísticas"
  button-text="Generar Reporte"
  @action="generateReport"
/>
```

---

## 5️⃣ ERROR HANDLER

### 📦 Uso Básico

```javascript
import { handleApiError, showSuccess, showWarning, showInfo } from '@/utils/errorHandler'

// Manejar errores de API
try {
  const response = await api.post('/products', data)
  showSuccess('Producto creado exitosamente')
} catch (error) {
  handleApiError(error)
}

// Mensaje personalizado
try {
  await api.delete(`/products/${id}`)
} catch (error) {
  handleApiError(error, 'No se pudo eliminar el producto')
}
```

### 🎨 Tipos de Notificaciones

```javascript
// Success
showSuccess('Operación completada exitosamente')

// Warning
showWarning('Ten cuidado con esta acción')

// Info
showInfo('Procesando en segundo plano...')

// Error (automático con handleApiError)
handleApiError(error)
```

---

## 📋 EJEMPLO COMPLETO: Products.vue

```vue
<template>
  <div class="products-page">
    <h1>Productos</h1>
    
    <!-- Skeleton mientras carga -->
    <SkeletonTable v-if="loading" :rows="10" :columns="5" />
    
    <!-- Empty state si no hay datos -->
    <EmptyState
      v-else-if="products.length === 0"
      type="products"
      title="No hay productos"
      description="Comienza agregando tu primer producto"
      button-text="Nuevo Producto"
      @action="openNewProductDialog"
    />
    
    <!-- Tabla de productos -->
    <el-table v-else :data="products">
      <el-table-column prop="name" label="Nombre" />
      <el-table-column prop="price" label="Precio" />
      <el-table-column label="Acciones">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="confirmDelete(row)">
            Eliminar
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- Dialog de confirmación -->
    <ConfirmDialog
      v-model="deleteDialogVisible"
      title="Eliminar Producto"
      :message="`¿Estás seguro de eliminar '${productToDelete?.name}'?`"
      detail="Esta acción no se puede deshacer."
      type="danger"
      confirm-text="Sí, eliminar"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLoadingStore } from '@/stores/loading'
import { handleApiError, showSuccess } from '@/utils/errorHandler'
import api from '@/services/api'
import SkeletonTable from '@/components/SkeletonTable.vue'
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const loadingStore = useLoadingStore()
const loading = ref(true)
const products = ref([])
const deleteDialogVisible = ref(false)
const productToDelete = ref(null)

onMounted(async () => {
  await fetchProducts()
})

async function fetchProducts() {
  loading.value = true
  try {
    const response = await api.get('/products')
    products.value = response.data.products
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

function confirmDelete(product) {
  productToDelete.value = product
  deleteDialogVisible.value = true
}

async function handleDelete() {
  loadingStore.show('Eliminando producto...')
  
  try {
    await api.delete(`/products/${productToDelete.value.id}`)
    showSuccess('Producto eliminado exitosamente')
    
    // Remover de la lista
    products.value = products.value.filter(
      p => p.id !== productToDelete.value.id
    )
  } catch (error) {
    handleApiError(error)
  } finally {
    loadingStore.hide()
  }
}

function openNewProductDialog() {
  // Implementar apertura de dialog
}
</script>
```

---

## 🚀 CHECKLIST DE IMPLEMENTACIÓN

### En cada vista (Products, Sales, Users, etc.):

- [ ] Importar y usar `useLoadingStore` para operaciones async
- [ ] Importar y usar `handleApiError` en todos los catch
- [ ] Usar `SkeletonTable` o `SkeletonCard` durante carga inicial
- [ ] Mostrar `EmptyState` cuando no hay datos
- [ ] Usar `ConfirmDialog` antes de eliminar o cancelar
- [ ] Reemplazar `console.error` por `handleApiError`
- [ ] Usar `showSuccess` para operaciones exitosas

---

## 📊 EJEMPLO DE FLUJO COMPLETO

```javascript
// 1. Usuario hace click en "Eliminar"
function confirmDelete(product) {
  productToDelete.value = product
  deleteDialogVisible.value = true  // Mostrar confirmación
}

// 2. Usuario confirma en el dialog
async function handleDelete() {
  loadingStore.show('Eliminando...')  // Mostrar loading overlay
  
  try {
    await api.delete(`/products/${productToDelete.value.id}`)
    showSuccess('Producto eliminado')  // Toast de éxito
    await fetchProducts()  // Recargar datos
  } catch (error) {
    handleApiError(error)  // Toast de error amigable
  } finally {
    loadingStore.hide()  // Ocultar loading
  }
}
```

---

## 🎨 TIPS DE MEJORES PRÁCTICAS

1. **Siempre usar loadingStore para operaciones que toman tiempo** (>500ms)
2. **Mostrar ConfirmDialog para acciones destructivas** (delete, cancel)
3. **Usar Skeletons en carga inicial**, no en recargas
4. **EmptyStates deben tener acción clara** (botón para crear)
5. **Mensajes de error específicos y accionables**
6. **Toast de success breves** (3-4 segundos)
7. **Loading messages descriptivos** ("Subiendo imagen..." no solo "Cargando...")

---

## ✅ IMPLEMENTACIÓN COMPLETADA

Los 5 componentes críticos están listos para usar. Solo debes:

1. Importarlos en tus vistas
2. Seguir los ejemplos de esta guía
3. Reemplazar los estados de carga actuales por los nuevos componentes

**¡Todo está listo para mejorar la experiencia del usuario!** 🚀
