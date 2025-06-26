/**
 * NFC处理器 - Cloudflare Workers版本
 */

import { KuaiziService } from '../services/kuaiziService';
import { createErrorResponse, createSuccessResponse } from '../utils/response';
import { validateRequest } from '../utils/validation';

export class NfcHandler {
  constructor(env) {
    this.env = env;
    this.kuaiziService = new KuaiziService(env);
  }

  /**
   * 处理NFC跳转请求
   */
  async handleRedirect(request) {
    try {
      const url = new URL(request.url);
      const store_id = url.searchParams.get('store_id');
      const category = url.searchParams.get('category');
      
      console.log('🔍 NFC跳转请求:', { store_id, category, ip: request.headers.get('CF-Connecting-IP') });

      // 获取用户设备信息
      const userAgent = request.headers.get('User-Agent') || '';
      const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
      const isAndroid = /Android/i.test(userAgent);
      const isMobile = isIOS || isAndroid;

      // 移动端设备检测
      if (!isMobile) {
        return Response.redirect('/mobile-required', 302);
      }

      // 获取Kuaizi API中的视频
      const videoData = await this.kuaiziService.getUnusedVideo({
        store_id,
        category: category || 'general'
      });

      if (!videoData) {
        console.error('❌ 没有可用的视频素材');
        return Response.redirect('/no-video-available', 302);
      }

      // 标记视频为已使用
      await this.kuaiziService.markVideoAsUsed(videoData.id);

      // 生成抖音跳转链接
      const douyinUrl = this.generateDouyinUrl(videoData, isIOS);
      
      console.log('✅ 生成抖音跳转链接:', douyinUrl);

      // 重定向到抖音应用
      return Response.redirect(douyinUrl, 302);

    } catch (error) {
      console.error('❌ NFC跳转处理失败:', error);
      
      // 根据错误类型返回不同页面
      let errorMsg = '获取视频失败，请重试';
      if (error.message.includes('余额不足')) {
        errorMsg = '账户余额不足，请联系管理员';
      } else if (error.message.includes('签名验证失败')) {
        errorMsg = 'API配置错误，请联系技术支持';
      }
      
      return Response.redirect('/error?msg=' + encodeURIComponent(errorMsg), 302);
    }
  }

  /**
   * 处理获取视频列表请求
   */
  async handleGetVideos(request) {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page')) || 1;
      const limit = parseInt(url.searchParams.get('limit')) || 10;
      const category = url.searchParams.get('category');
      
      // 使用Kuaizi API获取素材列表
      const materialData = await this.kuaiziService.getMaterialList({
        type: 'video',
        page: page,
        size: limit,
        category: category || ''
      });

      return createSuccessResponse({
        list: materialData.list || [],
        total: materialData.total || 0,
        page: page,
        limit: limit
      });

    } catch (error) {
      console.error('获取视频列表失败:', error);
      return createErrorResponse(500, error.message || '获取视频列表失败');
    }
  }

  /**
   * 处理手动触发请求
   */
  async handleTrigger(request) {
    try {
      // 验证请求内容类型
      if (!request.headers.get('content-type')?.includes('application/json')) {
        return createErrorResponse(400, '请求内容类型必须为application/json');
      }

      const body = await request.json();
      const { store_id, category } = body;

      // 验证必要参数
      if (!store_id) {
        return createErrorResponse(400, '商店ID不能为空');
      }

      // 获取视频数据
      const videoData = await this.kuaiziService.getUnusedVideo({
        store_id,
        category: category || 'general'
      });

      if (!videoData) {
        return createSuccessResponse(null, 404, '暂无可用视频');
      }

      return createSuccessResponse({
        video: videoData,
        douyin_url_ios: this.generateDouyinUrl(videoData, true),
        douyin_url_android: this.generateDouyinUrl(videoData, false)
      });

    } catch (error) {
      console.error('手动触发失败:', error);
      return createErrorResponse(500, error.message || '手动触发失败');
    }
  }

  /**
   * 处理获取账户信息请求
   */
  async handleGetAccount(request) {
    try {
      // 获取素材统计信息作为账户状态检查
      const materialData = await this.kuaiziService.getMaterialList({
        type: 'video',
        page: 1,
        size: 1
      });
      
      return createSuccessResponse({
        total_materials: materialData.total,
        status: 'active',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('获取账户信息失败:', error);
      return createErrorResponse(500, error.message || '获取账户信息失败');
    }
  }

  /**
   * 生成抖音跳转URL
   * @param {Object} videoData - 视频数据
   * @param {boolean} isIOS - 是否为iOS设备 
   */
  generateDouyinUrl(videoData, isIOS) {
    const baseUrl = isIOS 
      ? 'snssdk1128://platformapi/startapp' // iOS抖音scheme
      : 'snssdk1128://platformapi/startapp'; // Android抖音scheme

    const params = new URLSearchParams({
      appKey: this.env.DOUYIN_APP_ID || 'default_app_id',
      videoPath: videoData.video_url,
      caption: videoData.caption || '',
      hashtags: videoData.hashtags ? videoData.hashtags.join(',') : '',
      // 添加回调参数
      callback: `${this.env.DOMAIN}/api/douyin/callback`
    });

    return `${baseUrl}?${params.toString()}`;
  }
} 