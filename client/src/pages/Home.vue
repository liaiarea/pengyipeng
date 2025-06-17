<template>
  <div class="home-page">
    <!-- 顶部横幅区域 -->
    <div class="header-banner">
      <div class="banner-content">
        <h1 class="main-title">碰一碰 领福利</h1>
        <p class="sub-title">让商家营销 更是简单准</p>
        
        <!-- 3D效果装饰 -->
        <div class="decoration-3d">
          <div class="floating-card card-1">💳</div>
          <div class="floating-card card-2">🎁</div>
          <div class="floating-card card-3">📱</div>
        </div>
      </div>
      
      <!-- 客服和案例按钮 -->
      <div class="service-buttons">
        <van-button 
          class="service-btn customer-service" 
          size="small" 
          round
          @click="contactService"
        >
          <van-icon name="service" />
          客服
        </van-button>
        <van-button 
          class="service-btn cases" 
          size="small" 
          round
          @click="viewCases"
        >
          商家案例
        </van-button>
      </div>
    </div>

    <!-- 支付/会员区域 -->
    <div class="payment-section">
      <div class="payment-card">
        <div class="payment-left">
          <div class="payment-icon">💳</div>
          <div class="payment-text">
            <span class="payment-title">支付</span>
            <span class="payment-desc">点击付款</span>
          </div>
        </div>
        <van-button 
          type="primary" 
          size="small" 
          round
          @click="register"
        >
          注册会员
        </van-button>
      </div>
    </div>

    <!-- 发视频/种草区域 -->
    <div class="feature-section">
      <h3 class="section-title">发视频/种草</h3>
      <div class="feature-grid">
                 <div 
           class="feature-item" 
           v-for="platform in videoPlatforms" 
           :key="platform.id"
           @click="handlePlatformClick(platform)"
         >
           <div class="feature-icon">
             <PlatformIcon :platform="platform.id" :color="platform.color" />
           </div>
           <span class="feature-name">{{ platform.name }}</span>
         </div>
      </div>
    </div>

    <!-- 图文发布区域 -->
    <div class="feature-section">
      <h3 class="section-title">图文发布</h3>
      <div class="feature-grid">
                 <div 
           class="feature-item" 
           v-for="platform in imagePlatforms" 
           :key="platform.id"
           @click="handlePlatformClick(platform)"
         >
           <div class="feature-icon">
             <PlatformIcon :platform="platform.id" :color="platform.color" />
           </div>
           <span class="feature-name">{{ platform.name }}</span>
         </div>
      </div>
    </div>

    <!-- 打卡/点评/收藏区域 -->
    <div class="feature-section">
      <h3 class="section-title">打卡/点评/收藏</h3>
      <div class="feature-grid review-grid">
                 <div 
           class="feature-item" 
           v-for="platform in reviewPlatforms" 
           :key="platform.id"
           @click="handlePlatformClick(platform)"
         >
           <div class="feature-icon">
             <PlatformIcon :platform="platform.id" :color="platform.color" />
           </div>
           <span class="feature-name">{{ platform.name }}</span>
         </div>
      </div>
    </div>

    <!-- 底部间距 -->
    <div class="bottom-space"></div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { Toast } from 'vant'
import PlatformIcon from '../components/PlatformIcon.vue'

export default {
  name: 'Home',
  components: {
    PlatformIcon
  },
  setup() {
    // 视频平台数据
    const videoPlatforms = ref([
      {
        id: 'douyin',
        name: '发抖音',
        color: '#000000',
        action: 'video'
      },
      {
        id: 'kuaishou',
        name: '发快手',
        color: '#FF6600',
        action: 'video'
      },
      {
        id: 'xiaohongshu',
        name: '发小红书',
        color: '#FF2442',
        action: 'video'
      },
      {
        id: 'wechat-channels',
        name: '发视频号',
        color: '#07C160',
        action: 'video'
      }
    ])

    // 图文平台数据
    const imagePlatforms = ref([
      {
        id: 'wechat-moments',
        name: '发朋友圈',
        color: '#07C160',
        action: 'image'
      },
      {
        id: 'xiaohongshu-note',
        name: '小红书图文',
        color: '#FF2442',
        action: 'image'
      }
    ])

    // 点评平台数据
    const reviewPlatforms = ref([
      {
        id: 'dianping',
        name: '点评打卡',
        color: '#FFBA00',
        action: 'review'
      },
      {
        id: 'meituan',
        name: '点评+收藏',
        color: '#FFBA00',
        action: 'review'
      },
      {
        id: 'eleme',
        name: '点评+收藏',
        color: '#00D7FF',
        action: 'review'
      },
      {
        id: 'baidu-map',
        name: '点评+收藏',
        color: '#3385FF',
        action: 'review'
      },
      {
        id: 'douyin-review',
        name: '点评+收藏',
        color: '#000000',
        action: 'review'
      }
    ])

    // 处理平台点击
    const handlePlatformClick = (platform) => {
      console.log('点击平台:', platform)
      
      if (platform.id === 'douyin' && platform.action === 'video') {
        // 如果是发抖音视频，跳转到NFC页面进行演示
        window.location.href = '/nfc-redirect?store_id=demo&category=general'
      } else {
        Toast(`${platform.name} 功能正在开发中...`)
      }
    }

    // 联系客服
    const contactService = () => {
      Toast('正在连接客服...')
    }

    // 查看案例
    const viewCases = () => {
      Toast('商家案例页面开发中...')
    }

    // 注册会员
    const register = () => {
      Toast('会员注册功能开发中...')
    }

    return {
      videoPlatforms,
      imagePlatforms,
      reviewPlatforms,
      handlePlatformClick,
      contactService,
      viewCases,
      register
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 顶部横幅 */
.header-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px 30px 20px;
  position: relative;
  overflow: hidden;
}

.banner-content {
  text-align: center;
  color: white;
  position: relative;
  z-index: 2;
}

.main-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.sub-title {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

/* 3D装饰效果 */
.decoration-3d {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-card {
  position: absolute;
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
  opacity: 0.3;
}

.card-1 {
  top: 20px;
  right: 20px;
  animation-delay: 0s;
}

.card-2 {
  top: 50%;
  left: 10px;
  animation-delay: -1s;
}

.card-3 {
  bottom: 20px;
  right: 50px;
  animation-delay: -2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* 服务按钮 */
.service-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.service-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
}

.service-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 支付区域 */
.payment-section {
  padding: 20px;
}

.payment-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.payment-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-icon {
  font-size: 2rem;
}

.payment-text {
  display: flex;
  flex-direction: column;
}

.payment-title {
  font-weight: 600;
  color: #333;
}

.payment-desc {
  font-size: 0.9rem;
  color: #666;
}

/* 功能区域 */
.feature-section {
  padding: 0 20px 30px 20px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.review-grid {
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.feature-item:active {
  transform: translateY(0px);
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.feature-name {
  font-size: 0.85rem;
  color: #333;
  text-align: center;
  font-weight: 500;
}

.bottom-space {
  height: 40px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .header-banner {
    padding: 30px 16px 24px 16px;
  }
  
  .main-title {
    font-size: 1.6rem;
  }
  
  .payment-section,
  .feature-section {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .feature-grid {
    gap: 12px;
  }
  
  .feature-item {
    padding: 12px 6px;
  }
  
  .feature-icon {
    width: 40px;
    height: 40px;
  }
  
  .feature-name {
    font-size: 0.8rem;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .home-page {
    background: #1a1a1a;
  }
  
  .payment-card,
  .feature-item {
    background: #2a2a2a;
    color: white;
  }
  
  .section-title {
    color: white;
  }
  
  .payment-title {
    color: white;
  }
  
  .payment-desc {
    color: #ccc;
  }
  
  .feature-name {
    color: white;
  }
}
</style> 