// 测试完整API端点
const axios = require('axios');

async function testAPI() {
  console.log('🚀 测试完整API...');
  
  try {
    // 测试健康检查
    console.log('\n1️⃣ 测试健康检查...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ 健康检查:', healthResponse.data);
    
    // 测试NFC触发
    console.log('\n2️⃣ 测试NFC触发...');
    const triggerResponse = await axios.post('http://localhost:3000/api/nfc/trigger', {
      store_id: 'test001',
      category: 'general'
    });
    console.log('✅ NFC触发成功:', triggerResponse.data);
    
    // 测试获取视频列表
    console.log('\n3️⃣ 测试获取视频列表...');
    const videosResponse = await axios.get('http://localhost:3000/api/nfc/videos?page=1&limit=3');
    console.log('✅ 视频列表:', videosResponse.data);
    
    // 测试账户信息
    console.log('\n4️⃣ 测试账户信息...');
    const accountResponse = await axios.get('http://localhost:3000/api/nfc/account');
    console.log('✅ 账户信息:', accountResponse.data);
    
    console.log('\n🎉 所有API测试完成！');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API错误:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error('❌ 网络错误:', error.message);
    }
  }
}

testAPI(); 