<template>
  <div class="chart-example-page">
    <div class="page-header">
      <h1>Grouped Bar Chart Example</h1>
      <p>Gráfico de barras agrupadas comparativo con datos mensuales</p>
    </div>
    
    <div class="chart-container">
      <GroupedBarChart :width="800" :height="500" />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import GroupedBarChart from '@/components/GroupedBarChart.vue'

export default defineComponent({
  name: 'ChartExample',
  components: {
    GroupedBarChart
  }
})
</script>

<style scoped>
.chart-example-page {
  padding: 32px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
  font-family: 'Inter', sans-serif;
}

.page-header p {
  font-size: 1.1rem;
  color: #64748b;
  font-family: 'Inter', sans-serif;
}

.chart-container {
  max-width: 900px;
  margin: 0 auto;
  height: 600px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
}
</style>
