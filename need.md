
1. 产品需求：
我需要开发碰一碰打开抖音发送抖音视频的功能。主要是针对实体商家做营销推广的工具，用户打开手机碰一碰就可以直接发布视频。想法使用苹果/安卓手机，的nfc功能，碰一碰有nfc功能的卡片，直接跳转网页链接，先是接入筷子科技的api，api里面有已经ai剪辑好的视频，选择已经剪辑好没用过的视频提取出来，放到抖音发布的上面，视频附带的文案同样也复制过去。具体要怎么开发，用什么技术。我打算使用cursor开发。


可参考的链接：（包括附件图片）
https://open.kuaizi.ai/document/#/index
https://open.kuaizi.ai/document/#/mcp?a_keywordid=null&bd_vid=null





2. 根据您的需求，开发"碰一碰发抖音视频"功能需要结合NFC技术和Kuaizi OpenAPI。以下是完整的技术方案和开发步骤：

### 技术架构
```mermaid
graph TD
    A[NFC标签] --> B(手机NFC感应)
    B --> C(Web页面)
    C --> D{Kuaizi API}
    D --> E[获取AI剪辑视频]
    D --> F[获取营销文案]
    E --> G(抖音发布页面)
    F --> G


### 核心组件
1. **NFC标签**：
   - 使用NTAG213/215/216等可写NFC标签
   - 写入包含服务端URL的NDEF记录

2. **移动端Web应用**：
   - 响应式设计（Vue.js/React）
   - 抖音SDK集成
   - 调用Kuaizi OpenAPI

3. **服务端**：
   - 处理Kuaizi API请求（Node.js/Python）
   - 管理视频使用状态
   - 生成抖音跳转链接

### 开发步骤

#### 1. NFC配置
```javascript
// NFC标签写入示例（使用NFC Tools）
const ndefMessage = [
  { recordType: "url", data: "https://your-server.com/nfc-redirect" }
];
writeNdefTag(ndefMessage);
```

#### 2. 服务端API（Node.js示例）
```javascript
const express = require('express');
const axios = require('axios');
const md5 = require('md5');

const app = express();
app.use(express.json());

// 处理NFC跳转请求
app.get('/nfc-redirect', async (req, res) => {
  try {
    // 获取未使用视频
    const videoData = await getKuaiziVideo();
    
    // 生成抖音跳转链接
    const douyinURL = `snssdk1128://platformapi/startapp?appKey=...&videoPath=${videoData.url}`;
    
    // 重定向到抖音
    res.redirect(douyinURL);
  } catch (error) {
    res.status(500).send('服务异常');
  }
});

// 调用Kuaizi API
async function getKuaiziVideo() {
  const timestamp = Date.now();
  const sign = md5(`${timestamp}#${process.env.APP_SECRET}`);
  
  const response = await axios.post(
    'https://openapi.kuaizi.co/v2/material/list',
    { type: 'video', used: false },
    {
      headers: {
        'AUTH-TIMESTAMP': timestamp,
        'AUTH-SIGN': sign,
        'APP-KEY': process.env.APP_KEY
      }
    }
  );
  
  return response.data[0]; // 返回第一个未使用视频
}

app.listen(3000);
```

#### 3. 前端页面（Vue.js示例）
```vue
<template>
  <div v-if="loading">加载中...</div>
  <div v-else>
    <video :src="videoData.url" controls></video>
    <p>{{ videoData.caption }}</p>
    <button @click="shareToDouyin">发布到抖音</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      videoData: null
    };
  },
  async mounted() {
    // 从URL参数获取视频ID
    const videoId = this.$route.query.video_id;
    
    // 获取视频详情
    const response = await fetch(`/api/video/${videoId}`);
    this.videoData = await response.json();
    this.loading = false;
  },
  methods: {
    shareToDouyin() {
      // 调用抖音分享SDK
      Douyin.share({
        type: 'video',
        videoPath: this.videoData.url,
        caption: this.videoData.caption,
        hashtags: ['#商家推广']
      });
    }
  }
};
</script>
```

### 抖音SDK集成关键点
```javascript
// 初始化抖音SDK
Douyin.init({
  appId: 'YOUR_APP_ID',
  redirectUri: 'https://your-domain.com/auth-callback'
});

// 分享视频到抖音
function shareVideo(videoPath, caption) {
  Douyin.open({
    method: 'share',
    video: {
      path: videoPath,
      description: caption
    }
  });
}
```

### Kuaizi API调用注意事项
1. **签名生成**：
   ```javascript
   const sign = md5(timestamp + '#' + app_secret);
   ```

2. **请求头设置**：
   ```http
   AUTH-TIMESTAMP: 1724895757000
   AUTH-SIGN: 23c637ee028dcf3b4ef9b3c79f5fe613
   APP-KEY: MjVkZTE0NWY0MDZk
   ```

3. **错误处理**：
   - 40000: 检查account_id
   - 40005: 验证APP KEY有效性
   - 61000: 检查账户余额

### 部署流程
1. 在Kuaizi平台申请OpenAPI权限
2. 配置NFC标签指向服务端URL
3. 部署Node.js服务到云平台
4. 申请抖音开放平台应用权限
5. 开发管理后台（监控使用情况）

### 在Cursor中开发
1. 安装Cursor（https://cursor.sh）
2. 创建项目结构：
   ```
   /server
     index.js
   /client
     public
     src
       App.vue
   .env
   ```
3. 配置`.cursor/mcp.json`：
   ```json
   {
     "kuaizi_api": {
       "endpoint": "https://openapi.kuaizi.co/v2",
       "auth": "header"
     },
     "douyin": {
       "app_id": "YOUR_DOUYIN_APPID",
       "sdk_version": "3.0.0"
     }
   }
   ```


