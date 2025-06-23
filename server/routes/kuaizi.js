const express = require('express');
const router = express.Router();
const kuaiziService = require('../services/kuaiziService');

/**
 * 获取视频列表
 */
router.get('/videos', async (req, res) => {
  try {
    const { page = 1, size = 10, category } = req.query;
    
    const videos = await kuaiziService.getMaterialList({
      type: 'video',
      page: parseInt(page),
      size: parseInt(size),
      category
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
 * 测试API连接
 */
router.get('/test', async (req, res) => {
  try {
    // 通过获取少量数据来测试连接
    const testData = await kuaiziService.getMaterialList({
      type: 'video',
      page: 1,
      size: 1
    });
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        connected: true,
        total_videos: testData.total,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    res.status(500).json({
      code: 500,
      message: 'API连接测试失败',
      data: null
    });
  }
});

module.exports = router; 