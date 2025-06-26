/**
 * Cloudflare Workers 路由系统
 */

import { NfcHandler } from '../handlers/nfc';
import { KuaiziHandler } from '../handlers/kuaizi';
import { DouyinHandler } from '../handlers/douyin';
import { createErrorResponse } from '../utils/response';

export function createRouter(env) {
  const nfcHandler = new NfcHandler(env);
  const kuaiziHandler = new KuaiziHandler(env);
  const douyinHandler = new DouyinHandler(env);

  return {
    async handle(request, path) {
      const url = new URL(request.url);
      const method = request.method;

      try {
        // NFC相关路由
        if (path.startsWith('/api/nfc/')) {
          const subPath = path.replace('/api/nfc', '');
          
          switch (subPath) {
            case '/redirect':
              if (method === 'GET') {
                return await nfcHandler.handleRedirect(request);
              }
              break;
              
            case '/videos':
              if (method === 'GET') {
                return await nfcHandler.handleGetVideos(request);
              }
              break;
              
            case '/trigger':
              if (method === 'POST') {
                return await nfcHandler.handleTrigger(request);
              }
              break;
              
            case '/account':
              if (method === 'GET') {
                return await nfcHandler.handleGetAccount(request);
              }
              break;
          }
        }

        // Kuaizi API相关路由
        if (path.startsWith('/api/kuaizi/')) {
          const subPath = path.replace('/api/kuaizi', '');
          
          switch (subPath) {
            case '/materials':
              if (method === 'GET') {
                return await kuaiziHandler.handleGetMaterials(request);
              }
              break;
              
            case '/account':
              if (method === 'GET') {
                return await kuaiziHandler.handleGetAccount(request);
              }
              break;
          }
        }

        // 抖音相关路由
        if (path.startsWith('/api/douyin/')) {
          const subPath = path.replace('/api/douyin', '');
          
          switch (subPath) {
            case '/callback':
              if (method === 'GET' || method === 'POST') {
                return await douyinHandler.handleCallback(request);
              }
              break;
              
            case '/auth':
              if (method === 'GET') {
                return await douyinHandler.handleAuth(request);
              }
              break;
          }
        }

        // 未匹配的路由
        return createErrorResponse(404, '接口不存在');

      } catch (error) {
        console.error('路由处理错误:', error);
        return createErrorResponse(500, '路由处理失败', error.message);
      }
    }
  };
} 