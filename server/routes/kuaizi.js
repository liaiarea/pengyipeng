const express = require('express');
const router = express.Router();
const kuaiziService = require('../services/kuaiziService');

/**
 * 获取视频列表
 */
router.get('/videos', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    
    const videos = await kuaiziService.getVideoList({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      used: false
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
    const isConnected = await kuaiziService.checkConnection();
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        connected: isConnected,
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