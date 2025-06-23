// 简化的筷子API测试脚本
require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

const API_BASE = process.env.KUAIZI_API_BASE || 'https://openapi.kuaizi.co/v2';
const APP_KEY = process.env.KUAIZI_APP_KEY;
const APP_SECRET = process.env.KUAIZI_APP_SECRET;

console.log('🚀 筷子API简化测试...');
console.log(`API_BASE: ${API_BASE}`);
console.log(`APP_KEY: ${APP_KEY}`);
console.log(`APP_SECRET: ${APP_SECRET ? '***配置正确***' : '❌缺失'}`);

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

async function testAPIEndpoints() {
  const headers = getHeaders();
  console.log('📋 请求头:', headers);
  
  // 测试不同的端点
  const endpoints = [
    '/account/info',
    '/user/info', 
    '/material/list',
    '/account',
    '/user'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 测试端点: ${API_BASE}${endpoint}`);
      
      const response = await axios.get(`${API_BASE}${endpoint}`, {
        headers,
        timeout: 5000
      });
      
      console.log(`✅ ${endpoint} - 成功:`, response.data);
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${endpoint} - 错误:`, {
          status: error.response.status,
          data: error.response.data
        });
      } else {
        console.log(`❌ ${endpoint} - 网络错误:`, error.message);
      }
    }
  }
  
  // 测试POST请求
  try {
    console.log(`\n🔍 测试POST: ${API_BASE}/material/list`);
    
    const response = await axios.post(`${API_BASE}/material/list`, {
      type: 'video',
      page: 1,
      size: 5
    }, {
      headers,
      timeout: 5000
    });
    
    console.log('✅ POST /material/list - 成功:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ POST /material/list - 错误:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.log('❌ POST /material/list - 网络错误:', error.message);
    }
  }
}

testAPIEndpoints(); 