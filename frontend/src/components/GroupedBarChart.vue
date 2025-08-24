<template>
  <div class="grouped-bar-chart">
    <canvas ref="chartCanvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'GroupedBarChart',
  props: {
    width: {
      type: Number,
      default: 600
    },
    height: {
      type: Number,
      default: 400
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    let chartInstance = null

    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Series 1',
          data: [100, 45, 85, 65, 55, 40, 50],
          backgroundColor: '#6a5acd',
          borderColor: '#6a5acd',
          borderWidth: 0,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Series 2',
          data: [80, 35, 70, 50, 45, 30, 40],
          backgroundColor: '#b19cd9',
          borderColor: '#b19cd9',
          borderWidth: 0,
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            pointStyle: 'rect',
            font: {
              family: 'Inter, sans-serif',
              size: 12,
              weight: '500'
            },
            color: '#64748b',
            padding: 20,
            boxWidth: 12,
            boxHeight: 12
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: 'Inter, sans-serif',
              size: 12,
              weight: '400'
            },
            color: '#64748b',
            maxRotation: 0,
            minRotation: 0,
            padding: 10
          },
          border: {
            display: false
          },
          categoryPercentage: 0.8,
          barPercentage: 0.9
        },
        y: {
          beginAtZero: true,
          max: 120,
          grid: {
            color: '#f1f5f9',
            lineWidth: 1
          },
          ticks: {
            font: {
              family: 'Inter, sans-serif',
              size: 12,
              weight: '400'
            },
            color: '#64748b',
            stepSize: 20
          },
          border: {
            display: false
          }
        }
      },
      elements: {
        bar: {
          borderRadius: 4
        }
      },
      layout: {
        padding: {
          top: 20,
          right: 20,
          bottom: 40,
          left: 20
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }

    const initChart = () => {
      if (chartCanvas.value) {
        const ctx = chartCanvas.value.getContext('2d')
        
        chartInstance = new ChartJS(ctx, {
          type: 'bar',
          data: chartData,
          options: chartOptions
        })
      }
    }

    const destroyChart = () => {
      if (chartInstance) {
        chartInstance.destroy()
        chartInstance = null
      }
    }

    onMounted(() => {
      setTimeout(initChart, 100)
    })

    onUnmounted(() => {
      destroyChart()
    })

    return {
      chartCanvas
    }
  }
}
</script>

<style scoped>
.grouped-bar-chart {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.grouped-bar-chart canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
