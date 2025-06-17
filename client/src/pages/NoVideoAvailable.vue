<template>
  <div class="no-video-page">
    <div class="content">
      <div class="icon">🎬</div>
      <h2>暂无可用视频</h2>
      <p>当前没有可用的视频素材，请稍后再试</p>
      
      <div class="suggestions">
        <div class="suggestion-item">
          <span class="suggestion-icon">⏰</span>
          <span>请稍后再试，我们正在准备更多精彩内容</span>
        </div>
        <div class="suggestion-item">
          <span class="suggestion-icon">📞</span>
          <span>如有问题，请联系客服获取帮助</span>
        </div>
      </div>
      
      <div class="actions">
        <van-button 
          type="primary" 
          @click="retry"
          :loading="retrying"
        >
          重新获取
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'NoVideoAvailable',
  setup() {
    const router = useRouter()
    const retrying = ref(false)

    const retry = async () => {
      retrying.value = true
      try {
        // 延迟一秒后重新跳转到NFC页面
        await new Promise(resolve => setTimeout(resolve, 1000))
        window.location.reload()
      } finally {
        retrying.value = false
      }
    }

    const goHome = () => {
      router.push('/')
    }

    return {
      retrying,
      retry,
      goHome
    }
  }
}
</script>

<style scoped>
.no-video-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffa726 0%, #ff7043 100%);
  padding: 20px;
}

.content {
  text-align: center;
  color: white;
  max-width: 400px;
}

.icon {
  font-size: 4rem;
  margin-bottom: 20px;
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

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  text-align: left;
}

.suggestion-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style> 