# 📋 EJEMPLOS COPY-PASTE - Listos para usar

## 🚀 INICIO RÁPIDO

### 1. Componente con Loading, Empty State y ConfirmDialog

```vue
<template>
  <div class="my-view">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Mi Vista</h1>
      <button class="btn btn-primary" @click="openDialog">
        Nuevo Item
      </button>
    </div>

    <!-- Skeleton mientras carga -->
    <SkeletonTable v-if="loading" :rows="10" :columns="5" />

    <!-- Empty State -->
    <EmptyState
      v-else-if="items.length === 0"
      type="custom"
      title="No hay items"
      description="Comienza agregando tu primer item"
      button-text="Nuevo Item"
      @action="openDialog"
    />

    <!-- Tabla con datos -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody class="stagger-fade-in">
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.name }}</td>
            <td>
              <span class="badge badge--success">Activo</span>
            </td>
            <td>
              <button class="action-btn edit" @click="editItem(item)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4A2 2 0 0 0 2 6V20A2 2 0 0 0 4 22H18A2 2 0 0 0 20 20V13" stroke="currentColor" stroke-width="2"/>
                  <path d="M18.5 2.5A2.121 2.121 0 0 1 21 5L11 15L7 16L8 12L18.5 2.5Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              <button class="action-btn delete" @click="confirmDelete(item)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6H5H21" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 6V4A2 2 0 0 1 10 2H14A2 2 0 0 1 16 4V6M19 6V20A2 2 0 0 1 17 22H7A2 2 0 0 1 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ConfirmDialog -->
    <ConfirmDialog
      v-model="deleteVisible"
      title="Eliminar Item"
      :message="`¿Estás seguro de eliminar '${itemToDelete?.name}'?`"
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
import SkeletonTable from '@/components/SkeletonTable.vue'
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import api from '@/services/api'

const loadingStore = useLoadingStore()
const loading = ref(true)
const items = ref([])
const deleteVisible = ref(false)
const itemToDelete = ref(null)

const fetchItems = async () => {
  loading.value = true
  try {
    const response = await api.get('/items')
    items.value = response.data
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

const confirmDelete = (item) => {
  itemToDelete.value = item
  deleteVisible.value = true
}

const handleDelete = async () => {
  loadingStore.show('Eliminando item...')
  try {
    await api.delete(`/items/${itemToDelete.value.id}`)
    items.value = items.value.filter(i => i.id !== itemToDelete.value.id)
    showSuccess('Item eliminado exitosamente')
  } catch (error) {
    handleApiError(error)
  } finally {
    loadingStore.hide()
  }
}

onMounted(() => {
  fetchItems()
})
</script>

<style scoped>
.my-view {
  padding: var(--space-8);
  background: var(--background-secondary);
}

.page-header {
  background: var(--background);
  border-radius: var(--radius-2xl);
  padding: var(--space-6) var(--space-8);
  margin-bottom: var(--space-8);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
}

.table-container {
  background: var(--background);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead th {
  background: var(--gray-50);
  color: var(--text-secondary);
  font-weight: var(--font-semibold);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  padding: var(--space-4);
  text-align: left;
  border-bottom: 2px solid var(--border-color);
}

.data-table tbody tr {
  border-bottom: 1px solid var(--border-color-light);
  transition: background var(--transition-base);
}

.data-table tbody tr:hover {
  background: var(--gray-50);
}

.data-table tbody td {
  padding: var(--space-4);
}

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
  margin-right: var(--space-2);
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
</style>
```

---

## 📊 CARD DE ESTADÍSTICA

```vue
<div class="stat-card stat-card--primary hover-lift">
  <div class="stat-card-header">
    <h3 class="stat-card-title">Total Ventas</h3>
    <div class="stat-card-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2V20M17 5H9.5A3.5 3.5 0 0 0 9.5 12H14.5A3.5 3.5 0 0 1 14.5 19H6" stroke="currentColor" stroke-width="2"/>
      </svg>
    </div>
  </div>
  <div class="stat-card-value">$9,500</div>
  <p class="stat-card-description">Últimos 30 días</p>
  <span class="stat-card-change positive">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2"/>
    </svg>
    12.5%
  </span>
</div>
```

---

## 🎯 STOCK INDICATOR

```vue
<div class="stock-indicator">
  <span 
    class="stock-dot" 
    :class="{
      'stock-dot--high': stock > 50,
      'stock-dot--medium': stock > 20 && stock <= 50,
      'stock-dot--low': stock > 0 && stock <= 20,
      'stock-dot--zero': stock === 0
    }"
  ></span>
  <span class="stock-value">{{ stock }}</span>
</div>

<style scoped>
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
  color: var(--text-primary);
}
</style>
```

---

## 🏷️ BADGES DE ESTADO

```vue
<!-- Success -->
<span class="badge badge--success">Activo</span>

<!-- Warning -->
<span class="badge badge--warning">Pendiente</span>

<!-- Danger -->
<span class="badge badge--danger">Inactivo</span>

<!-- Info -->
<span class="badge badge--info">Nuevo</span>

<!-- Primary -->
<span class="badge badge--primary">Destacado</span>

<style>
/* Ya están definidos en components.css, solo úsalos */
</style>
```

---

## 🔘 BOTONES CON ÍCONOS

```vue
<!-- Primary -->
<button class="btn btn-primary">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2"/>
  </svg>
  Nuevo
</button>

<!-- Success -->
<button class="btn btn-success btn-sm">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"/>
  </svg>
  Guardar
</button>

<!-- Danger -->
<button class="btn btn-danger">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M3 6H5H21M8 6V4A2 2 0 0 1 10 2H14A2 2 0 0 1 16 4V6M19 6V20A2 2 0 0 1 17 22H7A2 2 0 0 1 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
  </svg>
  Eliminar
</button>

<!-- Icon only -->
<button class="btn btn-icon btn-secondary">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2"/>
  </svg>
</button>
```

---

## 🔍 FILTROS CON BÚSQUEDA

```vue
<div class="filters-bar">
  <div class="search-input-wrapper">
    <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2"/>
    </svg>
    <input 
      v-model="searchQuery" 
      type="text" 
      placeholder="Buscar..."
      class="form-input"
      style="padding-left: 44px;"
    />
  </div>

  <select v-model="filterCategory" class="form-select">
    <option value="">Todos</option>
    <option value="cat1">Categoría 1</option>
    <option value="cat2">Categoría 2</option>
  </select>

  <div class="filter-badges">
    <button 
      class="filter-badge"
      :class="{ active: activeFilter === 'all' }"
      @click="activeFilter = 'all'"
    >
      Todos
    </button>
    <button 
      class="filter-badge"
      :class="{ active: activeFilter === 'active' }"
      @click="activeFilter = 'active'"
    >
      Activos
    </button>
  </div>
</div>

<style scoped>
.filters-bar {
  background: var(--background);
  padding: var(--space-5) var(--space-6);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  margin-bottom: var(--space-5);
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  align-items: center;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.filter-badges {
  display: flex;
  gap: var(--space-2);
}

.filter-badge {
  padding: 6px 12px;
  background: var(--gray-100);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.filter-badge:hover {
  background: var(--gray-200);
}

.filter-badge.active {
  background: #FED7AA;
  color: var(--primary-dark);
  border-color: var(--primary);
  font-weight: var(--font-semibold);
}
</style>
```

---

## 📝 FORMULARIO CON VALIDACIÓN

```vue
<template>
  <form @submit.prevent="handleSubmit" class="form-container">
    <div class="form-group">
      <label class="form-label">Nombre *</label>
      <input 
        v-model="form.name"
        type="text" 
        class="form-input"
        :class="{ error: errors.name }"
        placeholder="Ingrese el nombre"
      />
      <span v-if="errors.name" class="error-message">
        {{ errors.name }}
      </span>
    </div>

    <div class="form-group">
      <label class="form-label">Categoría *</label>
      <select 
        v-model="form.category"
        class="form-select"
        :class="{ error: errors.category }"
      >
        <option value="">Seleccione...</option>
        <option value="cat1">Categoría 1</option>
        <option value="cat2">Categoría 2</option>
      </select>
      <span v-if="errors.category" class="error-message">
        {{ errors.category }}
      </span>
    </div>

    <div class="form-group">
      <label class="form-label">Descripción</label>
      <textarea 
        v-model="form.description"
        class="form-textarea"
        rows="4"
        placeholder="Ingrese una descripción"
      ></textarea>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="handleCancel">
        Cancelar
      </button>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        Guardar
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useLoadingStore } from '@/stores/loading'
import { handleApiError, showSuccess } from '@/utils/errorHandler'

const loadingStore = useLoadingStore()
const loading = ref(false)

const form = reactive({
  name: '',
  category: '',
  description: ''
})

const errors = reactive({
  name: '',
  category: ''
})

const validateForm = () => {
  errors.name = ''
  errors.category = ''
  
  if (!form.name.trim()) {
    errors.name = 'El nombre es requerido'
    return false
  }
  
  if (!form.category) {
    errors.category = 'La categoría es requerida'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loadingStore.show('Guardando...')
  loading.value = true
  
  try {
    await api.post('/items', form)
    showSuccess('Item guardado exitosamente')
    // Reset form
    Object.assign(form, { name: '', category: '', description: '' })
  } catch (error) {
    handleApiError(error)
  } finally {
    loadingStore.hide()
    loading.value = false
  }
}

const handleCancel = () => {
  Object.assign(form, { name: '', category: '', description: '' })
  Object.assign(errors, { name: '', category: '' })
}
</script>

<style scoped>
.form-container {
  background: var(--background);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.form-input.error,
.form-select.error {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  display: block;
  color: var(--danger);
  font-size: var(--text-xs);
  margin-top: var(--space-1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-6);
}
</style>
```

---

## 🎭 ANIMACIONES APLICADAS

```vue
<!-- Fade in up -->
<div class="animate-fade-in-up">
  Contenido
</div>

<!-- Stagger para listas -->
<div class="stagger-fade-in">
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
</div>

<!-- Hover lift para cards -->
<div class="card hover-lift">
  Card con efecto hover
</div>

<!-- Hover scale para botones -->
<button class="btn hover-scale">
  Botón con scale
</button>
```

---

## 🎉 ¡TODO LISTO PARA USAR!

Copia y pega estos ejemplos en tus componentes y ajusta según necesites. Todos usan el sistema de diseño ya implementado.
