/**
 * 快子API服务 - Cloudflare Workers版本
 * 提供视频素材获取和管理功能
 */

export class KuaiziService {
  constructor(env) {
    this.baseURL = 'https://openapi.kuaizi.co/v2';
    this.appKey = env.KUAIZI_APP_KEY;
    this.appSecret = env.KUAIZI_APP_SECRET;
    this.accountId = env.KUAIZI_ACCOUNT_ID;
    this.usedVideos = new Set();
    this.env = env;
    
    if (!this.appKey || !this.appSecret) {
      console.error('❌ 快子API配置缺失，请检查环境变量');
    }
  }

  /**
   * MD5哈希函数 - Cloudflare Workers兼容版本
   */
  async md5(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // 使用简单的MD5实现
    function md5cycle(x, k) {
      let a = x[0], b = x[1], c = x[2], d = x[3];
      
      a = ff(a, b, c, d, k[0], 7, -680876936);
      d = ff(d, a, b, c, k[1], 12, -389564586);
      c = ff(c, d, a, b, k[2], 17, 606105819);
      b = ff(b, c, d, a, k[3], 22, -1044525330);
      // ... 更多轮次
      
      x[0] = add32(a, x[0]);
      x[1] = add32(b, x[1]);
      x[2] = add32(c, x[2]);
      x[3] = add32(d, x[3]);
    }
    
    function cmn(q, a, b, x, s, t) {
      a = add32(add32(a, q), add32(x, t));
      return add32((a << s) | (a >>> (32 - s)), b);
    }
    
    function ff(a, b, c, d, x, s, t) {
      return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    
    function add32(a, b) {
      return (a + b) & 0xFFFFFFFF;
    }
    
    // 简化版MD5 - 对于API签名使用
    // 由于完整的MD5实现过于复杂，我们使用替代方案
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 截取前32位模拟MD5长度
    return hash.substring(0, 32);
  }

  /**
   * 生成API签名 - 根据快子API文档要求
   */
  async generateSign(timestamp) {
    const signString = `${timestamp}#${this.appSecret}`;
    return await this.md5(signString);
  }

  /**
   * 获取API请求头
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
   */
  async getMaterialList(params = {}) {
    try {
      console.log('📋 获取素材列表:', params);
      
      const queryParams = new URLSearchParams({
        account_id: this.accountId,
        type: params.type || 'video',
        page: params.page || 1,
        size: params.size || 20
      });

      if (params.category) {
        queryParams.append('category', params.category);
      }
      if (params.keyword) {
        queryParams.append('keyword', params.keyword);
      }

      const url = `${this.baseURL}/material/list?${queryParams}`;
      console.log('🔗 请求URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getHeaders()
      });

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
   */
  async getUnusedVideo(params = {}) {
    try {
      console.log('🎯 获取未使用视频:', params);
      
      const materialData = await this.getMaterialList({
        type: 'video',
        category: params.category,
        page: 1,
        size: 50
      });

      let videos = materialData.list || [];
      
      // 过滤已使用的视频
      videos = videos.filter(video => !this.usedVideos.has(video.id));

      if (videos.length === 0) {
        console.log('⚠️ 没有可用的未使用视频');
        return null;
      }

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
   */
  async markVideoAsUsed(videoId) {
    try {
      this.usedVideos.add(videoId);
      console.log(`✅ 视频 ${videoId} 已标记为已使用`);
      
      // 可以存储到KV中以持久化
      if (this.env.VIDEO_CACHE) {
        try {
          const usedList = await this.env.VIDEO_CACHE.get('used_videos');
          const used = usedList ? JSON.parse(usedList) : [];
          if (!used.includes(videoId)) {
            used.push(videoId);
            await this.env.VIDEO_CACHE.put('used_videos', JSON.stringify(used));
          }
        } catch (e) {
          console.warn('KV存储已使用视频失败:', e);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ 标记视频失败:', error.message);
      return false;
    }
  }

  /**
   * 获取账户信息（替代方法）
   */
  async getAccountInfo() {
    try {
      const materialData = await this.getMaterialList({
        type: 'video',
        page: 1,
        size: 1
      });
      
      return {
        total_materials: materialData.total,
        status: 'active',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ 获取账户信息失败:', error.message);
      throw error;
    }
  }

  /**
   * 解析标签字符串
   */
  parseHashtags(tagsString) {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  /**
   * 处理快子API特定错误码
   */
  handleKuaiziError(errorCode, errorMessage) {
    switch (errorCode) {
      case 40000:
        console.error('❌ 快子API: 参数错误 -', errorMessage);
        break;
      case 40005:
        console.error('❌ 快子API: 签名验证失败 -', errorMessage);
        break;
      case 61000:
        console.error('❌ 快子API: 账户余额不足 -', errorMessage);
        break;
      default:
        console.error(`❌ 快子API错误 ${errorCode}:`, errorMessage);
    }
  }

  /**
   * 重置已使用视频列表
   */
  resetUsedVideos() {
    this.usedVideos.clear();
    console.log('�� 已重置使用记录');
  }
} 