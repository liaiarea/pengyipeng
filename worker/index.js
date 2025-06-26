/**
 * Cloudflare Workers入口文件
 * NFC抖音视频营销工具 - Workers版本
 */

import { createRouter } from './router';
import { KuaiziService } from './services/kuaiziService';
import { handleCors } from './middleware/cors';
import { handleRateLimit } from './middleware/rateLimit';
import { createErrorResponse, createSuccessResponse } from './utils/response';

export default {
  async fetch(request, env, ctx) {
    try {
      // 处理CORS预检请求
      if (request.method === 'OPTIONS') {
        return handleCors(request);
      }

      // 创建路由器
      const router = createRouter(env);
      
      // 解析URL
      const url = new URL(request.url);
      const path = url.pathname;
      
      // 静态资源处理（前端文件）
      if (shouldServeStaticAsset(path)) {
        return await env.ASSETS.fetch(request);
      }

      // API路由处理
      if (path.startsWith('/api/')) {
        // 应用速率限制
        const rateLimitResponse = await handleRateLimit(request, env);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }

        // 路由处理
        const response = await router.handle(request, path);
        
        // 添加CORS头
        return handleCors(request, response);
      }

      // 前端路由重定向处理
      if (path === '/nfc-redirect') {
        const queryParams = url.search;
        return Response.redirect(`/api/nfc/redirect${queryParams}`, 302);
      }

      // 健康检查
      if (path === '/health') {
        return createSuccessResponse({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          worker: true
        });
      }

      // 根路径API信息
      if (path === '/' || path === '/api') {
        return createSuccessResponse({
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

      // SPA路由支持 - 返回index.html
      if (isSpaRoute(path)) {
        const indexRequest = new Request(new URL('/index.html', request.url), request);
        return await env.ASSETS.fetch(indexRequest);
      }

      // 404处理
      return createErrorResponse(404, '接口不存在');

    } catch (error) {
      console.error('Workers处理错误:', error);
      return createErrorResponse(500, '服务器内部错误', error.message);
    }
  }
};

/**
 * 判断是否应该服务静态资源
 */
function shouldServeStaticAsset(path) {
  return (
    path.startsWith('/assets/') ||
    path.startsWith('/images/') ||
    path.startsWith('/icons/') ||
    path.endsWith('.ico') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.gif') ||
    path.endsWith('.svg') ||
    path.endsWith('.css') ||
    path.endsWith('.js') ||
    path.endsWith('.woff') ||
    path.endsWith('.woff2') ||
    path.endsWith('.ttf') ||
    path.endsWith('.eot') ||
    path === '/manifest.json' ||
    path === '/robots.txt' ||
    path === '/sitemap.xml'
  );
}

/**
 * 判断是否为SPA路由
 */
function isSpaRoute(path) {
  const spaRoutes = [
    '/mobile-required',
    '/no-video-available', 
    '/error',
    '/share-success',
    '/share-failed'
  ];
  
  return spaRoutes.some(route => path.startsWith(route)) || 
         (!path.startsWith('/api/') && !shouldServeStaticAsset(path) && path !== '/');
} 