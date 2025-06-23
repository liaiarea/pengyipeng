const axios = require('axios');

async function testNfcApi() {
  try {
    console.log('🚀 测试NFC触发API...');
    
    const response = await axios.post('http://localhost:3000/api/nfc/trigger', {
      store_id: 'test123',
      category: 'general'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ NFC API成功:', response.data);
  } catch (error) {
    console.error('❌ NFC API失败:', error.response?.data || error.message);
  }
}

testNfcApi(); 