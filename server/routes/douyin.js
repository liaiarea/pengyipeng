/**
 * 抖音API路由处理 - Cloudflare Workers版本
 */

import { createSuccessResponse, createErrorResponse } from '../utils/response.js';

export async function handleDouyinRoutes(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  try {
    // GET /api/douyin/callback - 抖音分享回调
    if (path === '/api/douyin/callback' && method === 'GET') {
      return await handleDouyinCallback(request, env);
    }
    
    // POST /api/douyin/share - 分享视频到抖音
    if (path === '/api/douyin/share' && method === 'POST') {
      return await handleShareToDouyin(request, env);
    }
    
    return createErrorResponse(404, '抖音接口不存在');
    
  } catch (error) {
    console.error('抖音路由处理错误:', error);
    return createErrorResponse(500, '抖音服务处理失败', error.message);
  }
}

async function handleDouyinCallback(request, env) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    
    if (error) {
      console.error('抖音回调错误:', error);
      return Response.redirect('/share-failed?error=' + encodeURIComponent(error), 302);
    }
    
    if (code) {
      console.log('抖音分享成功回调:', { code, state });
      return Response.redirect('/share-success', 302);
    }
    
    return Response.redirect('/share-failed', 302);
    
  } catch (error) {
    console.error('处理抖音回调失败:', error);
    return Response.redirect('/share-failed', 302);
  }
}

async function handleShareToDouyin(request, env) {
  try {
    const body = await request.json();
    const { video_url, caption, hashtags } = body;
    
    if (!video_url) {
      return createErrorResponse(400, '视频URL不能为空');
    }
    
    // 生成抖音分享链接
    const shareUrl = generateDouyinShareUrl({
      video_url,
      caption: caption || '',
      hashtags: hashtags || []
    }, env);
    
    return createSuccessResponse({
      share_url: shareUrl,
      message: '分享链接生成成功'
    });
    
  } catch (error) {
    console.error('生成抖音分享链接失败:', error);
    return createErrorResponse(500, error.message || '生成分享链接失败');
  }
}

function generateDouyinShareUrl(videoData, env) {
  const baseUrl = 'snssdk1128://platformapi/startapp';
  
  const params = new URLSearchParams({
    appKey: env.DOUYIN_APP_ID || 'default_app_id',
    videoPath: videoData.video_url,
    caption: videoData.caption || '',
    hashtags: Array.isArray(videoData.hashtags) ? videoData.hashtags.join(',') : '',
    callback: `${env.DOMAIN || ''}/api/douyin/callback`
  });
  
  return `${baseUrl}?${params.toString()}`;
} 