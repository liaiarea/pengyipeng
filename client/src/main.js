import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// 引入Vant组件库
import Vant from 'vant'
import 'vant/lib/index.css'

// 全局样式
import './style.css'

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(createPinia())
app.use(router)
app.use(Vant)

// 全局配置
app.config.globalProperties.$toast = Vant.Toast

// 挂载应用
app.mount('#app')

// 注册PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => {
        console.log('✅ PWA服务注册成功')
      })
      .catch(() => {
        console.log('❌ PWA服务注册失败')
      })
  })
} 