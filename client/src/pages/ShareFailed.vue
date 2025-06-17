<template>
  <div class="share-failed-page">
    <div class="content">
      <div class="failed-icon">❌</div>
      <h2>分享失败</h2>
      <p>{{ errorMessage || '抖音跳转遇到问题，请重试' }}</p>
      
      <div class="solutions">
        <h3>解决方案：</h3>
        <div class="solution-item">
          <span class="solution-icon">📱</span>
          <div class="solution-text">
            <strong>检查抖音应用</strong>
            <span>确保手机已安装最新版抖音</span>
          </div>
        </div>
        <div class="solution-item">
          <span class="solution-icon">🔗</span>
          <div class="solution-text">
            <strong>手动打开抖音</strong>
            <span>您可以手动打开抖音应用重试</span>
          </div>
        </div>
        <div class="solution-item">
          <span class="solution-icon">📞</span>
          <div class="solution-text">
            <strong>联系客服</strong>
            <span>如问题持续，请联系我们的客服</span>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <van-button 
          type="primary" 
          @click="retry"
          :loading="retrying"
        >
          重试分享
        </van-button>
        <van-button 
          type="default" 
          @click="goHome"
          style="margin-top: 12px;"
        >
          返回首页
        </van-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'ShareFailed',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const retrying = ref(false)
    const errorMessage = ref('')

    onMounted(() => {
      // 从URL参数获取错误信息
      errorMessage.value = route.query.error || route.query.msg || ''
    })

    const retry = async () => {
      retrying.value = true
      try {
        // 延迟一秒后跳转回NFC页面重试
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.push('/nfc-redirect?store_id=demo&category=general')
      } finally {
        retrying.value = false
      }
    }

    const goHome = () => {
      router.push('/')
    }

    return {
      retrying,
      errorMessage,
      retry,
      goHome
    }
  }
}
</script>

<style scoped>
.share-failed-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
  padding: 20px;
}

.content {
  text-align: center;
  color: white;
  max-width: 400px;
}

.failed-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: shake 0.6s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 12px;
}

p {
  opacity: 0.9;
  margin-bottom: 30px;
  line-height: 1.6;
}

.solutions {
  text-align: left;
  margin-bottom: 30px;
}

.solutions h3 {
  font-size: 1.2rem;
  margin-bottom: 16px;
  text-align: center;
}

.solution-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.solution-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.solution-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.solution-text strong {
  font-weight: 600;
}

.solution-text span {
  font-size: 0.9rem;
  opacity: 0.8;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>