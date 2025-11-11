# 🛒 GUÍA DE INTEGRACIÓN UX - SALES.VUE

## COMPONENTES A AGREGAR

### 1. Imports necesarios

```javascript
// Componentes UX
import SkeletonTable from '@/components/SkeletonTable.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

// Stores y utilities
import { useLoadingStore } from '@/stores/loading'
import { handleApiError, showSuccess } from '@/utils/errorHandler'
```

### 2. Template - Cards de métricas

```vue
<!-- Reemplazar loading de cards por SkeletonCard -->
<div class="stats-grid">
  <SkeletonCard v-if="loadingStats" v-for="n in 3" :key="n" />
  
  <div v-else class="metric-card sales-total-card">
    <!-- contenido de la card -->
  </div>
</div>
```

### 3. Template - Tabla de ventas

```vue
<!-- Agregar SkeletonTable -->
<SkeletonTable v-if="loading" :rows="10" :columns="7" />

<!-- Agregar EmptyState -->
<EmptyState
  v-else-if="!loading && sales.length === 0"
  type="sales"
  title="No hay ventas registradas"
  description="Crea tu primera venta y comienza a registrar tus transacciones"
  button-text="Nueva Venta"
  @action="showNewSaleForm"
/>

<!-- Tabla -->
<table v-else class="sales-table">
  <!-- contenido -->
</table>
```

### 4. Mejorar badges de método de pago

```vue
<td class="payment-method">
  <span 
    class="badge"
    :class="{
      'badge--success': sale.payment_method === 'efectivo',
      'badge--info': sale.payment_method === 'tarjeta',
      'badge--warning': sale.payment_method === 'transferencia'
    }"
  >
    {{ sale.payment_method }}
  </span>
</td>
```

### 5. Agregar ConfirmDialog para cancelar venta

```vue
<ConfirmDialog
  v-model="cancelDialogVisible"
  title="Cancelar Venta"
  :message="`¿Estás seguro de cancelar la venta #${saleToCancel?.id}?`"
  detail="Esta acción marcará la venta como cancelada y devolverá el stock."
  type="warning"
  confirm-text="Sí, cancelar venta"
  cancel-text="No"
  @confirm="handleCancelConfirm"
/>
```

### 6. Script - Integración

```javascript
setup() {
  const loadingStore = useLoadingStore()
  
  // State
  const loading = ref(true)
  const loadingStats = ref(true)
  const sales = ref([])
  const stats = ref({
    total: 0,
    today: 0,
    revenue: 0
  })
  
  const cancelDialogVisible = ref(false)
  const saleToCancel = ref(null)
  
  // Fetch sales con error handling
  const fetchSales = async () => {
    loading.value = true
    try {
      const response = await saleService.getAll()
      sales.value = response.data.sales || []
    } catch (error) {
      handleApiError(error, 'No se pudieron cargar las ventas')
      sales.value = []
    } finally {
      loading.value = false
    }
  }
  
  // Fetch stats
  const fetchStats = async () => {
    loadingStats.value = true
    try {
      const response = await saleService.getStats()
      stats.value = response.data
    } catch (error) {
      handleApiError(error)
    } finally {
      loadingStats.value = false
    }
  }
  
  // Crear nueva venta
  const handleCreateSale = async (saleData) => {
    loadingStore.show('Procesando venta...')
    
    try {
      await saleService.create(saleData)
      showSuccess('Venta creada exitosamente')
      await fetchSales()
      await fetchStats()
      closeNewSaleForm()
    } catch (error) {
      handleApiError(error, 'No se pudo crear la venta')
    } finally {
      loadingStore.hide()
    }
  }
  
  // Cancelar venta
  const cancelSale = (sale) => {
    saleToCancel.value = sale
    cancelDialogVisible.value = true
  }
  
  const handleCancelConfirm = async () => {
    loadingStore.show('Cancelando venta...')
    
    try {
      await saleService.cancel(saleToCancel.value.id)
      showSuccess('Venta cancelada exitosamente')
      await fetchSales()
      await fetchStats()
    } catch (error) {
      handleApiError(error, 'No se pudo cancelar la venta')
    } finally {
      loadingStore.hide()
      cancelDialogVisible.value = false
    }
  }
  
  // Load data on mount
  onMounted(async () => {
    await Promise.all([fetchSales(), fetchStats()])
  })
  
  return {
    loading,
    loadingStats,
    sales,
    stats,
    cancelDialogVisible,
    saleToCancel,
    handleCancelConfirm,
    handleCreateSale
  }
}
```

### 7. Estilos adicionales

```css
/* Payment method badges */
.payment-method .badge {
  min-width: 90px;
  justify-content: center;
}

/* Sale total with emphasis */
.sale-total {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--primary);
}

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: currentColor;
}

/* Action buttons in table */
.sales-table .action-btn {
  min-width: 80px;
  padding: 6px 12px;
  font-size: var(--text-xs);
}

.action-btn.view {
  color: var(--info);
  border-color: var(--info);
}

.action-btn.view:hover {
  background: var(--info);
  color: var(--text-inverse);
}

.action-btn.cancel {
  color: var(--warning);
  border-color: var(--warning);
}

.action-btn.cancel:hover {
  background: var(--warning);
  color: var(--text-inverse);
}
```

## MEJORAS DE TABLA

### Agregar filtro de fechas mejorado

```vue
<div class="date-filter">
  <input 
    type="date" 
    v-model="filterDates.from"
    class="form-input"
    placeholder="Desde"
  />
  <span>-</span>
  <input 
    type="date" 
    v-model="filterDates.to"
    class="form-input"
    placeholder="Hasta"
  />
  <button class="btn btn-sm btn-primary" @click="applyDateFilter">
    Filtrar
  </button>
</div>
```

### Agregar paginación mejorada

```vue
<div class="pagination">
  <button 
    class="btn btn-sm btn-secondary"
    :disabled="currentPage === 1"
    @click="currentPage--"
  >
    Anterior
  </button>
  
  <span class="pagination-info">
    Página {{ currentPage }} de {{ totalPages }}
  </span>
  
  <button 
    class="btn btn-sm btn-secondary"
    :disabled="currentPage === totalPages"
    @click="currentPage++"
  >
    Siguiente
  </button>
</div>
```

## ANIMACIONES DE ENTRADA

```css
/* Fade in animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-grid .metric-card {
  animation: fadeInUp 0.5s ease-out backwards;
}

.stats-grid .metric-card:nth-child(1) {
  animation-delay: 0.1s;
}

.stats-grid .metric-card:nth-child(2) {
  animation-delay: 0.2s;
}

.stats-grid .metric-card:nth-child(3) {
  animation-delay: 0.3s;
}

/* Table row animation */
.sales-table tbody tr {
  animation: fadeInUp 0.3s ease-out backwards;
}

.sales-table tbody tr:nth-child(odd) {
  animation-delay: calc(var(--index, 0) * 0.05s);
}
```

## CHECKLIST DE IMPLEMENTACIÓN

### Template:
- [ ] SkeletonTable para loading de tabla
- [ ] SkeletonCard para loading de stats
- [ ] EmptyState cuando no hay ventas
- [ ] ConfirmDialog para cancelar
- [ ] Badges mejorados para métodos de pago
- [ ] Filtro de fechas
- [ ] Paginación

### Script:
- [ ] useLoadingStore
- [ ] Error handlers
- [ ] State para ConfirmDialog
- [ ] handleCancelConfirm
- [ ] handleCreateSale con loading
- [ ] fetchSales y fetchStats con error handling

### CSS:
- [ ] Estilos de badges
- [ ] Action buttons
- [ ] Animaciones de entrada
- [ ] Paginación

## RESULTADO ESPERADO

✅ Loading profesional con skeletons
✅ Empty state atractivo
✅ Confirmación antes de cancelar
✅ Badges de colores por método de pago
✅ Filtros de fecha funcionales
✅ Paginación clara
✅ Animaciones suaves
✅ Error handling completo
