/**
 * 快子API路由处理 - Cloudflare Workers版本
 */

import { KuaiziService } from '../services/kuaiziService.js';
import { createResponse, createSuccessResponse, createErrorResponse } from '../utils/response.js';
import { validatePagination, validateCategory } from '../utils/validation.js';

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