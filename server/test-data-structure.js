// 检查筷子API返回的数据结构
require('dotenv').config({ path: '../.env' });
const kuaiziService = require('./services/kuaiziService');

async function testDataStructure() {
  console.log('🔍 检查API数据结构...');
  
  try {
    const materialData = await kuaiziService.getMaterialList({
      type: 'video',
      page: 1,
      size: 3
    });
    
    console.log('📊 完整的API响应结构:');
    console.log(JSON.stringify(materialData, null, 2));
    
    if (materialData.list && materialData.list.length > 0) {
      console.log('\n🎬 第一个视频的完整数据:');
      console.log(JSON.stringify(materialData.list[0], null, 2));
      
      console.log('\n📋 视频对象的所有属性:');
      const firstVideo = materialData.list[0];
      Object.keys(firstVideo).forEach(key => {
        console.log(`  ${key}: ${firstVideo[key]} (${typeof firstVideo[key]})`);
      });
    }
    
  } catch (error) {
    console.error('❌ 检查数据结构失败:', error.message);
  }
}

testDataStructure(); 