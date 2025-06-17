<template>
  <div class="nfc-redirect">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <h2>正在获取视频...</h2>
      <p>请稍等，马上就好 🎬</p>
    </div>

    <!-- 视频预览 -->
    <div v-else-if="videoData && !redirecting" class="video-preview">
      <div class="video-container">
        <video 
          :src="videoData.video_url" 
          :poster="videoData.cover_url"
          controls
          playsinline
          webkit-playsinline
          @loadstart="onVideoLoadStart"
          @canplay="onVideoCanPlay"
        ></video>
      </div>
      
      <div class="video-info">
        <h3>{{ videoData.caption || '精彩视频内容' }}</h3>
        <div class="hashtags" v-if="videoData.hashtags && videoData.hashtags.length">
          <span v-for="tag in videoData.hashtags" :key="tag" class="hashtag">
            #{{ tag }}
          </span>
        </div>
      </div>

      <div class="action-buttons">
        <van-button 
          type="primary" 
          size="large" 
          block
          @click="shareToDouyin"
          :loading="redirecting"
        >
          {{ redirecting ? '正在跳转抖音...' : '发布到抖音 🎵' }}
        </van-button>
        
        <van-button 
          type="default" 
          size="large" 
          block
          @click="refreshVideo"
          :disabled="redirecting"
          style="margin-top: 12px;"
        >
          换一个视频 🔄
        </van-button>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">❌</div>
      <h2>获取视频失败</h2>
      <p>{{ error }}</p>
      <van-button 
        type="primary" 
        @click="retry"
        style="margin-top: 20px;"
      >
        重试
      </van-button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Toast } from 'vant'
import axios from 'axios'

export default {
  name: 'NfcRedirect',
  setup() {
    const route = useRoute()
    const loading = ref(true)
    const redirecting = ref(false)
    const videoData = ref(null)
    const error = ref(null)

    // 获取URL参数
    const storeId = route.query.store_id || 'default'
    const category = route.query.category || 'general'

    // 获取视频数据
    const fetchVideo = async () => {
      try {
        loading.value = true
        error.value = null

        console.log('🔍 获取视频参数:', { storeId, category })

        const response = await axios.post('/api/nfc/trigger', {
          store_id: storeId,
          category: category
        })

        if (response.data.code === 200) {
          videoData.value = response.data.data.video
          console.log('✅ 获取视频成功:', videoData.value)
        } else {
          throw new Error(response.data.message || '获取视频失败')
        }

      } catch (err) {
        console.error('❌ 获取视频失败:', err)
        error.value = err.response?.data?.message || err.message || '网络错误'
      } finally {
        loading.value = false
      }
    }

    // 分享到抖音
    const shareToDouyin = async () => {
      if (!videoData.value) return

      try {
        redirecting.value = true
        Toast.loading({
          message: '正在跳转抖音...',
          forbidClick: true,
          duration: 0
        })

        // 检测设备类型
        const userAgent = navigator.userAgent
        const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
        const isAndroid = /Android/i.test(userAgent)

        if (!isIOS && !isAndroid) {
          throw new Error('请在手机上打开此页面')
        }

        // 生成抖音分享链接
        const response = await axios.post('/api/douyin/share-url', {
          video_url: videoData.value.video_url,
          caption: videoData.value.caption,
          hashtags: videoData.value.hashtags?.join(',') || ''
        })

        if (response.data.code === 200) {
          const shareUrl = response.data.data.share_url
          console.log('🔗 抖音分享链接:', shareUrl)

          // 尝试跳转到抖音
          window.location.href = shareUrl

          // 备用方案：延迟后显示手动跳转提示
          setTimeout(() => {
            Toast.clear()
            Toast({
              message: '如果没有自动跳转，请手动打开抖音',
              duration: 3000
            })
            redirecting.value = false
          }, 3000)

        } else {
          throw new Error(response.data.message || '生成分享链接失败')
        }

      } catch (err) {
        console.error('❌ 分享失败:', err)
        Toast.clear()
        Toast.fail(err.message || '分享失败，请重试')
        redirecting.value = false
      }
    }

    // 刷新视频
    const refreshVideo = () => {
      videoData.value = null
      fetchVideo()
    }

    // 重试
    const retry = () => {
      fetchVideo()
    }

    // 视频加载事件
    const onVideoLoadStart = () => {
      console.log('🎬 视频开始加载')
    }

    const onVideoCanPlay = () => {
      console.log('✅ 视频可以播放')
    }

    // 组件挂载时获取视频
    onMounted(() => {
      fetchVideo()
    })

    return {
      loading,
      redirecting,
      videoData,
      error,
      shareToDouyin,
      refreshVideo,
      retry,
      onVideoLoadStart,
      onVideoCanPlay
    }
  }
}
</script>

<style scoped>
.nfc-redirect {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container, .error-container {
  text-align: center;
  color: white;
}

.loading-container h2, .error-container h2 {
  margin: 20px 0 10px 0;
  font-size: 1.5rem;
}

.loading-container p, .error-container p {
  opacity: 0.8;
  font-size: 1rem;
}

.video-preview {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 9/16;
  background: #000;
}

.video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info {
  padding: 20px;
}

.video-info h3 {
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.4;
}

.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hashtag {
  background: #f0f0f0;
  color: #666;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
}

.action-buttons {
  padding: 0 20px 20px 20px;
}

.error-container {
  max-width: 300px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

/* 加载动画 */
.loading-spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 移动端适配 */
@media (max-width: 480px) {
  .nfc-redirect {
    padding: 12px;
  }
  
  .video-preview {
    max-width: 100%;
  }
  
  .video-info {
    padding: 16px;
  }
  
  .action-buttons {
    padding: 0 16px 16px 16px;
  }
}
</style> 