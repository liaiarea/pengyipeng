/**
 * Kuaizi处理器 - Cloudflare Workers版本
 */

import { KuaiziService } from '../services/kuaiziService';
import { createErrorResponse, createSuccessResponse } from '../utils/response';

export class KuaiziHandler {
  constructor(env) {
    this.env = env;
    this.kuaiziService = new KuaiziService(env);
  }

  /**
   * 处理获取素材列表请求
   */
  async handleGetMaterials(request) {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page')) || 1;
      const size = parseInt(url.searchParams.get('size')) || 20;
      const type = url.searchParams.get('type') || 'video';
      const category = url.searchParams.get('category');
      const keyword = url.searchParams.get('keyword');
      
      // 调用Kuaizi服务获取素材列表
      const materialData = await this.kuaiziService.getMaterialList({
        type,
        page,
        size,
        category,
        keyword
      });

      return createSuccessResponse({
        list: materialData.list || [],
        total: materialData.total || 0,
        page: materialData.page || page,
        page_size: materialData.page_size || size,
        total_pages: Math.ceil((materialData.total || 0) / size)
      });

    } catch (error) {
      console.error('获取素材列表失败:', error);
      return createErrorResponse(500, error.message || '获取素材列表失败');
    }
  }

  /**
   * 处理获取账户信息请求
   */
  async handleGetAccount(request) {
    try {
      // 通过获取素材列表来检查账户状态
      const materialData = await this.kuaiziService.getMaterialList({
        type: 'video',
        page: 1,
        size: 1
      });
      
      return createSuccessResponse({
        account_id: this.env.KUAIZI_ACCOUNT_ID,
        status: 'active',
        total_materials: materialData.total || 0,
        api_status: 'connected',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('获取账户信息失败:', error);
      
      // 根据错误类型返回不同的状态
      let status = 'error';
      if (error.message.includes('签名验证失败')) {
        status = 'auth_failed';
      } else if (error.message.includes('余额不足')) {
        status = 'insufficient_balance';
      }
      
      return createErrorResponse(500, error.message || '获取账户信息失败', {
        account_status: status
      });
    }
  }
} 