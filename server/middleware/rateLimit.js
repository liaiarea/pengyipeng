/**
 * 速率限制中间件 - Cloudflare Workers版本
 * 使用Cloudflare的边缘缓存进行速率限制
 */

import { createResponse } from '../utils/response.js';

const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15分钟窗口
  maxRequests: 100, // 最大请求数
  keyPrefix: 'rate_limit:'
};

export async function handleRateLimit(request, env) {
  try {
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                    request.headers.get('X-Forwarded-For') || 
                    'unknown';
    
    const key = `${RATE_LIMIT_CONFIG.keyPrefix}${clientIP}`;
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_CONFIG.windowMs;
    
    // 尝试从KV获取当前计数
    let rateLimitData;
    try {
      const stored = await env.VIDEO_CACHE?.get(key);
      rateLimitData = stored ? JSON.parse(stored) : { count: 0, resetTime: now + RATE_LIMIT_CONFIG.windowMs };
    } catch (e) {
      // KV不可用时，允许请求通过
      console.warn('KV存储不可用，跳过速率限制:', e);
      return null;
    }
    
    // 检查是否需要重置窗口
    if (now > rateLimitData.resetTime) {
      rateLimitData = { count: 0, resetTime: now + RATE_LIMIT_CONFIG.windowMs };
    }
    
    // 检查是否超过限制
    if (rateLimitData.count >= RATE_LIMIT_CONFIG.maxRequests) {
      return createResponse(429, '请求过于频繁，请稍后再试', {
        retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
      });
    }
    
    // 增加计数并更新存储
    rateLimitData.count++;
    try {
      await env.VIDEO_CACHE?.put(key, JSON.stringify(rateLimitData), {
        expirationTtl: Math.ceil(RATE_LIMIT_CONFIG.windowMs / 1000)
      });
    } catch (e) {
      console.warn('更新速率限制数据失败:', e);
    }
    
    return null; // 允许请求继续
    
  } catch (error) {
    console.error('速率限制处理错误:', error);
    return null; // 出错时允许请求通过
  }
} 