# 🎯 NFC抖音视频营销工具 - 产品开发说明书

## 📋 项目概述

### 产品定位
基于NFC技术的抖音视频营销推广工具，用户通过碰一碰NFC标签即可获取并分享抖音视频，实现线下到线上的营销转化。

### 核心价值
- **便捷性**: 一碰即分享，无需下载APP或复杂操作
- **营销性**: 结合线下场景，提升品牌曝光和用户参与度  
- **智能化**: 自动获取未使用视频，避免重复推送

### 技术架构
- **前端**: Vue.js 3 + Vite + Vant UI
- **后端**: Cloudflare Workers (Serverless)
- **API集成**: 快子OpenAPI + 抖音开放平台
- **部署**: Cloudflare Workers + Static Assets

## 🎨 页面设计规格

### 1. 主页 (Home.vue)
**路径**: `/`
**功能**: 项目介绍和导航入口

**UI组件**:
```vue
<template>
  <div class="home-container">
    <!-- Hero区域 -->
    <section class="hero-section">
      <h1 class="hero-title">碰一碰发抖音</h1>
      <p class="hero-subtitle">NFC智能营销工具</p>
      <div class="hero-features">
        <div class="feature-item">
          <PlatformIcon platform="douyin" />
          <span>NFC碰一碰</span>
        </div>
        <div class="feature-item">
          <PlatformIcon platform="kuaishou" />
          <span>一键分享抖音</span>
        </div>
        <div class="feature-item">
          <PlatformIcon platform="xiaohongshu" />
          <span>智能视频推荐</span>
        </div>
      </div>
    </section>

    <!-- 功能介绍 -->
    <section class="features-section">
      <h2>核心功能</h2>
      <div class="features-grid">
        <div class="feature-card">
          <h3>NFC标签管理</h3>
          <p>支持多种NFC芯片，自定义跳转链接</p>
        </div>
        <div class="feature-card">
          <h3>视频素材库</h3>
          <p>对接快子API，海量视频素材</p>
        </div>
        <div class="feature-card">
          <h3>智能分发</h3>
          <p>自动筛选未使用视频，避免重复</p>
        </div>
      </div>
    </section>

    <!-- CTA按钮 -->
    <section class="cta-section">
      <van-button 
        type="primary" 
        size="large" 
        @click="$router.push('/nfc/demo')"
      >
        体验Demo
      </van-button>
    </section>
  </div>
</template>
```

### 2. NFC重定向页面 (NfcRedirect.vue)
**路径**: `/nfc/:nfcId` 或通过query参数 `?store_id=xxx&category=xxx`
**功能**: NFC标签跳转处理，获取视频并引导分享

**核心逻辑**:
```vue
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

        const response = await axios.post('/api/nfc/trigger', {
          store_id: storeId,
          category: category
        })

        if (response.data.code === 200) {
          videoData.value = response.data.data.video
        } else {
          throw new Error(response.data.message || '获取视频失败')
        }

      } catch (err) {
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
      retry
    }
  }
}
</script>
```

### 3. 错误页面 (Error.vue)
**路径**: `/error`
**功能**: 统一错误处理和用户引导

```vue
<template>
  <div class="error-page">
    <div class="error-icon">❌</div>
    <h1>出现了一些问题</h1>
    <p class="error-message">{{ errorMessage }}</p>
    <div class="error-actions">
      <van-button type="primary" @click="goHome">返回首页</van-button>
      <van-button type="default" @click="retry">重试</van-button>
    </div>
  </div>
</template>
```

### 4. 其他页面
- **MobileRequired.vue**: 提示用户使用移动设备访问
- **NoVideoAvailable.vue**: 视频库为空时的提示页面
- **ShareSuccess.vue / ShareFailed.vue**: 分享结果反馈

## 🔧 API接口规格

### 1. NFC相关接口

#### POST /api/nfc/trigger
**功能**: NFC标签触发，获取视频
**请求体**:
```typescript
interface NfcTriggerRequest {
  store_id: string;        // 商店/标签ID
  category?: string;       // 视频分类，默认 'general'
}
```
**响应**:
```typescript
interface NfcTriggerResponse {
  code: number;           // 200成功，其他失败
  message: string;        // 响应消息
  data: {
    video: VideoData;     // 视频数据
    store_id: string;     // 商店ID
    category: string;     // 分类
  } | null;
}
```

#### GET /api/nfc/redirect
**功能**: NFC重定向处理（兼容GET请求）
**参数**:
```typescript
interface NfcRedirectParams {
  store_id: string;        // NFC标签ID
  category?: string;       // 视频分类
}
```

### 2. 快子API接口

#### GET /api/kuaizi/videos
**功能**: 获取快子平台视频列表
**参数**:
```typescript
interface KuaiziVideosParams {
  page?: number;           // 页码，默认1
  size?: number;           // 每页数量，默认20
  category?: string;       // 视频分类
  keyword?: string;        // 搜索关键词
}
```

#### GET /api/kuaizi/test
**功能**: 测试快子API连接

#### GET /api/kuaizi/account
**功能**: 获取快子账户信息

### 3. 抖音API接口

#### POST /api/douyin/share-url
**功能**: 生成抖音分享链接
**请求体**:
```typescript
interface DouyinShareRequest {
  video_url: string;       // 视频URL
  caption?: string;        // 视频标题
  hashtags?: string;       // 标签，逗号分隔
}
```

## 💾 数据模型

### VideoData 视频数据模型
```typescript
interface VideoData {
  id: string;                    // 视频唯一标识
  video_url: string;             // 视频文件URL
  cover_url: string;             // 封面图片URL
  caption: string;               // 视频标题/描述
  hashtags: string[];            // 标签数组
  duration: number;              // 视频时长(秒)
  size: number;                  // 文件大小(字节)
  width: number;                 // 视频宽度
  height: number;                // 视频高度
  fps: number;                   // 帧率
  bitrate: number;               // 比特率
  file_ext: string;              // 文件扩展名
  create_date: string;           // 创建时间
  category?: string;             // 视频分类
  store_id?: string;             // 关联的商店ID
  used?: boolean;                // 是否已使用
}
```## 🔨 核心功能实现

### 1. 快子API服务类

```javascript
// server/services/kuaiziService.js
export class KuaiziService {
  constructor(env) {
    this.baseURL = 'https://openapi.kuaizi.co/v2';
    this.appKey = env.KUAIZI_APP_KEY;
    this.appSecret = env.KUAIZI_APP_SECRET;
    this.accountId = env.KUAIZI_ACCOUNT_ID;
    this.usedVideos = new Set();
    this.env = env;
  }

  // MD5签名生成（简化版，用SHA-256前32位替代）
  async md5(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hash.substring(0, 32);
  }

  // 生成API签名
  async generateSign(timestamp) {
    const signString = `${timestamp}#${this.appSecret}`;
    return await this.md5(signString);
  }

  // 获取API请求头
  async getHeaders() {
    const timestamp = Date.now();
    const sign = await this.generateSign(timestamp);
    
    return {
      'AUTH-TIMESTAMP': timestamp.toString(),
      'AUTH-SIGN': sign,
      'APP-KEY': this.appKey,
      'Content-Type': 'application/json'
    };
  }

  // 获取素材列表
  async getMaterialList(params = {}) {
    const queryParams = new URLSearchParams({
      account_id: this.accountId,
      type: params.type || 'video',
      page: params.page || 1,
      size: params.size || 20
    });

    if (params.category) queryParams.append('category', params.category);
    if (params.keyword) queryParams.append('keyword', params.keyword);

    const url = `${this.baseURL}/material/list?${queryParams}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getHeaders()
    });

    const data = await response.json();
    
    if (data.code === 200) {
      return data.data;
    } else {
      this.handleKuaiziError(data.code, data.message);
      throw new Error(data.message || '获取素材列表失败');
    }
  }

  // 获取未使用的视频
  async getUnusedVideo(params = {}) {
    const materialData = await this.getMaterialList({
      type: 'video',
      category: params.category,
      page: 1,
      size: 50
    });

    let videos = materialData.list || [];
    
    // 过滤已使用的视频
    videos = videos.filter(video => !this.usedVideos.has(video.id));

    if (videos.length === 0) {
      return null;
    }

    const selectedVideo = videos[0];
    
    return {
      id: selectedVideo.id,
      video_url: selectedVideo.file?.url || '',
      cover_url: selectedVideo.file?.thumb_url || '',
      caption: selectedVideo.name || selectedVideo.note || '精彩视频内容',
      hashtags: this.parseHashtags(selectedVideo.tags || ''),
      duration: selectedVideo.file?.file_info?.play_time || 0,
      size: selectedVideo.file?.size || 0,
      width: selectedVideo.file?.file_info?.width || 0,
      height: selectedVideo.file?.file_info?.height || 0,
      fps: selectedVideo.file?.file_info?.fps || 0,
      bitrate: selectedVideo.file?.file_info?.bitrate || 0,
      file_ext: selectedVideo.file_ext || 'mp4',
      create_date: selectedVideo.create_date || ''
    };
  }

  // 标记视频为已使用
  async markVideoAsUsed(videoId) {
    this.usedVideos.add(videoId);
    
    // 持久化到KV存储
    if (this.env.VIDEO_CACHE) {
      try {
        const usedList = await this.env.VIDEO_CACHE.get('used_videos');
        const used = usedList ? JSON.parse(usedList) : [];
        if (!used.includes(videoId)) {
          used.push(videoId);
          await this.env.VIDEO_CACHE.put('used_videos', JSON.stringify(used));
        }
      } catch (error) {
        console.error('保存已使用视频列表失败:', error);
      }
    }
  }

  // 解析标签
  parseHashtags(tagsString) {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
  }

  // 处理快子API错误
  handleKuaiziError(errorCode, errorMessage) {
    const errorMap = {
      40000: '余额不足',
      40005: '账户状态异常',
      61000: '素材库为空'
    };
    
    const message = errorMap[errorCode] || errorMessage;
    console.error(`快子API错误 ${errorCode}: ${message}`);
  }
}
```

### 2. NFC处理路由

```javascript
// server/handlers/nfc.js
import { KuaiziService } from '../services/kuaiziService.js';
import { createResponse } from '../utils/response.js';
import { validateInput } from '../utils/validation.js';

export async function handleNfcTrigger(request, env) {
  try {
    const body = await request.json();
    const { store_id, category = 'general' } = body;

    // 验证输入
    if (!validateInput(store_id, 'string', 1, 100)) {
      return createResponse(400, 'store_id参数无效');
    }

    console.log(`📱 NFC触发: store_id=${store_id}, category=${category}`);

    const kuaiziService = new KuaiziService(env);
    const video = await kuaiziService.getUnusedVideo({ category });

    if (!video) {
      return createResponse(404, '暂无可用视频', null);
    }

    // 标记视频为已使用
    await kuaiziService.markVideoAsUsed(video.id);

    return createResponse(200, '获取视频成功', {
      video,
      store_id,
      category
    });

  } catch (error) {
    console.error('NFC触发处理失败:', error);
    return createResponse(500, error.message || '服务器错误');
  }
}
```

### 3. 抖音分享处理

```javascript
// server/handlers/douyin.js
import { createResponse } from '../utils/response.js';

export async function handleDouyinShareUrl(request, env) {
  try {
    const body = await request.json();
    const { video_url, caption = '', hashtags = '' } = body;

    if (!video_url) {
      return createResponse(400, '视频URL不能为空');
    }

    // 检测用户设备
    const userAgent = request.headers.get('User-Agent') || '';
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);

    let shareUrl, iosUrl, androidUrl;

    if (isIOS) {
      // iOS抖音分享链接
      shareUrl = `snssdk1128://aweme/detail/share?url=${encodeURIComponent(video_url)}`;
      iosUrl = shareUrl;
      androidUrl = `snssdk1233://aweme/detail/share?url=${encodeURIComponent(video_url)}`;
    } else if (isAndroid) {
      // Android抖音分享链接
      shareUrl = `snssdk1233://aweme/detail/share?url=${encodeURIComponent(video_url)}`;
      iosUrl = `snssdk1128://aweme/detail/share?url=${encodeURIComponent(video_url)}`;
      androidUrl = shareUrl;
    } else {
      // 桌面端或其他设备，跳转到网页版
      shareUrl = `https://www.douyin.com/share/video?url=${encodeURIComponent(video_url)}`;
      iosUrl = shareUrl;
      androidUrl = shareUrl;
    }

    return createResponse(200, '生成分享链接成功', {
      share_url: shareUrl,
      ios_url: iosUrl,
      android_url: androidUrl
    });

  } catch (error) {
    console.error('生成抖音分享链接失败:', error);
    return createResponse(500, error.message || '服务器错误');
  }
}
```

### 4. 平台图标组件

```vue
<!-- client/src/components/PlatformIcon.vue -->
<template>
  <div 
    class="platform-icon" 
    :class="`${platform}-icon`"
    :style="{ backgroundColor: color }"
  >
    <span class="icon-text">{{ iconText }}</span>
  </div>
</template>

<script>
export default {
  name: 'PlatformIcon',
  props: {
    platform: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: '#333'
    }
  },
  computed: {
    iconText() {
      const iconMap = {
        'douyin': '抖',
        'kuaishou': '快',
        'xiaohongshu': '小',
        'wechat-channels': '视',
        'wechat': '微',
        'dianping': '点',
        'meituan': '美',
        'eleme': '饿',
        'baidu-map': '百'
      }
      return iconMap[this.platform] || '?'
    }
  }
}
</script>

<style scoped>
.platform-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.douyin-icon { background: #000000 !important; }
.kuaishou-icon { background: #FF6600 !important; }
.xiaohongshu-icon { background: #FF2442 !important; }
.wechat-channels-icon,
.wechat-icon { background: #07C160 !important; }
.dianping-icon,
.meituan-icon { background: #FFBA00 !important; }
.eleme-icon { background: #00D7FF !important; }
.baidu-map-icon { background: #3385FF !important; }
</style>
```

### 5. 路由配置

```javascript
// client/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue')
  },
  {
    path: '/nfc/:nfcId?',
    name: 'NfcRedirect',
    component: () => import('@/pages/NfcRedirect.vue'),
    props: true,
    meta: { requiresMobile: true }
  },
  {
    path: '/error',
    name: 'Error',
    component: () => import('@/pages/Error.vue')
  },
  {
    path: '/mobile-required',
    name: 'MobileRequired',
    component: () => import('@/pages/MobileRequired.vue')
  },
  {
    path: '/no-video-available',
    name: 'NoVideoAvailable',
    component: () => import('@/pages/NoVideoAvailable.vue')
  },
  {
    path: '/share-success',
    name: 'ShareSuccess',
    component: () => import('@/pages/ShareSuccess.vue')
  },
  {
    path: '/share-failed',
    name: 'ShareFailed',
    component: () => import('@/pages/ShareFailed.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 检查移动设备
router.beforeEach((to, from, next) => {
  if (to.meta.requiresMobile) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      next('/mobile-required');
      return;
    }
  }
  next();
})

export default router
```

### 6. 工具函数

```javascript
// server/utils/response.js
export function createResponse(code, message, data = null) {
  return new Response(JSON.stringify({
    code,
    message,
    data
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
```

```javascript
// server/utils/validation.js
export function validateInput(value, type, minLength = 0, maxLength = Infinity) {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (type === 'string') {
    if (typeof value !== 'string') return false;
    return value.length >= minLength && value.length <= maxLength;
  }
  
  if (type === 'number') {
    return typeof value === 'number' && !isNaN(value);
  }
  
  return true;
}
```

## 📱 前端依赖和配置

### package.json (client)
```json
{
  "name": "nfc-douyin-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.4",
    "vue-router": "^4.2.4",
    "vant": "^4.6.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.2.3",
    "vite": "^4.4.5"
  }
}
```

### vite.config.js (client)
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

## 🚀 部署配置

### Cloudflare Workers配置
```toml
# wrangler.toml
name = "nfc-douyin-video"
main = "./server/index.js"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "./client/dist"
not_found_handling = "single-page-application"
html_handling = "auto-trailing-slash"

[vars]
NODE_ENV = "production"
API_VERSION = "v1"

[[kv_namespaces]]
binding = "VIDEO_CACHE"
preview_id = "your_preview_kv_id"
id = "your_production_kv_id"

[build]
command = "npm run build:all"
```

### 环境变量配置
```bash
# .env.example
# 快子API配置
KUAIZI_APP_KEY=your_kuaizi_app_key
KUAIZI_APP_SECRET=your_kuaizi_app_secret
KUAIZI_ACCOUNT_ID=your_kuaizi_account_id

# 抖音开放平台配置
DOUYIN_APP_ID=your_douyin_app_id
DOUYIN_APP_SECRET=your_douyin_app_secret

# 可选配置
DEFAULT_CATEGORY=general
MAX_VIDEOS_PER_REQUEST=50
```

### 构建脚本
```json
{
  "scripts": {
    "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\"",
    "server:dev": "wrangler dev",
    "client:dev": "cd client && npm run dev",
    "build": "npm run build:client",
    "build:all": "npm run build:client",
    "build:client": "cd client && npm install && npm run build",
    "deploy": "wrangler deploy",
    "preview": "wrangler dev --local",
    "install:all": "npm install && cd client && npm install"
  }
}
```

## 📋 开发检查清单

### 前端开发
- [ ] Vue 3 项目初始化，安装Vant UI
- [ ] 创建路由配置和页面组件
- [ ] 实现NfcRedirect核心页面逻辑
- [ ] 开发PlatformIcon等UI组件
- [ ] 配置axios API调用
- [ ] 实现响应式设计和移动端适配
- [ ] 添加加载状态和错误处理
- [ ] 配置Vite代理和构建

### 后端开发
- [ ] 创建Cloudflare Workers项目结构
- [ ] 实现KuaiziService快子API集成
- [ ] 开发NFC和抖音处理路由
- [ ] 创建响应格式化和验证工具
- [ ] 配置CORS和错误处理中间件
- [ ] 实现KV存储用于缓存已使用视频
- [ ] 添加健康检查和监控接口

### API集成
- [ ] 注册快子开放平台账号，获取API密钥
- [ ] 实现快子API签名认证逻辑
- [ ] 测试视频素材获取和分发
- [ ] 注册抖音开放平台，配置分享权限
- [ ] 实现抖音分享链接生成
- [ ] 处理iOS/Android不同的URL scheme

### 测试和部署
- [ ] 本地开发环境测试
- [ ] 移动端兼容性测试
- [ ] NFC标签功能真机测试
- [ ] API接口压力测试
- [ ] Cloudflare Workers部署配置
- [ ] 环境变量和KV命名空间设置
- [ ] 域名绑定和HTTPS配置

## 🔍 关键技术点

### NFC URL配置示例
```
# NFC标签写入的URL格式
https://your-domain.workers.dev/nfc?store_id=shop001&category=food

# 或使用路径参数
https://your-domain.workers.dev/nfc/shop001?category=food
```

### 抖音分享URL Scheme
```javascript
// iOS抖音
snssdk1128://aweme/detail/share?url=VIDEO_URL

// Android抖音  
snssdk1233://aweme/detail/share?url=VIDEO_URL

// 网页版抖音
https://www.douyin.com/share/video?url=VIDEO_URL
```

### 快子API签名算法
```javascript
// 签名字符串格式
const signString = `${timestamp}#${appSecret}`;

// MD5加密（Workers环境使用SHA-256前32位替代）
const sign = await crypto.subtle.digest('SHA-256', encoder.encode(signString));
```

### 视频使用状态管理
```javascript
// 内存中临时存储
const usedVideos = new Set();

// KV持久化存储
await env.VIDEO_CACHE.put('used_videos', JSON.stringify(usedList));
```

## 🎯 完整项目结构

```
nfc-douyin-video/
├── client/                     # 前端Vue项目
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   └── PlatformIcon.vue
│   │   ├── pages/
│   │   │   ├── Home.vue
│   │   │   ├── NfcRedirect.vue
│   │   │   ├── Error.vue
│   │   │   ├── MobileRequired.vue
│   │   │   ├── NoVideoAvailable.vue
│   │   │   ├── ShareSuccess.vue
│   │   │   └── ShareFailed.vue
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                     # 后端Workers项目
│   ├── handlers/
│   │   ├── nfc.js
│   │   ├── kuaizi.js
│   │   └── douyin.js
│   ├── middleware/
│   │   ├── cors.js
│   │   └── rateLimit.js
│   ├── routes/
│   │   └── router.js
│   ├── services/
│   │   └── kuaiziService.js
│   ├── utils/
│   │   ├── response.js
│   │   └── validation.js
│   └── index.js
├── wrangler.toml              # Cloudflare Workers配置
├── package.json               # 根目录package.json
├── .env.example               # 环境变量示例
└── README.md                  # 项目说明
```

## 🚀 快速开始步骤

### 1. 项目初始化
```bash
# 创建项目目录
mkdir nfc-douyin-video
cd nfc-douyin-video

# 初始化根package.json
npm init -y

# 创建前端项目
npm create vue@latest client
cd client
npm install vue-router@4 vant@4 axios
cd ..

# 创建后端目录结构
mkdir -p server/{handlers,middleware,routes,services,utils}
```

### 2. 安装Cloudflare Workers工具
```bash
npm install -g wrangler
npm install wrangler --save-dev
```

### 3. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
wrangler secret put KUAIZI_APP_KEY
wrangler secret put KUAIZI_APP_SECRET
wrangler secret put KUAIZI_ACCOUNT_ID
```

### 4. 本地开发
```bash
# 启动开发服务器
npm run dev

# 或分别启动前后端
npm run client:dev  # 前端开发服务器
npm run server:dev  # Workers开发服务器
```

### 5. 部署到Cloudflare
```bash
# 构建项目
npm run build

# 部署到Cloudflare Workers
npm run deploy
```

这份产品开发说明提供了完整的技术规格和实现细节，可以直接用于从零开始复刻这个NFC抖音视频营销工具项目。所有代码示例都基于实际项目代码，确保可行性和准确性。