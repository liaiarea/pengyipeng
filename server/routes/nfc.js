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
    
    // 根据错误类型返回不同页面
    let errorMsg = '获取视频失败，请重试';
    if (error.message.includes('余额不足')) {
      errorMsg = '账户余额不足，请联系管理员';
    } else if (error.message.includes('签名验证失败')) {
      errorMsg = 'API配置错误，请联系技术支持';
    }
    
    res.redirect('/error?msg=' + encodeURIComponent(errorMsg));
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
    appKey: process.env.DOUYIN_APP_ID || 'default_app_id',
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
    
    // 使用新的getMaterialList方法
    const materialData = await kuaiziService.getMaterialList({
      type: 'video',
      page: parseInt(page),
      size: parseInt(limit),
      category: category || ''
    });

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: materialData.list || [],
        total: materialData.total || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('获取视频列表失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取视频列表失败',
      data: null
    });
  }
});

/**
 * 获取素材统计信息（替代账户余额检查）
 */
router.get('/account', async (req, res) => {
  try {
    // 获取素材统计信息作为账户状态检查
    const materialData = await kuaiziService.getMaterialList({
      type: 'video',
      page: 1,
      size: 1
    });
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        total_materials: materialData.total,
        status: 'active',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('获取账户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取账户信息失败',
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
    
    let code = 500;
    let message = '服务器错误';
    
    if (error.message.includes('余额不足')) {
      code = 402;
      message = '账户余额不足';
    } else if (error.message.includes('签名验证失败')) {
      code = 401;
      message = 'API认证失败';
    }
    
    res.status(code >= 500 ? 500 : 400).json({
      code,
      message: error.message || message,
      data: null
    });
  }
});

/**
 * 重置已使用视频列表（仅用于开发测试）
 */
router.post('/reset-used', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      code: 403,
      message: '仅开发环境可用',
      data: null
    });
  }
  
  kuaiziService.resetUsedVideos();
  
  res.json({
    code: 200,
    message: '已重置使用记录',
    data: null
  });
});

module.exports = router; 