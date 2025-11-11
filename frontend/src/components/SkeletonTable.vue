<template>
  <div class="skeleton-table">
    <div v-for="n in rows" :key="n" class="skeleton-row">
      <div 
        v-for="col in columns" 
        :key="col" 
        class="skeleton-cell"
        :style="{ width: getColumnWidth(col) }"
      ></div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  rows: {
    type: Number,
    default: 5
  },
  columns: {
    type: Number,
    default: 5
  }
})

function getColumnWidth(index) {
  // Variar el ancho de las columnas para más realismo
  const widths = ['15%', '25%', '20%', '20%', '20%']
  return widths[index % widths.length]
}
</script>

<style scoped>
.skeleton-table {
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.skeleton-row {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
}

.skeleton-row:last-child {
  border-bottom: none;
}

.skeleton-cell {
  height: 20px;
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 50%,
    #f3f4f6 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
