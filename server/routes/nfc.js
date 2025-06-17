const express = require('express');
const router = express.Router();
const kuaiziService = require('../services/kuaiziService');
const { body, validationResult } = require('express-validator');

/**
 * NFC跳转主处理函数
 * 当用户通过NFC碰一碰时，会访问这个接口
 */
router.get('/redirect', async (req, res) => {
  try {
    const { store_id, category } = req.query;
    
    console.log('🔍 NFC跳转请求:', { store_id, category, ip: req.ip });

    // 获取用户设备信息
    const userAgent = req.get('User-Agent') || '';
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isMobile = isIOS || isAndroid;

    // 移动端设备检测
    if (!isMobile) {
      return res.redirect('/mobile-required');
    }

    // 获取Kuaizi API中的视频
    const videoData = await kuaiziService.getUnusedVideo({
      store_id,
      category: category || 'general'
    });

    if (!videoData) {
      console.error('❌ 没有可用的视频素材');
      return res.redirect('/no-video-available');
    }

    // 标记视频为已使用
    await kuaiziService.markVideoAsUsed(videoData.id);

    // 生成抖音跳转链接
    const douyinUrl = generateDouyinUrl(videoData, isIOS);
    
    console.log('✅ 生成抖音跳转链接:', douyinUrl);

    // 重定向到抖音应用
    res.redirect(douyinUrl);

  } catch (error) {
    console.error('❌ NFC跳转处理失败:', error);
    
    // 返回错误页面
    res.redirect('/error?msg=' + encodeURIComponent('获取视频失败，请重试'));
  }
});

/**
 * 生成抖音跳转URL
 * @param {Object} videoData - 视频数据
 * @param {boolean} isIOS - 是否为iOS设备 
 */
function generateDouyinUrl(videoData, isIOS) {
  const baseUrl = isIOS 
    ? 'snssdk1128://platformapi/startapp' // iOS抖音scheme
    : 'snssdk1128://platformapi/startapp'; // Android抖音scheme

  const params = new URLSearchParams({
    appKey: process.env.DOUYIN_APP_ID,
    videoPath: videoData.video_url,
    caption: videoData.caption || '',
    hashtags: videoData.hashtags ? videoData.hashtags.join(',') : '',
    // 添加回调参数
    callback: `${process.env.DOMAIN}/api/douyin/callback`
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * 获取可用视频列表接口
 * 用于前端展示或管理
 */
router.get('/videos', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    
    const videos = await kuaiziService.getVideoList({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      used: false // 只获取未使用的视频
    });

    res.json({
      code: 200,
      message: 'success',
      data: videos
    });

  } catch (error) {
    console.error('获取视频列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取视频列表失败',
      data: null
    });
  }
});

/**
 * 手动触发视频获取（用于测试）
 */
router.post('/trigger', [
  body('store_id').notEmpty().withMessage('商店ID不能为空'),
  body('category').optional().isString()
], async (req, res) => {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: '参数验证失败',
        data: errors.array()
      });
    }

    const { store_id, category } = req.body;

    // 获取视频数据
    const videoData = await kuaiziService.getUnusedVideo({
      store_id,
      category: category || 'general'
    });

    if (!videoData) {
      return res.json({
        code: 404,
        message: '暂无可用视频',
        data: null
      });
    }

    res.json({
      code: 200,
      message: 'success',
      data: {
        video: videoData,
        douyin_url_ios: generateDouyinUrl(videoData, true),
        douyin_url_android: generateDouyinUrl(videoData, false)
      }
    });

  } catch (error) {
    console.error('手动触发失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

module.exports = router; 