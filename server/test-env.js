require('dotenv').config({ path: '../.env' });

console.log('🔍 测试环境变量加载...');
console.log('KUAIZI_APP_KEY:', process.env.KUAIZI_APP_KEY);
console.log('KUAIZI_APP_SECRET:', process.env.KUAIZI_APP_SECRET ? '***已设置***' : '❌未设置');
console.log('KUAIZI_ACCOUNT_ID:', process.env.KUAIZI_ACCOUNT_ID);
console.log('KUAIZI_API_BASE:', process.env.KUAIZI_API_BASE);

// 测试KuaiziService
const kuaiziService = require('./services/kuaiziService');

async function testService() {
  try {
    console.log('\n🚀 测试KuaiziService...');
    const videos = await kuaiziService.getMaterialList({ type: 'video', page: 1, size: 5 });
    console.log('✅ 成功获取视频:', videos.total, '个视频');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testService(); 