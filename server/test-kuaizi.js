// 筷子API测试脚本
require('dotenv').config({ path: '../.env' });
const kuaiziService = require('./services/kuaiziService');

async function testKuaiziAPI() {
  console.log('🚀 开始测试筷子API...');
  console.log('📋 配置信息:');
  console.log(`   APP_KEY: ${process.env.KUAIZI_APP_KEY}`);
  console.log(`   APP_SECRET: ${process.env.KUAIZI_APP_SECRET ? '***已配置***' : '❌未配置'}`);
  console.log(`   API_BASE: ${process.env.KUAIZI_API_BASE}`);
  console.log(`   ACCOUNT_ID: ${process.env.KUAIZI_ACCOUNT_ID}`);
  console.log();

  try {
    // 测试1：获取素材列表
    console.log('1️⃣ 测试获取素材列表...');
    const materialData = await kuaiziService.getMaterialList({
      type: 'video',
      page: 1,
      size: 5
    });
    console.log('✅ 素材列表:', {
      total: materialData.total,
      page: materialData.page,
      page_size: materialData.page_size,
      count: materialData.list?.length || 0,
      first_video: materialData.list?.[0] ? {
        id: materialData.list[0].id,
        title: materialData.list[0].title,
        url: materialData.list[0].url
      } : null
    });
    console.log();

    // 测试2：获取未使用视频
    console.log('2️⃣ 测试获取未使用视频...');
    const videoData = await kuaiziService.getUnusedVideo({
      category: 'general'
    });
    console.log('✅ 视频数据:', videoData);
    console.log();

    // 测试3：标记视频为已使用
    if (videoData) {
      console.log('3️⃣ 测试标记视频为已使用...');
      const marked = await kuaiziService.markVideoAsUsed(videoData.id);
      console.log('✅ 标记结果:', marked);
      console.log();
    }

    console.log('🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

// 运行测试
testKuaiziAPI(); 