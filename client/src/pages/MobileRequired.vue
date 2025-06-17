<template>
  <div class="mobile-required">
    <div class="content">
      <div class="icon">📱</div>
      <h2>请使用手机访问</h2>
      <p>NFC功能需要在移动设备上使用</p>
      <div class="tips">
        <div class="tip-item">
          <span class="tip-icon">📲</span>
          <span>使用手机扫码访问</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">🔗</span>
          <span>或复制链接到手机浏览器</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MobileRequired'
}
</script>

<style scoped>
.mobile-required {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
}

.tips {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.tip-icon {
  font-size: 1.5rem;
}
</style> 