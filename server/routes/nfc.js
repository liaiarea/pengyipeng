/**
 * NFC路由处理 - Cloudflare Workers版本
 */

import { KuaiziService } from '../services/kuaiziService.js';
import { createResponse, createSuccessResponse, createErrorResponse } from '../utils/response.js';
import { validateInput } from '../utils/validation.js';

export async function handleNfcRoutes(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const kuaiziService = new KuaiziService(env);
  
  try {
    // GET /api/nfc/redirect - NFC跳转处理
    if (path === '/api/nfc/redirect' && method === 'GET') {
      return await handleNfcRedirect(request, env, kuaiziService);
    }
    
    // GET /api/nfc/videos - 获取视频列表
    if (path === '/api/nfc/videos' && method === 'GET') {
      return await handleGetVideos(request, env, kuaiziService);
    }
    
    // GET /api/nfc/account - 获取账户信息
    if (path === '/api/nfc/account' && method === 'GET') {
      return await handleGetAccount(request, env, kuaiziService);
    }
    
    // POST /api/nfc/trigger - 手动触发
    if (path === '/api/nfc/trigger' && method === 'POST') {
      return await handleManualTrigger(request, env, kuaiziService);
    }
    
    return createErrorResponse(404, 'NFC接口不存在');
    
  } catch (error) {
    console.error('NFC路由处理错误:', error);
    return createErrorResponse(500, 'NFC服务处理失败', error.message);
  }
}

/**
 * NFC跳转主处理函数
 */
async function handleNfcRedirect(request, env, kuaiziService) {
  try {
    const url = new URL(request.url);
    const store_id = url.searchParams.get('store_id');
    const category = url.searchParams.get('category') || 'general';
    
    console.log('🔍 NFC跳转请求:', { store_id, category });
    
    if (!store_id) {
      return Response.redirect('/error?msg=' + encodeURIComponent('缺少商店ID参数'), 302);
    }
    
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
    const videoData = await kuaiziService.getUnusedVideo({
      store_id,
      category
    });
    
    if (!videoData) {
      console.error('❌ 没有可用的视频素材');
      return Response.redirect('/no-video-available', 302);
    }
    
    // 标记视频为已使用
    await kuaiziService.markVideoAsUsed(videoData.id);
    
    // 生成抖音跳转链接
    const douyinUrl = generateDouyinUrl(videoData, isIOS, env);
    
    console.log('✅ 生成抖音跳转链接:', douyinUrl);
    
    // 重定向到抖音应用
    return Response.redirect(douyinUrl, 302);
    
  } catch (error) {
    console.error('❌ NFC跳转处理失败:', error);
    
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
 * 获取可用视频列表
 */
async function handleGetVideos(request, env, kuaiziService) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const category = url.searchParams.get('category');
    
    const materialData = await kuaiziService.getMaterialList({
      type: 'video',
      page,
      size: limit,
      category: category || ''
    });
    
    return createSuccessResponse({
      list: materialData.list || [],
      total: materialData.total || 0,
      page,
      limit
    });
    
  } catch (error) {
    console.error('获取视频列表失败:', error);
    return createErrorResponse(500, error.message || '获取视频列表失败');
  }
}

/**
 * 获取账户信息
 */
async function handleGetAccount(request, env, kuaiziService) {
  try {
    const materialData = await kuaiziService.getMaterialList({
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
 * 手动触发视频获取
 */
async function handleManualTrigger(request, env, kuaiziService) {
  try {
    const body = await request.json();
    const { store_id, category } = body;
    
    const validation = validateInput(body, {
      store_id: { required: true, type: 'string' },
      category: { required: false, type: 'string' }
    });
    
    if (!validation.valid) {
      return createErrorResponse(400, '参数验证失败', validation.errors);
    }
    
    const videoData = await kuaiziService.getUnusedVideo({
      store_id,
      category: category || 'general'
    });
    
    if (!videoData) {
      return createErrorResponse(404, '暂无可用视频');
    }
    
    return createSuccessResponse({
      video: videoData,
      douyin_url_ios: generateDouyinUrl(videoData, true, env),
      douyin_url_android: generateDouyinUrl(videoData, false, env)
    });
    
  } catch (error) {
    console.error('手动触发失败:', error);
    return createErrorResponse(500, error.message || '手动触发失败');
  }
}

/**
 * 生成抖音跳转URL
 */
function generateDouyinUrl(videoData, isIOS, env) {
  const baseUrl = 'snssdk1128://platformapi/startapp';
  
  const params = new URLSearchParams({
    appKey: env.DOUYIN_APP_ID || 'default_app_id',
    videoPath: videoData.video_url,
    caption: videoData.caption || '',
    hashtags: videoData.hashtags ? videoData.hashtags.join(',') : '',
    callback: `${env.DOMAIN || ''}/api/douyin/callback`
  });
  
  return `${baseUrl}?${params.toString()}`;
} 