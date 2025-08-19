<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Página no encontrada</h2>
      <p>La página que buscas no existe o ha sido movida.</p>
      <el-button type="primary" @click="$router.push('/dashboard')">
        Volver al Dashboard
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.not-found-content {
  text-align: center;
  color: white;
}

.not-found-content h1 {
  font-size: 6rem;
  margin: 0;
  font-weight: bold;
}

.not-found-content h2 {
  font-size: 2rem;
  margin: 1rem 0;
}

.not-found-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}
</style>
