/**
 * 抖音处理器 - Cloudflare Workers版本
 */

import { createErrorResponse, createSuccessResponse } from '../utils/response';

export class DouyinHandler {
  constructor(env) {
    this.env = env;
  }

  /**
   * 处理抖音回调
   */
  async handleCallback(request) {
    try {
      const url = new URL(request.url);
      const method = request.method;
      
      console.log('📱 抖音回调请求:', { method, url: url.pathname + url.search });

      let callbackData = {};
      
      // 处理GET和POST回调
      if (method === 'GET') {
        // 从查询参数获取回调数据
        callbackData = Object.fromEntries(url.searchParams.entries());
      } else if (method === 'POST') {
        // 从请求体获取回调数据
        const contentType = request.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          callbackData = await request.json();
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData();
          callbackData = Object.fromEntries(formData.entries());
        }
      }

      console.log('📱 抖音回调数据:', callbackData);

      // 处理不同的回调状态
      const { state, error_code, error_msg, video_id, share_id } = callbackData;

      if (error_code && error_code !== '0') {
        // 分享失败
        console.error('❌ 抖音分享失败:', { error_code, error_msg });
        
        // 记录失败信息到KV
        await this.recordShareResult(callbackData, 'failed');
        
        // 重定向到失败页面
        return Response.redirect('/share-failed?msg=' + encodeURIComponent(error_msg || '分享失败'), 302);
      } else {
        // 分享成功
        console.log('✅ 抖音分享成功:', { video_id, share_id });
        
        // 记录成功信息到KV
        await this.recordShareResult(callbackData, 'success');
        
        // 重定向到成功页面
        return Response.redirect('/share-success?video_id=' + encodeURIComponent(video_id || ''), 302);
      }

    } catch (error) {
      console.error('❌ 抖音回调处理失败:', error);
      
      // 重定向到错误页面
      return Response.redirect('/error?msg=' + encodeURIComponent('回调处理失败'), 302);
    }
  }

  /**
   * 处理抖音授权
   */
  async handleAuth(request) {
    try {
      const url = new URL(request.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      
      console.log('🔐 抖音授权回调:', { code, state });

      if (!code) {
        return createErrorResponse(400, '缺少授权码');
      }

      // 这里可以实现获取access_token的逻辑
      // 由于是演示，暂时返回成功响应
      
      return createSuccessResponse({
        message: '授权成功',
        code,
        state,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ 抖音授权处理失败:', error);
      return createErrorResponse(500, error.message || '授权处理失败');
    }
  }

  /**
   * 记录分享结果到KV存储
   * @param {Object} callbackData 回调数据
   * @param {string} status 状态：success 或 failed
   */
  async recordShareResult(callbackData, status) {
    try {
      const recordKey = `share_result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const recordData = {
        status,
        callback_data: callbackData,
        timestamp: new Date().toISOString(),
        ip: callbackData.ip || 'unknown'
      };

      // 存储到KV，保留30天
      await this.env.VIDEO_CACHE.put(recordKey, JSON.stringify(recordData), {
        expirationTtl: 30 * 24 * 60 * 60 // 30天
      });

      console.log(`📊 分享结果已记录: ${status}`, recordKey);
      
    } catch (error) {
      console.error('❌ 记录分享结果失败:', error);
    }
  }
} 