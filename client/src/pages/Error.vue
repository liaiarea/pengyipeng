<template>
  <div class="error-page">
    <div class="content">
      <div class="error-icon">❌</div>
      <h2>出错了</h2>
      <p>{{ errorMessage || '系统遇到了一些问题' }}</p>
      
      <div class="actions">
        <van-button 
          type="primary" 
          @click="retry"
          :loading="retrying"
        >
          重试
        </van-button>
        <van-button 
          type="default" 
          @click="goHome"
          style="margin-left: 12px;"
        >
          返回首页
        </van-button>
      </div>
      
      <div class="error-details" v-if="showDetails">
        <van-button 
          type="default" 
          size="small" 
          @click="toggleDetails"
        >
          {{ detailsVisible ? '隐藏详情' : '查看详情' }}
        </van-button>
        <div v-if="detailsVisible" class="details-content">
          <pre>{{ errorDetails }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'Error',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const retrying = ref(false)
    const detailsVisible = ref(false)
    const errorMessage = ref('')
    const errorDetails = ref('')
    const showDetails = ref(false)

    onMounted(() => {
      // 从URL参数获取错误信息
      errorMessage.value = route.query.msg || '系统遇到了一些问题'
      errorDetails.value = route.query.details || ''
      showDetails.value = !!errorDetails.value
    })

    const retry = async () => {
      retrying.value = true
      try {
        // 尝试重新加载当前页面或执行重试逻辑
        window.location.reload()
      } catch (error) {
        console.error('重试失败:', error)
      } finally {
        retrying.value = false
      }
    }

    const goHome = () => {
      router.push('/')
    }

    const toggleDetails = () => {
      detailsVisible.value = !detailsVisible.value
    }

    return {
      retrying,
      detailsVisible,
      errorMessage,
      errorDetails,
      showDetails,
      retry,
      goHome,
      toggleDetails
    }
  }
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  padding: 20px;
}

.content {
  text-align: center;
  color: white;
  max-width: 400px;
}

.error-icon {
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

.actions {
  margin-bottom: 30px;
}

.error-details {
  text-align: left;
}

.details-content {
  margin-top: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.details-content pre {
  color: white;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 