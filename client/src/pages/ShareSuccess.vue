<template>
  <div class="share-success-page">
    <div class="content">
      <div class="success-animation">
        <div class="checkmark">✅</div>
        <div class="celebration">🎉</div>
      </div>
      
      <h2>分享成功！</h2>
      <p>您的视频已成功跳转到抖音，快去发布吧！</p>
      
      <div class="tips">
        <div class="tip-item">
          <span class="tip-icon">📱</span>
          <span>请在抖音中完成视频发布</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">✏️</span>
          <span>可以编辑视频标题和描述</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">🏷️</span>
          <span>记得添加相关话题标签</span>
        </div>
      </div>
      
      <div class="actions">
        <van-button 
          type="primary" 
          @click="shareMore"
        >
          继续分享更多
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
import { useRouter } from 'vue-router'

export default {
  name: 'ShareSuccess',
  setup() {
    const router = useRouter()

    const shareMore = () => {
      router.push('/nfc-redirect?store_id=demo&category=general')
    }

    const goHome = () => {
      router.push('/')
    }

    return {
      shareMore,
      goHome
    }
  }
}
</script>

<style scoped>
.share-success-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  padding: 20px;
}

.content {
  text-align: center;
  color: white;
  max-width: 400px;
}

.success-animation {
  position: relative;
  margin-bottom: 30px;
}

.checkmark {
  font-size: 4rem;
  animation: bounce 0.6s ease-in-out;
}

.celebration {
  position: absolute;
  top: -10px;
  right: 20px;
  font-size: 2rem;
  animation: rotate 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 20%, 60%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  80% {
    transform: translateY(-10px);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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

.tips {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  text-align: left;
}

.tip-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style> 