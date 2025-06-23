// 测试不同的参数传递方式
require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const crypto = require('crypto');

const API_BASE = process.env.KUAIZI_API_BASE || 'https://openapi.kuaizi.co/v2';
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

async function testQueryParams() {
  console.log('🚀 测试查询参数方式...');
  
  // 方法1: GET请求带查询参数
  try {
    console.log('\n1️⃣ 测试GET请求带查询参数...');
    
    const params = new URLSearchParams({
      account_id: ACCOUNT_ID,
      type: 'video',
      page: 1,
      size: 5
    });
    
    const url = `${API_BASE}/material/list?${params}`;
    console.log('URL:', url);
    
    const response = await axios.get(url, {
      headers: getHeaders(),
      timeout: 10000
    });
    
    console.log('✅ GET查询参数成功:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ GET查询参数错误:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.log('❌ GET查询参数网络错误:', error.message);
    }
  }
  
  // 方法2: 账户ID作为数字类型
  try {
    console.log('\n2️⃣ 测试账户ID作为数字类型...');
    
    const response = await axios.post(`${API_BASE}/material/list`, {
      account_id: parseInt(ACCOUNT_ID), // 转换为数字
      type: 'video',
      page: 1,
      size: 5
    }, {
      headers: getHeaders(),
      timeout: 10000
    });
    
    console.log('✅ 数字账户ID成功:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ 数字账户ID错误:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.log('❌ 数字账户ID网络错误:', error.message);
    }
  }
  
  // 方法3: 尝试最简单的请求
  try {
    console.log('\n3️⃣ 测试最简单的请求...');
    
    const response = await axios.post(`${API_BASE}/material/list`, {
      account_id: ACCOUNT_ID
    }, {
      headers: getHeaders(),
      timeout: 10000
    });
    
    console.log('✅ 简单请求成功:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ 简单请求错误:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.log('❌ 简单请求网络错误:', error.message);
    }
  }
}

testQueryParams(); 