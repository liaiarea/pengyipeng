/**
 * 快子API服务 - Cloudflare Workers版本
 * 提供视频素材获取和管理功能
 */

import { md5 } from '../utils/md5.js';

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
    } else {
      console.log('✅ 快子API配置已加载:', {
        appKey: this.appKey,
        appSecret: this.appSecret.substring(0, 10) + '...',
        accountId: this.accountId
      });
    }
  }

  /**
   * 生成API签名 - 根据快子API文档要求
   */
  generateSign(timestamp) {
    const signString = `${timestamp}#${this.appSecret}`;
    console.log('🔐 签名字符串:', signString);
    const sign = md5(signString);
    console.log('🔑 生成签名:', sign);
    return sign;
  }

  /**
   * 获取API请求头
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
        headers: this.getHeaders()
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
   * 获取随机视频
   */
  async getRandomVideo(params = {}) {
    try {
      console.log('🎯 获取随机视频:', params);
      
      // 随机选择页码（前100页）
      const randomPage = Math.floor(Math.random() * 100) + 1;
      
      const materialData = await this.getMaterialList({
        type: 'video',
        category: params.category,
        page: randomPage,
        size: 20
      });

      let videos = materialData.list || [];
      
      if (videos.length === 0) {
        console.log('⚠️ 没有可用的视频');
        return null;
      }

      // 随机选择一个视频
      const randomIndex = Math.floor(Math.random() * videos.length);
      const selectedVideo = videos[randomIndex];
      
      console.log('🎬 选中视频:', {
        id: selectedVideo.id,
        name: selectedVideo.name,
        duration: selectedVideo.file?.file_info?.play_time || 0
      });
      
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
      console.error('❌ 获取随机视频失败:', error.message);
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
        } catch (kvError) {
          console.warn('⚠️ KV存储失败:', kvError.message);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ 标记视频失败:', error.message);
      return false;
    }
  }

  /**
   * 获取账户信息
   */
  async getAccountInfo() {
    try {
      const url = `${this.baseURL}/account/info`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (data.code === 200) {
        console.log('✅ 获取账户信息成功:', data.data);
        return data.data;
      } else {
        this.handleKuaiziError(data.code, data.message);
        throw new Error(data.message || '获取账户信息失败');
      }
    } catch (error) {
      console.error('❌ 获取账户信息失败:', error.message);
      throw error;
    }
  }

  /**
   * 解析标签
   */
  parseHashtags(tagsString) {
    if (!tagsString) return [];
    return tagsString.split(/[,，\s]+/).filter(tag => tag.trim().length > 0);
  }

  /**
   * 处理快子API错误码
   */
  handleKuaiziError(errorCode, errorMessage) {
    const errorMap = {
      40000: '余额不足，请充值后再试',
      40005: '视频生成中，请稍后再试',
      61000: '账户被冻结，请联系客服',
      4002: 'API认证失败，请检查密钥配置',
      4003: 'APP-KEY不存在，请检查配置'
    };
    
    const friendlyMessage = errorMap[errorCode] || errorMessage;
    console.error(`❌ 快子API错误 [${errorCode}]: ${friendlyMessage}`);
  }

  /**
   * 重置已使用视频记录
   */
  resetUsedVideos() {
    this.usedVideos.clear();
    console.log('�� 已重置视频使用记录');
  }
} 