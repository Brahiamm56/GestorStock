# 🎨 GUÍA DE INTEGRACIÓN UX - PRODUCTS.VUE

## COMPONENTES A AGREGAR

### 1. Imports necesarios (agregar al <script>)

```javascript
// Componentes UX
import SkeletonTable from '@/components/SkeletonTable.vue'
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

// Stores y utilities
import { useLoadingStore } from '@/stores/loading'
import { handleApiError, showSuccess, showWarning } from '@/utils/errorHandler'
```

### 2. Template Changes

#### Reemplazar loading overlay por SkeletonTable:

```vue
<!-- ANTES -->
<div v-if="loading" class="loading-overlay">
  <div class="loading-spinner"></div>
  <p>Cargando productos...</p>
</div>

<!-- DESPUÉS -->
<SkeletonTable v-if="loading" :rows="10" :columns="6" />
```

#### Agregar EmptyState cuando no hay productos:

```vue
<EmptyState
  v-else-if="!loading && filteredProducts.length === 0"
  type="products"
  title="No hay productos"
  description="Comienza agregando tu primer producto al inventario"
  button-text="Nuevo Producto"
  @action="openSidebar"
/>
```

#### Agregar ConfirmDialog al final del template:

```vue
<ConfirmDialog
  v-model="deleteDialogVisible"
  title="Eliminar Producto"
  :message="`¿Estás seguro de eliminar '${productToDelete?.name}'?`"
  detail="Esta acción no se puede deshacer y el producto se eliminará permanentemente."
  type="danger"
  confirm-text="Sí, eliminar"
  cancel-text="Cancelar"
  @confirm="handleDeleteConfirm"
/>
```

### 3. Mejorar Stock Indicator

```vue
<!-- Reemplazar en la columna de stock -->
<td class="product-stock">
  <div class="stock-indicator">
    <span 
      class="stock-dot" 
      :class="{
        'stock-dot--high': product.stock_quantity > product.stock_min * 2,
        'stock-dot--medium': product.stock_quantity > product.stock_min && product.stock_quantity <= product.stock_min * 2,
        'stock-dot--low': product.stock_quantity > 0 && product.stock_quantity <= product.stock_min,
        'stock-dot--zero': product.stock_quantity === 0
      }"
    ></span>
    <span class="stock-value">{{ product.stock_quantity }}</span>
  </div>
</td>
```

### 4. Mejorar Category Badge

```vue
<!-- Reemplazar category badge -->
<td class="product-category">
  <span class="badge badge--primary">{{ product.category }}</span>
</td>
```

### 5. Script - Agregar reactive state

```javascript
setup() {
  const loadingStore = useLoadingStore()
  
  // State para ConfirmDialog
  const deleteDialogVisible = ref(false)
  const productToDelete = ref(null)
  
  // Función mejorada para eliminar
  const deleteProduct = (product) => {
    productToDelete.value = product
    deleteDialogVisible.value = true
  }
  
  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    loadingStore.show('Eliminando producto...')
    
    try {
      await productService.delete(productToDelete.value.id)
      
      // Remover de la lista
      products.value = products.value.filter(
        p => p.id !== productToDelete.value.id
      )
      
      showSuccess('Producto eliminado exitosamente')
    } catch (error) {
      handleApiError(error, 'No se pudo eliminar el producto')
    } finally {
      loadingStore.hide()
      deleteDialogVisible.value = false
    }
  }
  
  // Función mejorada para crear producto
  const handleSubmit = async () => {
    if (!validateForm()) return
    
    loadingStore.show(editingProduct.value ? 'Actualizando producto...' : 'Creando producto...')
    
    try {
      // Subir imagen si existe
      if (selectedImage.value) {
        const formData = new FormData()
        formData.append('file', selectedImage.value)
        const uploadResponse = await uploadService.upload(formData)
        formProduct.value.image_url = uploadResponse.data.url
      }
      
      if (editingProduct.value) {
        await productService.update(editingProduct.value.id, formProduct.value)
        showSuccess('Producto actualizado exitosamente')
      } else {
        await productService.create(formProduct.value)
        showSuccess('Producto creado exitosamente')
      }
      
      await fetchProducts()
      closeSidebar()
    } catch (error) {
      handleApiError(error)
    } finally {
      loadingStore.hide()
    }
  }
  
  // Fetch products con manejo de errores
  const fetchProducts = async () => {
    loading.value = true
    try {
      const response = await productService.getAll()
      products.value = response.data.products || []
    } catch (error) {
      handleApiError(error, 'No se pudieron cargar los productos')
      products.value = []
    } finally {
      loading.value = false
    }
  }
  
  return {
    // ... otros returns
    deleteDialogVisible,
    productToDelete,
    handleDeleteConfirm
  }
}
```

### 6. Estilos CSS para los nuevos componentes

```css
/* Stock Indicator */
.stock-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.stock-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.stock-dot--high { background: var(--success); }
.stock-dot--medium { background: var(--warning); }
.stock-dot--low { background: var(--danger); }
.stock-dot--zero { background: var(--gray-400); }

.stock-value {
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  color: var(--text-primary);
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.badge--primary {
  background: #FED7AA;
  color: var(--primary-dark);
}

.badge--success {
  background: var(--success-bg);
  color: var(--success-text);
}

.badge--warning {
  background: var(--warning-bg);
  color: var(--warning-text);
}

.badge--danger {
  background: var(--danger-bg);
  color: var(--danger-text);
}

/* Action buttons mejorados */
.action-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background: var(--background);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-btn.edit {
  color: var(--info);
}

.action-btn.edit:hover {
  background: var(--info-bg);
  border-color: var(--info);
}

.action-btn.delete {
  color: var(--danger);
}

.action-btn.delete:hover {
  background: var(--danger-bg);
  border-color: var(--danger);
}
```

## CHECKLIST DE IMPLEMENTACIÓN

### Template:
- [ ] Importar componentes UX
- [ ] Reemplazar loading overlay por SkeletonTable
- [ ] Agregar EmptyState
- [ ] Agregar ConfirmDialog
- [ ] Actualizar stock indicator
- [ ] Mejorar category badge
- [ ] Mejorar action buttons

### Script:
- [ ] Importar useLoadingStore
- [ ] Importar error handlers
- [ ] Agregar state para ConfirmDialog
- [ ] Actualizar deleteProduct
- [ ] Agregar handleDeleteConfirm
- [ ] Actualizar handleSubmit con loading
- [ ] Actualizar fetchProducts con error handling

### CSS:
- [ ] Agregar estilos de stock-indicator
- [ ] Agregar estilos de badges
- [ ] Actualizar action buttons

## RESULTADO ESPERADO

✅ Loading con skeleton loader profesional
✅ Empty state cuando no hay productos
✅ Confirmación antes de eliminar
✅ Stock indicators con colores
✅ Badges de categoría modernos
✅ Loading overlay global en operaciones
✅ Mensajes de error user-friendly
✅ Toast notifications de éxito
