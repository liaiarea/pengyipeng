/**
 * NFC抖音视频营销工具 - Cloudflare Workers版本
 * 支持静态资源 + API后端的混合部署
 */

import { createRouter } from './routes/router.js';
import { handleCors } from './middleware/cors.js';
import { handleRateLimit } from './middleware/rateLimit.js';
import { createResponse } from './utils/response.js';

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      
      // 处理CORS预检请求
      if (request.method === 'OPTIONS') {
        return handleCors(request);
      }
      
      // API路由处理
      if (path.startsWith('/api/')) {
        // 应用速率限制
        const rateLimitResponse = await handleRateLimit(request, env);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
        
        // 创建路由器并处理请求
        const router = createRouter(env);
        const response = await router.handle(request);
        
        // 添加CORS头
        return handleCors(request, response);
      }
      
      // 健康检查
      if (path === '/health') {
        return createResponse(200, 'success', {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          worker: true
        });
      }
      
      // 前端路由重定向处理
      if (path === '/nfc-redirect') {
        const queryParams = url.search;
        return Response.redirect(`/api/nfc/redirect${queryParams}`, 302);
      }
      
      // API根路径信息
      if (path === '/api' || path === '/api/') {
        return createResponse(200, 'success', {
          message: 'NFC抖音视频API服务 - Cloudflare Workers版',
          version: '1.0.0',
          endpoints: [
            'GET /api/nfc/redirect - NFC跳转处理',
            'GET /api/nfc/videos - 获取视频列表', 
            'POST /api/nfc/trigger - 手动触发',
            'GET /health - 健康检查'
          ]
        });
      }
      
      // 静态资源和SPA路由由Assets处理
      // 如果到达这里说明不是API请求，让Assets处理
      return env.ASSETS.fetch(request);
      
    } catch (error) {
      console.error('Workers处理错误:', error);
      return createResponse(500, '服务器内部错误', null, error.message);
    }
  }
}; 