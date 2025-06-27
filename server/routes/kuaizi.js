/**
 * 快子API路由处理 - Cloudflare Workers版本
 */

import { KuaiziService } from '../services/kuaiziService.js';
import { createResponse, createSuccessResponse, createErrorResponse } from '../utils/response.js';
import { validatePagination, validateCategory, validateInput } from '../utils/validation.js';

export async function handleKuaiziRoutes(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const kuaiziService = new KuaiziService(env);
  
  try {
    // GET /api/kuaizi/videos - 获取视频列表
    if (path === '/api/kuaizi/videos' && method === 'GET') {
      return await handleGetVideos(request, env, kuaiziService);
    }
    
    // GET /api/kuaizi/test - API连接测试
    if (path === '/api/kuaizi/test' && method === 'GET') {
      return await handleApiTest(request, env, kuaiziService);
    }
    
    // GET /api/kuaizi/account - 获取账户信息
    if (path === '/api/kuaizi/account' && method === 'GET') {
      return await handleGetAccount(request, env, kuaiziService);
    }
    
    // 测试API连接
    if (path === '/test') {
      console.log('🔍 测试快子API连接...');
      
      if (!kuaiziService.appKey || !kuaiziService.appSecret) {
        return createErrorResponse(500, '快子API配置缺失，请检查环境变量');
      }
      
      try {
        const materialData = await kuaiziService.getMaterialList({
          type: 'video',
          page: 1,
          size: 1
        });
        
        return createSuccessResponse({
          status: 'connected',
          message: '快子API连接成功',
          total_videos: materialData.total,
          config: {
            app_key: kuaiziService.appKey,
            account_id: kuaiziService.accountId
          }
        });
      } catch (error) {
        return createErrorResponse(500, '快子API连接失败', error.message);
      }
    }
    
    // 获取随机视频
    if (path === '/random-video' && method === 'GET') {
      console.log('🎲 获取随机视频请求');
      
      try {
        const video = await kuaiziService.getRandomVideo();
        
        if (!video) {
          return createErrorResponse(404, '没有可用的视频素材');
        }
        
        return createSuccessResponse({
          video,
          douyin_share_url: `snssdk1128://aweme/detail/${video.id}`,
          web_share_url: `https://www.douyin.com/video/${video.id}`,
          message: '成功获取随机视频'
        });
      } catch (error) {
        console.error('❌ 获取随机视频失败:', error);
        return createErrorResponse(500, '获取视频失败', error.message);
      }
    }
    
    // 获取视频素材列表
    if (path === '/materials' && method === 'GET') {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page')) || 1;
      const size = parseInt(url.searchParams.get('size')) || 20;
      const category = url.searchParams.get('category');
      const keyword = url.searchParams.get('keyword');
      
      console.log('📋 获取素材列表:', { page, size, category, keyword });
      
      try {
        const materialData = await kuaiziService.getMaterialList({
          page,
          size,
          category,
          keyword
        });
        
        return createSuccessResponse({
          ...materialData,
          message: '获取素材列表成功'
        });
      } catch (error) {
        console.error('❌ 获取素材列表失败:', error);
        return createErrorResponse(500, '获取素材失败', error.message);
      }
    }
    
    // 获取账户信息
    if (path === '/account' && method === 'GET') {
      console.log('👤 获取账户信息');
      
      try {
        const accountInfo = await kuaiziService.getAccountInfo();
        return createSuccessResponse({
          account: accountInfo,
          message: '获取账户信息成功'
        });
      } catch (error) {
        console.error('❌ 获取账户信息失败:', error);
        return createErrorResponse(500, '获取账户信息失败', error.message);
      }
    }
    
    // 标记视频为已使用
    if (path === '/mark-used' && method === 'POST') {
      const body = await request.json();
      const { video_id } = body;
      
      if (!validateInput(video_id, 'string')) {
        return createErrorResponse(400, 'video_id参数无效');
      }
      
      console.log('✅ 标记视频已使用:', video_id);
      
      try {
        await kuaiziService.markVideoAsUsed(video_id);
        return createSuccessResponse({
          video_id,
          message: '视频已标记为已使用'
        });
      } catch (error) {
        console.error('❌ 标记视频失败:', error);
        return createErrorResponse(500, '标记失败', error.message);
      }
    }
    
    // 重置使用记录
    if (path === '/reset-used' && method === 'POST') {
      console.log('🔄 重置视频使用记录');
      
      try {
        kuaiziService.resetUsedVideos();
        return createSuccessResponse({
          message: '已重置视频使用记录'
        });
      } catch (error) {
        console.error('❌ 重置失败:', error);
        return createErrorResponse(500, '重置失败', error.message);
      }
    }
    
    return createErrorResponse(404, '快子API接口不存在');
    
  } catch (error) {
    console.error('快子API路由处理错误:', error);
    return createErrorResponse(500, '快子API服务处理失败', error.message);
  }
}

/**
 * 获取视频列表
 */
async function handleGetVideos(request, env, kuaiziService) {
  try {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const size = url.searchParams.get('size') || '10';
    const category = url.searchParams.get('category');
    
    // 验证分页参数
    const pageValidation = validatePagination(page, size);
    if (!pageValidation.valid) {
      return createErrorResponse(400, pageValidation.error);
    }
    
    // 验证类别参数
    const categoryValidation = validateCategory(category);
    if (!categoryValidation.valid) {
      return createErrorResponse(400, categoryValidation.error);
    }
    
    const videos = await kuaiziService.getMaterialList({
      type: 'video',
      page: pageValidation.page,
      size: pageValidation.size,
      category
    });

    return createSuccessResponse(videos);

  } catch (error) {
    console.error('获取视频列表失败:', error);
    return createErrorResponse(500, '获取视频列表失败', error.message);
  }
}

/**
 * API连接测试
 */
async function handleApiTest(request, env, kuaiziService) {
  try {
    // 通过获取少量数据来测试连接
    const testData = await kuaiziService.getMaterialList({
      type: 'video',
      page: 1,
      size: 1
    });
    
    return createSuccessResponse({
      connected: true,
      total_videos: testData.total,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API连接测试失败:', error);
    return createErrorResponse(500, 'API连接测试失败', error.message);
  }
}

/**
 * 获取账户信息
 */
async function handleGetAccount(request, env, kuaiziService) {
  try {
    const accountInfo = await kuaiziService.getAccountInfo();
    return createSuccessResponse(accountInfo);
    
  } catch (error) {
    console.error('获取账户信息失败:', error);
    return createErrorResponse(500, '获取账户信息失败', error.message);
  }
} 