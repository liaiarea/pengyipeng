/**
 * CORS中间件 - Cloudflare Workers版本
 */

/**
 * 处理CORS
 * @param {Request} request 请求对象
 * @param {Response} response 响应对象（可选）
 * @returns {Response} 带CORS头的响应
 */
export function handleCors(request, response = null) {
  const origin = request.headers.get('Origin');
  
  // 允许的源列表
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-worker.your-subdomain.workers.dev'
    // 生产环境需要添加实际域名
  ];

  // 检查是否为允许的源
  const isAllowedOrigin = allowedOrigins.includes(origin) || 
                         origin?.endsWith('.workers.dev') ||
                         !origin; // 同源请求

  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? (origin || '*') : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };

  // 如果是OPTIONS预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // 如果传入了响应对象，添加CORS头后返回
  if (response) {
    // 复制现有响应
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        ...corsHeaders
      }
    });
    return newResponse;
  }

  // 如果没有传入响应，返回空的CORS响应
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
} 