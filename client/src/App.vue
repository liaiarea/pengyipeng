<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    console.log('🚀 NFC抖音视频应用已启动');
    
    // 检测设备类型
    this.detectDevice();
    
    // 检测NFC支持
    this.checkNFCSupport();
  },
  methods: {
    detectDevice() {
      const userAgent = navigator.userAgent;
      const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
      const isAndroid = /Android/i.test(userAgent);
      
      console.log('📱 设备检测:', {
        isIOS,
        isAndroid,
        userAgent: userAgent.slice(0, 50) + '...'
      });
    },
    
    checkNFCSupport() {
      if ('NDEFReader' in window) {
        console.log('✅ 设备支持Web NFC');
      } else {
        console.log('⚠️ 设备不支持Web NFC，将使用URL跳转方式');
      }
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

#app {
  height: 100%;
}

/* 移动端适配 */
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }
}

/* 阻止用户选择和缩放 */
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 通用按钮样式 */
.primary-btn {
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
}

/* 加载动画 */
.loading-spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #ff6b6b;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 