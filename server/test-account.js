// 包含账户ID的筷子API测试脚本
require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

const API_BASE = process.env.KUAIZI_API_BASE || 'https://openapi.kuaizi.co/v2';
const APP_KEY = process.env.KUAIZI_APP_KEY;
const APP_SECRET = process.env.KUAIZI_APP_SECRET;
const ACCOUNT_ID = process.env.KUAIZI_ACCOUNT_ID;

console.log('🚀 筷子API账户测试...');
console.log(`API_BASE: ${API_BASE}`);
console.log(`APP_KEY: ${APP_KEY}`);
console.log(`ACCOUNT_ID: ${ACCOUNT_ID}`);

function generateSign(timestamp) {
  const signString = `${timestamp}#${APP_SECRET}`;
  return crypto.createHash('md5').update(signString).digest('hex');
}

function getHeaders() {
  const timestamp = Date.now();
  const sign = generateSign(timestamp);
  
  return {
    'AUTH-TIMESTAMP': timestamp.toString(),
    'AUTH-SIGN': sign,
    'APP-KEY': APP_KEY,
    'Content-Type': 'application/json'
  };
}

async function testWithAccountId() {
  try {
    console.log('\n🔍 测试 /material/list 包含账户ID...');
    
    const requestData = {
      account_id: ACCOUNT_ID,
      type: 'video',
      page: 1,
      size: 5
    };
    
    console.log('📋 请求数据:', requestData);
    console.log('📋 请求头:', getHeaders());
    
    const response = await axios.post(`${API_BASE}/material/list`, requestData, {
      headers: getHeaders(),
      timeout: 10000
    });
    
    console.log('✅ 成功获取素材列表:', response.data);
    
    if (response.data.data && response.data.data.list) {
      console.log('📊 素材统计:');
      console.log(`   总数: ${response.data.data.total}`);
      console.log(`   当前页: ${response.data.data.list.length}个`);
      
      if (response.data.data.list.length > 0) {
        const firstVideo = response.data.data.list[0];
        console.log('🎬 第一个视频:');
        console.log(`   ID: ${firstVideo.id}`);
        console.log(`   标题: ${firstVideo.title || '无标题'}`);
        console.log(`   URL: ${firstVideo.url || '无URL'}`);
        console.log(`   时长: ${firstVideo.duration || '未知'}秒`);
      }
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API错误:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.log('❌ 网络错误:', error.message);
    }
  }
}

testWithAccountId(); 