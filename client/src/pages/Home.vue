<template>
  <div class="home">
    <!-- 头部标题 -->
    <div class="header">
      <h1>碰一碰发抖音</h1>
      <p>NFC一碰即发，视频营销神器</p>
    </div>

    <!-- 功能卡片 -->
    <div class="features">
      <!-- NFC功能模拟 -->
      <div class="feature-card">
        <div class="feature-icon">📱</div>
        <h3>NFC触发</h3>
        <p>模拟NFC标签触发</p>
        <van-button 
          type="primary" 
          block 
          @click="simulateNFC"
          :loading="nfcLoading"
        >
          {{ nfcLoading ? '跳转中...' : '模拟NFC触发' }}
        </van-button>
      </div>

      <!-- 快子API测试 -->
      <div class="feature-card">
        <div class="feature-icon">🎬</div>
        <h3>视频测试</h3>
        <p>测试快子API连接</p>
        <van-button 
          type="success" 
          block 
          @click="testKuaiziAPI"
          :loading="apiLoading"
        >
          {{ apiLoading ? '测试中...' : '测试视频API' }}
        </van-button>
      </div>

      <!-- 随机视频 -->
      <div class="feature-card">
        <div class="feature-icon">🎲</div>
        <h3>随机视频</h3>
        <p>获取随机视频内容</p>
        <van-button 
          type="primary" 
          block 
          @click="getRandomVideo"
          :loading="videoLoading"
        >
          {{ videoLoading ? '获取中...' : '获取随机视频' }}
        </van-button>
      </div>

      <!-- 分享到抖音 -->
      <div class="feature-card">
        <div class="feature-icon">🎵</div>
        <h3>抖音分享</h3>
        <p>直接跳转抖音发布</p>
        <van-button 
          type="warning" 
          block 
          @click="shareToDouyin"
          :disabled="!currentVideo"
        >
          发布到抖音
        </van-button>
      </div>
    </div>

    <!-- API状态显示 -->
    <div v-if="apiStatus" class="api-status">
      <van-cell-group>
        <van-cell title="API状态" :value="apiStatus.status" />
        <van-cell title="视频总数" :value="apiStatus.total_videos?.toLocaleString() || '0'" />
        <van-cell title="APP-KEY" :value="apiStatus.config?.app_key || '未配置'" />
        <van-cell title="账户ID" :value="apiStatus.config?.account_id || '未配置'" />
      </van-cell-group>
    </div>

    <!-- 当前视频信息 -->
    <div v-if="currentVideo" class="current-video">
      <h3>当前视频</h3>
      <div class="video-info">
        <img :src="currentVideo.cover_url" :alt="currentVideo.caption" class="video-cover" />
        <div class="video-details">
          <p class="video-title">{{ currentVideo.caption }}</p>
          <p class="video-stats">
            {{ formatDuration(currentVideo.duration) }} | 
            {{ currentVideo.width }}x{{ currentVideo.height }}
          </p>
          <div class="hashtags" v-if="currentVideo.hashtags?.length">
            <span v-for="tag in currentVideo.hashtags.slice(0, 3)" :key="tag" class="hashtag">
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="instructions">
      <h3>使用说明</h3>
      <div class="step" v-for="(step, index) in steps" :key="index">
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-content">
          <h4>{{ step.title }}</h4>
          <p>{{ step.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const nfcLoading = ref(false)
    const apiLoading = ref(false)
    const videoLoading = ref(false)
    const apiStatus = ref(null)
    const currentVideo = ref(null)

    // 使用步骤
    const steps = [
      {
        title: "测试API连接",
        description: "点击「测试视频API」确认快子API正常工作"
      },
      {
        title: "获取随机视频", 
        description: "点击「获取随机视频」从26000+视频库中随机选择"
      },
      {
        title: "分享到抖音",
        description: "点击「发布到抖音」直接跳转抖音发布页面"
      },
      {
        title: "NFC标签配置",
        description: "将网址写入NFC标签，实现一碰即发功能"
      }
    ]

    // 模拟NFC触发
    const simulateNFC = async () => {
      try {
        nfcLoading.value = true
        
        Toast.loading({
          message: '模拟NFC触发中...',
          forbidClick: true,
          duration: 0
        })

        // 模拟NFC触发延迟
        await new Promise(resolve => setTimeout(resolve, 1000))

        Toast.clear()
        Toast.success('NFC触发成功！')

        // 跳转到NFC重定向页面
        router.push({
          path: '/nfc-redirect',
          query: {
            store_id: 'demo_store',
            category: 'entertainment'
          }
        })

      } catch (error) {
        Toast.clear()
        Toast.fail('NFC模拟失败')
        console.error('NFC模拟失败:', error)
      } finally {
        nfcLoading.value = false
      }
    }

    // 测试快子API
    const testKuaiziAPI = async () => {
      try {
        apiLoading.value = true
        
        Toast.loading({
          message: '测试API连接中...',
          forbidClick: true,
          duration: 0
        })

        const response = await fetch('/api/kuaizi/test', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        Toast.clear()

        if (data.code === 200) {
          apiStatus.value = data.data
          Toast.success({
            message: `API连接成功！共${data.data.total_videos?.toLocaleString()}个视频`,
            duration: 3000
          })
        } else {
          throw new Error(data.message || 'API测试失败')
        }

      } catch (error) {
        Toast.clear()
        Toast.fail(`API测试失败: ${error.message}`)
        console.error('API测试失败:', error)
      } finally {
        apiLoading.value = false
      }
    }

    // 获取随机视频
    const getRandomVideo = async () => {
      try {
        videoLoading.value = true
        
        Toast.loading({
          message: '获取随机视频中...',
          forbidClick: true,
          duration: 0
        })

        const response = await fetch('/api/kuaizi/random-video', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        Toast.clear()

        if (data.code === 200) {
          currentVideo.value = data.data.video
          Toast.success('获取随机视频成功！')
        } else {
          throw new Error(data.message || '获取视频失败')
        }

      } catch (error) {
        Toast.clear()
        Toast.fail(`获取视频失败: ${error.message}`)
        console.error('获取视频失败:', error)
      } finally {
        videoLoading.value = false
      }
    }

    // 分享到抖音
    const shareToDouyin = () => {
      if (!currentVideo.value) {
        Toast.fail('请先获取视频')
        return
      }

      try {
        // 检测设备类型
        const userAgent = navigator.userAgent
        const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
        const isAndroid = /Android/i.test(userAgent)

        if (!isIOS && !isAndroid) {
          Toast.fail('请在手机上打开此页面')
          return
        }

        // 构建抖音分享URL Scheme
        const videoUrl = encodeURIComponent(currentVideo.value.video_url)
        const caption = encodeURIComponent(currentVideo.value.caption || '精彩视频内容')
        
        // 抖音URL Scheme格式
        const douyinUrl = `snssdk1128://openRecordPage?recordOrigin=system&recordParam={"video_url":"${videoUrl}","caption":"${caption}"}`
        
        console.log('🔗 抖音分享链接:', douyinUrl)

        // 尝试跳转到抖音
        window.location.href = douyinUrl

        Toast.success('正在跳转抖音...')

      } catch (error) {
        Toast.fail('分享失败，请重试')
        console.error('分享失败:', error)
      }
    }

    // 格式化视频时长
    const formatDuration = (seconds) => {
      if (!seconds) return '0:00'
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.floor(seconds % 60)
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    return {
      nfcLoading,
      apiLoading,
      videoLoading,
      apiStatus,
      currentVideo,
      steps,
      simulateNFC,
      testKuaiziAPI,
      getRandomVideo,
      shareToDouyin,
      formatDuration
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.feature-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 8px;
  color: #333;
}

.feature-card p {
  color: #666;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.api-status {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.current-video {
  background: white;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.current-video h3 {
  margin-bottom: 16px;
  color: #333;
}

.video-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.video-cover {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.video-details {
  flex: 1;
  min-width: 0;
}

.video-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
  line-height: 1.4;
}

.video-stats {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hashtag {
  background: #f0f0f0;
  color: #666;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.instructions {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.instructions h3 {
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.step {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.step:last-child {
  margin-bottom: 0;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  margin-bottom: 4px;
  color: #333;
}

.step-content p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .home {
    padding: 16px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .features {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .feature-card {
    padding: 20px;
  }
  
  .video-info {
    flex-direction: column;
  }
  
  .video-cover {
    width: 100%;
    height: 200px;
    align-self: center;
    max-width: 150px;
  }
}
</style> 