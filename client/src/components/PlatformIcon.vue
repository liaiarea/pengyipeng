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
        'xiaohongshu-note': '书',
        'dianping': '点',
        'meituan': '美',
        'eleme': '饿',
        'baidu-map': '百',
        'douyin-review': '抖'
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

/* 各平台特殊样式 */
.douyin-icon {
  background: #000000 !important;
}

.kuaishou-icon {
  background: #FF6600 !important;
}

.xiaohongshu-icon {
  background: #FF2442 !important;
}

.wechat-channels-icon,
.wechat-icon {
  background: #07C160 !important;
}

.dianping-icon,
.meituan-icon {
  background: #FFBA00 !important;
}

.eleme-icon {
  background: #00D7FF !important;
}

.baidu-map-icon {
  background: #3385FF !important;
}
</style> 