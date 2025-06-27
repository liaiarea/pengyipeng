/**
 * Cloudflare Workers路由系统
 */

import { handleNfcRoutes } from './nfc.js';
import { handleKuaiziRoutes } from './kuaizi.js';
import { handleDouyinRoutes } from './douyin.js';
import { createResponse } from '../utils/response.js';

export function createRouter(env) {
  return {
    async handle(request) {
      const url = new URL(request.url);
      const path = url.pathname;
      
      try {
        // NFC相关路由
        if (path.startsWith('/api/nfc/')) {
          return await handleNfcRoutes(request, env);
        }
        
        // 快子API路由
        if (path.startsWith('/api/kuaizi/')) {
          return await handleKuaiziRoutes(request, env);
        }
        
        // 抖音API路由
        if (path.startsWith('/api/douyin/')) {
          return await handleDouyinRoutes(request, env);
        }
        
        // 未匹配的API路由
        return createResponse(404, '接口不存在', null);
        
      } catch (error) {
        console.error('路由处理错误:', error);
        return createResponse(500, '服务器内部错误', null, error.message);
      }
    }
  };
} 