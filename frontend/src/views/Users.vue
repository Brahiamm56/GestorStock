<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <h2>Gestión de Usuarios</h2>
      </template>
      
      <el-table :data="users" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="Nombre" />
        <el-table-column prop="email" label="Email" />
        <el-table-column prop="role" label="Rol" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'primary'">
              {{ scope.row.role === 'admin' ? 'Administrador' : 'Usuario' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="Estado" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
              {{ scope.row.is_active ? 'Activo' : 'Inactivo' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_login" label="Último Login" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.last_login) }}
          </template>
        </el-table-column>
        <el-table-column label="Acciones" width="200">
          <template #default="scope">
            <el-button 
              size="small" 
              @click="toggleRole(scope.row)"
              :type="scope.row.role === 'admin' ? 'warning' : 'success'"
            >
              {{ scope.row.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin' }}
            </el-button>
            <el-button 
              size="small" 
              @click="toggleStatus(scope.row)"
              :type="scope.row.is_active ? 'danger' : 'success'"
            >
              {{ scope.row.is_active ? 'Desactivar' : 'Activar' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { userService } from '@/services/api'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'

export default {
  name: 'Users',
  setup() {
    const users = ref([])
    const loading = ref(false)

    const loadUsers = async () => {
      loading.value = true
      try {
        const response = await userService.getAll()
        users.value = response.data.users
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
        toast.error('Error al cargar usuarios')
      } finally {
        loading.value = false
      }
    }

    const toggleRole = async (user) => {
      try {
        const newRole = user.role === 'admin' ? 'user' : 'admin'
        await userService.updateRole(user.id, newRole)
        user.role = newRole
        toast.success(`Rol actualizado correctamente`)
      } catch (error) {
        console.error('Error al actualizar rol:', error)
        toast.error('Error al actualizar rol')
      }
    }

    const toggleStatus = async (user) => {
      try {
        const newStatus = !user.is_active
        await userService.updateStatus(user.id, newStatus)
        user.is_active = newStatus
        toast.success(`Estado actualizado correctamente`)
      } catch (error) {
        console.error('Error al actualizar estado:', error)
        toast.error('Error al actualizar estado')
      }
    }

    const formatDate = (date) => {
      if (!date) return 'Nunca'
      return format(new Date(date), 'dd/MM/yyyy HH:mm')
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      users,
      loading,
      toggleRole,
      toggleStatus,
      formatDate
    }
  }
}
</script>

<style scoped>
.users-page {
  padding: 20px;
}
</style>
