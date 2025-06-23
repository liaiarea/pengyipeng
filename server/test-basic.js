// 基础API测试 - 尝试不同的API版本和URL
require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

const APP_KEY = process.env.KUAIZI_APP_KEY;
const APP_SECRET = process.env.KUAIZI_APP_SECRET;
const ACCOUNT_ID = process.env.KUAIZI_ACCOUNT_ID;

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

async function testDifferentVersions() {
  console.log('🚀 测试不同的API版本和URL...');
  
  // 尝试不同的基础URL
  const baseUrls = [
    'https://openapi.kuaizi.co/v2',
    'https://openapi.kuaizi.co/v1',
    'https://openapi.kuaizi.co',
    'https://api.kuaizi.co/v2',
    'https://api.kuaizi.co/v1',
    'https://api.kuaizi.co'
  ];
  
  const endpoints = [
    '/material/list',
    '/materials',
    '/video/list',
    '/account/materials'
  ];
  
  for (const baseUrl of baseUrls) {
    console.log(`\n🔍 测试基础URL: ${baseUrl}`);
    
    for (const endpoint of endpoints) {
      try {
        const url = `${baseUrl}${endpoint}`;
        console.log(`  尝试: ${url}`);
        
        const response = await axios.post(url, {
          account_id: ACCOUNT_ID,
          type: 'video',
          page: 1,
          size: 1
        }, {
          headers: getHeaders(),
          timeout: 5000
        });
        
        console.log(`  ✅ 成功: ${endpoint}`, response.data);
        
      } catch (error) {
        if (error.response) {
          const { status, data } = error.response;
          console.log(`  ❌ ${endpoint} [${status}]:`, data);
          
          // 如果不是404，说明端点可能存在但参数有问题
          if (status !== 404 && status !== 500) {
            console.log(`  📍 ${endpoint} 可能是正确的端点！`);
          }
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          console.log(`  ❌ ${endpoint} - 域名不存在或连接被拒绝`);
        } else {
          console.log(`  ❌ ${endpoint} - 网络错误:`, error.message);
        }
      }
    }
  }
}

// 测试没有版本号的简单请求
async function testSimpleRequest() {
  console.log('\n🔍 测试简单请求...');
  
  try {
    // 尝试最简单的请求
    const response = await axios.get('https://openapi.kuaizi.co/v2/material/list', {
      headers: getHeaders(),
      timeout: 5000
    });
    
    console.log('✅ GET请求成功:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ GET请求错误:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.log('❌ GET请求网络错误:', error.message);
    }
  }
}

testDifferentVersions().then(() => testSimpleRequest()); 