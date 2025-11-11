import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import App from './App.vue'
import router from './router'
import './style.css'
import './styles/variables.css'
import './styles/design-system.css'
import './styles/components.css'
import './styles/animations.css'
import { Icon as AppIcon } from './constants/icons';

const app = createApp(App)

// Registrar todos los iconos de Element Plus
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.component('Icon', AppIcon);
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(toast, {
  autoClose: 3000,
  position: 'top-right'
})

app.mount('#app')
