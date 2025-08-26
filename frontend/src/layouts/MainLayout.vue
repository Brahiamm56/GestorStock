<template>
  <div class="main-layout">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>Gestor de Stock</h1>
          <div class="user-info">
            <span>Bienvenido, {{ authStore.user?.name }}</span>
            <el-button @click="authStore.logout" type="text">Cerrar Sesión</el-button>
          </div>
        </div>
      </el-header>
      <el-container>
        <el-aside width="250px">
          <el-menu :default-active="$route.path" router class="sidebar-menu">
            <el-menu-item index="/dashboard">
              <el-icon><DataBoard /></el-icon>
              <span>Dashboard</span>
            </el-menu-item>
            <el-menu-item index="/products">
              <el-icon><Goods /></el-icon>
              <span>Productos</span>
            </el-menu-item>
            <el-menu-item index="/sales">
              <el-icon><ShoppingCart /></el-icon>
              <span>Ventas</span>
            </el-menu-item>
            <el-menu-item v-if="authStore.isAdmin" index="/users">
              <el-icon><User /></el-icon>
              <span>Usuarios</span>
            </el-menu-item>
            <el-menu-item index="/profile">
              <el-icon><Setting /></el-icon>
              <span>Perfil</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { DataBoard, Goods, ShoppingCart, User, Setting } from '@element-plus/icons-vue'

const authStore = useAuthStore()
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.el-header {
    height: 12vh;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.el-aside {
    width: 30vh;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu .el-menu-item {
  height: 90px !important;
  line-height: 56px !important;
  font-size: 1.1rem;
  padding-left: 24px !important;
  padding-right: 16px !important;
}

.sidebar-menu .el-menu-item .el-icon {
  font-size: 1.5rem;
  margin-right: 12px;
}
</style>