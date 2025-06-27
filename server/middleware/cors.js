/**
 * CORS处理中间件 - Cloudflare Workers版本
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

export function handleCors(request, response = null) {
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }
  
  // 为现有响应添加CORS头
  if (response) {
    const newHeaders = new Headers(response.headers);
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
  
  // 返回默认CORS响应
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS
  });
} 