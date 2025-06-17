import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import NfcRedirect from '../pages/NfcRedirect.vue'
import Error from '../pages/Error.vue'
import MobileRequired from '../pages/MobileRequired.vue'
import NoVideoAvailable from '../pages/NoVideoAvailable.vue'
import ShareSuccess from '../pages/ShareSuccess.vue'
import ShareFailed from '../pages/ShareFailed.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/nfc-redirect',
    name: 'NfcRedirect',
    component: NfcRedirect
  },
  {
    path: '/error',
    name: 'Error',
    component: Error
  },
  {
    path: '/mobile-required',
    name: 'MobileRequired',
    component: MobileRequired
  },
  {
    path: '/no-video',
    name: 'NoVideoAvailable',
    component: NoVideoAvailable
  },
  {
    path: '/share-success',
    name: 'ShareSuccess',
    component: ShareSuccess
  },
  {
    path: '/share-failed',
    name: 'ShareFailed',
    component: ShareFailed
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 检查是否需要移动端
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  if (to.name === 'NFCRedirect' && !isMobile) {
    next('/mobile-required')
    return
  }
  
  // 检查权限
  if (to.meta.requiresAuth) {
    // TODO: 添加认证逻辑
    console.log('🔐 需要权限验证')
  }
  
  next()
})

export default router 