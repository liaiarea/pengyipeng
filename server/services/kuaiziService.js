const axios = require('axios');
const md5 = require('md5');

class KuaiziService {
  constructor() {
    this.baseURL = process.env.KUAIZI_API_BASE || 'https://openapi.kuaizi.co/v2';
    this.appKey = process.env.KUAIZI_APP_KEY;
    this.appSecret = process.env.KUAIZI_APP_SECRET;
    this.usedVideos = new Set();
  }

  generateSign(timestamp) {
    return md5(`${timestamp}#${this.appSecret}`);
  }

  getHeaders() {
    const timestamp = Date.now();
    const sign = this.generateSign(timestamp);
    
    return {
      'AUTH-TIMESTAMP': timestamp,
      'AUTH-SIGN': sign,
      'APP-KEY': this.appKey,
      'Content-Type': 'application/json'
    };
  }

  async getUnusedVideo(params = {}) {
    try {
      console.log('🎯 获取未使用视频:', params);
      
      const response = await axios.post(
        `${this.baseURL}/material/list`,
        {
          type: 'video',
          page: 1,
          size: 10
        },
        {
          headers: this.getHeaders(),
          timeout: 10000
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.message || '获取视频失败');
      }

      let videos = response.data.data.list || [];
      videos = videos.filter(video => !this.usedVideos.has(video.id));

      if (videos.length === 0) {
        return null;
      }

      const selectedVideo = videos[0];
      return {
        id: selectedVideo.id,
        video_url: selectedVideo.url,
        caption: selectedVideo.title || selectedVideo.description,
        hashtags: selectedVideo.tags ? selectedVideo.tags.split(',') : []
      };

    } catch (error) {
      console.error('❌ 获取视频失败:', error.message);
      return null;
    }
  }

  async markVideoAsUsed(videoId) {
    this.usedVideos.add(videoId);
    console.log(`✅ 视频 ${videoId} 已标记为已使用`);
    return true;
  }
}

module.exports = new KuaiziService(); 