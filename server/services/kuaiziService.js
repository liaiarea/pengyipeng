const axios = require('axios');
const crypto = require('crypto');

class KuaiziService {
  constructor() {
    this.baseURL = process.env.KUAIZI_API_BASE || 'https://openapi.kuaizi.co/v2';
    this.appKey = process.env.KUAIZI_APP_KEY;
    this.appSecret = process.env.KUAIZI_APP_SECRET;
    this.accountId = process.env.KUAIZI_ACCOUNT_ID;
    this.usedVideos = new Set();
    
    if (!this.appKey || !this.appSecret) {
      console.error('❌ 筷子API配置缺失，请检查环境变量');
    }
  }

  /**
   * 生成API签名 - 根据筷子API文档要求
   * @param {number} timestamp 时间戳
   * @returns {string} MD5签名
   */
  generateSign(timestamp) {
    // 根据筷子API文档：timestamp + "#" + app_secret 进行MD5加密
    const signString = `${timestamp}#${this.appSecret}`;
    return crypto.createHash('md5').update(signString).digest('hex');
  }

  /**
   * 获取API请求头
   * @returns {Object} 请求头对象
   */
  getHeaders() {
    const timestamp = Date.now();
    const sign = this.generateSign(timestamp);
    
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
   * @returns {Promise<Array>} 素材列表
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

      const response = await axios.get(url, {
        headers: this.getHeaders(),
        timeout: 15000
      });

      if (response.data.code === 200) {
        const materialData = response.data.data;
        console.log('✅ 获取素材成功:', {
          total: materialData.total,
          page: materialData.page,
          page_size: materialData.page_size,
          count: materialData.list?.length || 0
        });
        return materialData;
      } else {
        // 处理筷子API特定错误码
        this.handleKuaiziError(response.data.code, response.data.message);
        throw new Error(response.data.message || '获取素材列表失败');
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
      
      // 直接获取视频素材列表（移除账户余额检查，因为API不支持）
      const materialData = await this.getMaterialList({
        type: 'video',
        category: params.category,
        page: 1,
        size: 50 // 获取更多素材以便筛选
      });

      let videos = materialData.list || [];
      
      // 过滤已使用的视频
      videos = videos.filter(video => !this.usedVideos.has(video.id));

      if (videos.length === 0) {
        console.log('⚠️ 没有可用的未使用视频');
        return null;
      }

      // 选择第一个可用视频
      const selectedVideo = videos[0];
      
      return {
        id: selectedVideo.id,
        video_url: selectedVideo.file?.url || '', // 正确的URL字段
        cover_url: selectedVideo.file?.thumb_url || '', // 正确的缩略图字段
        caption: selectedVideo.name || selectedVideo.note || '精彩视频内容', // 使用name作为标题
        hashtags: this.parseHashtags(selectedVideo.tags || ''), // tags可能不存在
        duration: selectedVideo.file?.file_info?.play_time || 0, // 正确的时长字段
        size: selectedVideo.file?.size || 0, // 正确的文件大小字段
        // 额外的有用信息
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
      this.usedVideos.add(videoId);
      console.log(`✅ 视频 ${videoId} 已标记为已使用`);
      
      // 如果需要，可以调用API记录使用状态
      // const response = await axios.post(`${this.baseURL}/material/use`, { id: videoId }, { headers: this.getHeaders() });
      
      return true;
    } catch (error) {
      console.error('❌ 标记视频失败:', error.message);
      return false;
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
      case 50000:
        console.error('❌ 筷子API: 服务器内部错误 -', errorMessage);
        break;
      default:
        console.error(`❌ 筷子API错误 [${errorCode}]:`, errorMessage);
    }
  }

  /**
   * 重置已使用视频列表（用于测试）
   */
  resetUsedVideos() {
    this.usedVideos.clear();
    console.log('🔄 已重置使用记录');
  }
}

module.exports = new KuaiziService(); 