/**
 * 速率限制中间件 - Cloudflare Workers版本
 */

import { createErrorResponse } from '../utils/response';

/**
 * 处理速率限制
 * @param {Request} request 请求对象
 * @param {Object} env 环境变量
 * @returns {Response|null} 如果被限制返回错误响应，否则返回null
 */
export async function handleRateLimit(request, env) {
  try {
    // 获取客户端IP
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                    request.headers.get('X-Forwarded-For') || 
                    'unknown';
    
    // 速率限制配置
    const RATE_LIMIT_WINDOW = 15 * 60; // 15分钟窗口
    const RATE_LIMIT_MAX_REQUESTS = 100; // 最大请求数
    
    // 构建缓存键
    const rateLimitKey = `rate_limit_${clientIP}`;
    const currentTime = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(currentTime / RATE_LIMIT_WINDOW) * RATE_LIMIT_WINDOW;
    const windowKey = `${rateLimitKey}_${windowStart}`;
    
    // 从KV获取当前窗口的请求计数
    const currentCountStr = await env.VIDEO_CACHE.get(windowKey);
    const currentCount = currentCountStr ? parseInt(currentCountStr) : 0;
    
    // 检查是否超过限制
    if (currentCount >= RATE_LIMIT_MAX_REQUESTS) {
      console.log(`🚫 IP ${clientIP} 超过速率限制: ${currentCount}/${RATE_LIMIT_MAX_REQUESTS}`);
      
      return createErrorResponse(429, '请求过于频繁，请稍后再试', {
        limit: RATE_LIMIT_MAX_REQUESTS,
        window: RATE_LIMIT_WINDOW,
        current: currentCount,
        resetTime: windowStart + RATE_LIMIT_WINDOW
      });
    }
    
    // 增加计数
    const newCount = currentCount + 1;
    const ttl = (windowStart + RATE_LIMIT_WINDOW) - currentTime;
    
    await env.VIDEO_CACHE.put(windowKey, newCount.toString(), {
      expirationTtl: ttl
    });
    
    console.log(`✅ IP ${clientIP} 请求计数: ${newCount}/${RATE_LIMIT_MAX_REQUESTS}`);
    
    // 没有被限制，返回null
    return null;
    
  } catch (error) {
    console.error('❌ 速率限制检查失败:', error);
    // 如果速率限制检查失败，允许请求通过
    return null;
  }
}

/**
 * API特定的速率限制
 * @param {Request} request 请求对象
 * @param {Object} env 环境变量
 * @param {string} apiType API类型（如'nfc', 'kuaizi'等）
 * @param {Object} limits 自定义限制配置
 * @returns {Response|null} 如果被限制返回错误响应，否则返回null
 */
export async function handleApiRateLimit(request, env, apiType, limits = {}) {
  try {
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    
    // 默认限制配置
    const defaultLimits = {
      window: 60, // 1分钟窗口
      maxRequests: 20 // 最大20个请求
    };
    
    const config = { ...defaultLimits, ...limits };
    
    const rateLimitKey = `api_rate_limit_${apiType}_${clientIP}`;
    const currentTime = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(currentTime / config.window) * config.window;
    const windowKey = `${rateLimitKey}_${windowStart}`;
    
    const currentCountStr = await env.VIDEO_CACHE.get(windowKey);
    const currentCount = currentCountStr ? parseInt(currentCountStr) : 0;
    
    if (currentCount >= config.maxRequests) {
      console.log(`🚫 API ${apiType} IP ${clientIP} 超过速率限制: ${currentCount}/${config.maxRequests}`);
      
      return createErrorResponse(429, `${apiType} API请求过于频繁，请稍后再试`, {
        api: apiType,
        limit: config.maxRequests,
        window: config.window,
        current: currentCount,
        resetTime: windowStart + config.window
      });
    }
    
    const newCount = currentCount + 1;
    const ttl = (windowStart + config.window) - currentTime;
    
    await env.VIDEO_CACHE.put(windowKey, newCount.toString(), {
      expirationTtl: ttl
    });
    
    return null;
    
  } catch (error) {
    console.error('❌ API速率限制检查失败:', error);
    return null;
  }
} 