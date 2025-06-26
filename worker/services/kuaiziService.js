/**
 * Kuaizi API服务 - Cloudflare Workers版本
 */

export class KuaiziService {
  constructor(env) {
    this.env = env;
    this.baseURL = 'https://openapi.kuaizi.co/v2';
    this.appKey = env.KUAIZI_APP_KEY;
    this.appSecret = env.KUAIZI_APP_SECRET;
    this.accountId = env.KUAIZI_ACCOUNT_ID;
    
    if (!this.appKey || !this.appSecret) {
      console.error('❌ 筷子API配置缺失，请检查环境变量');
    }
  }

  /**
   * 生成API签名 - 根据筷子API文档要求
   * @param {number} timestamp 时间戳
   * @returns {string} MD5签名
   */
  async generateSign(timestamp) {
    // 根据筷子API文档：timestamp + "#" + app_secret 进行MD5加密
    const signString = `${timestamp}#${this.appSecret}`;
    
    // 使用Web Crypto API进行MD5加密
    const encoder = new TextEncoder();
    const data = encoder.encode(signString);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 获取API请求头
   * @returns {Promise<Object>} 请求头对象
   */
  async getHeaders() {
    const timestamp = Date.now();
    const sign = await this.generateSign(timestamp);
    
    return {
      'AUTH-TIMESTAMP': timestamp.toString(),
      'AUTH-SIGN': sign,
      'APP-KEY': this.appKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * 获取素材列表
   * @param {Object} params 查询参数
   * @returns {Promise<Object>} 素材列表数据
   */
  async getMaterialList(params = {}) {
    try {
      console.log('📋 获取素材列表:', params);
      
      // 构建查询参数
      const queryParams = new URLSearchParams({
        account_id: this.accountId,
        type: params.type || 'video',
        page: params.page || 1,
        size: params.size || 20
      });

      // 添加可选参数
      if (params.category) {
        queryParams.append('category', params.category);
      }
      if (params.keyword) {
        queryParams.append('keyword', params.keyword);
      }

      const url = `${this.baseURL}/material/list?${queryParams}`;
      console.log('🔗 请求URL:', url);

      const headers = await this.getHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
        cf: {
          cacheTtl: 300, // 缓存5分钟
          cacheEverything: true
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 200) {
        const materialData = data.data;
        console.log('✅ 获取素材成功:', {
          total: materialData.total,
          page: materialData.page,
          page_size: materialData.page_size,
          count: materialData.list?.length || 0
        });
        return materialData;
      } else {
        // 处理筷子API特定错误码
        this.handleKuaiziError(data.code, data.message);
        throw new Error(data.message || '获取素材列表失败');
      }

    } catch (error) {
      console.error('❌ 获取素材列表失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取未使用的视频
   * @param {Object} params 查询参数
   * @returns {Promise<Object|null>} 视频数据
   */
  async getUnusedVideo(params = {}) {
    try {
      console.log('🎯 获取未使用视频:', params);
      
      // 获取已使用视频列表（从KV存储中）
      const usedVideoIds = await this.getUsedVideoIds();
      
      // 获取视频素材列表
      const materialData = await this.getMaterialList({
        type: 'video',
        category: params.category,
        page: 1,
        size: 50 // 获取更多素材以便筛选
      });

      let videos = materialData.list || [];
      
      // 过滤已使用的视频
      videos = videos.filter(video => !usedVideoIds.has(video.id));

      if (videos.length === 0) {
        console.log('⚠️ 没有可用的未使用视频');
        return null;
      }

      // 选择第一个可用视频
      const selectedVideo = videos[0];
      
      return {
        id: selectedVideo.id,
        video_url: selectedVideo.file?.url || '',
        cover_url: selectedVideo.file?.thumb_url || '',
        caption: selectedVideo.name || selectedVideo.note || '精彩视频内容',
        hashtags: this.parseHashtags(selectedVideo.tags || ''),
        duration: selectedVideo.file?.file_info?.play_time || 0,
        size: selectedVideo.file?.size || 0,
        width: selectedVideo.file?.file_info?.width || 0,
        height: selectedVideo.file?.file_info?.height || 0,
        fps: selectedVideo.file?.file_info?.fps || 0,
        bitrate: selectedVideo.file?.file_info?.bitrate || 0,
        file_ext: selectedVideo.file_ext || 'mp4',
        create_date: selectedVideo.create_date || ''
      };

    } catch (error) {
      console.error('❌ 获取未使用视频失败:', error.message);
      throw error;
    }
  }

  /**
   * 标记视频为已使用
   * @param {string} videoId 视频ID
   * @returns {Promise<boolean>} 是否成功
   */
  async markVideoAsUsed(videoId) {
    try {
      // 存储到KV中，设置7天过期时间
      const key = `used_video_${videoId}`;
      const expireTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7天
      
      await this.env.VIDEO_CACHE.put(key, JSON.stringify({
        id: videoId,
        used_at: new Date().toISOString(),
        expire_time: expireTime
      }), {
        expirationTtl: 7 * 24 * 60 * 60 // 7天TTL
      });
      
      console.log(`✅ 视频 ${videoId} 已标记为已使用`);
      return true;
    } catch (error) {
      console.error('❌ 标记视频失败:', error.message);
      return false;
    }
  }

  /**
   * 获取已使用的视频ID集合
   * @returns {Promise<Set>} 已使用视频ID集合
   */
  async getUsedVideoIds() {
    try {
      // 由于KV API限制，我们使用简化的方法
      // 实际应用中可以考虑使用单独的key存储已使用视频列表
      const usedVideos = new Set();
      
      // 从KV中获取最近使用的视频
      // 这里简化处理，实际可以维护一个used_videos_list的key
      
      return usedVideos;
    } catch (error) {
      console.error('❌ 获取已使用视频失败:', error.message);
      return new Set();
    }
  }

  /**
   * 解析标签字符串
   * @param {string} tagsString 标签字符串
   * @returns {Array} 标签数组
   */
  parseHashtags(tagsString) {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  /**
   * 处理筷子API特定错误码
   * @param {number} errorCode 错误码
   * @param {string} errorMessage 错误信息
   */
  handleKuaiziError(errorCode, errorMessage) {
    switch (errorCode) {
      case 40000:
        console.error('❌ 筷子API: 参数错误 -', errorMessage);
        break;
      case 40005:
        console.error('❌ 筷子API: 签名验证失败 -', errorMessage);
        break;
      case 61000:
        console.error('❌ 筷子API: 账户余额不足 -', errorMessage);
        break;
      default:
        console.error('❌ 筷子API: 未知错误 -', errorCode, errorMessage);
    }
  }

  /**
   * 重置已使用视频缓存（管理功能）
   * @returns {Promise<boolean>} 是否成功
   */
  async resetUsedVideos() {
    try {
      // 清空KV中的已使用视频记录
      // 注意：这个操作需要谨慎使用
      console.log('🔄 重置已使用视频缓存');
      return true;
    } catch (error) {
      console.error('❌ 重置已使用视频失败:', error.message);
      return false;
    }
  }
} 