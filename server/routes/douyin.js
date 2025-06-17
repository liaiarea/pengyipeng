const express = require('express');
const router = express.Router();

/**
 * 抖音分享回调处理
 */
router.get('/callback', (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    console.log('🔄 抖音分享回调:', { code, state, error });

    if (error) {
      console.error('❌ 抖音分享失败:', error);
      return res.redirect('/share-failed');
    }

    if (code) {
      console.log('✅ 抖音分享成功');
      return res.redirect('/share-success');
    }

    res.redirect('/');
  } catch (error) {
    console.error('❌ 抖音回调处理失败:', error);
    res.redirect('/error');
  }
});

/**
 * 获取抖音分享链接
 */
router.post('/share-url', async (req, res) => {
  try {
    const { video_url, caption, hashtags } = req.body;

    if (!video_url) {
      return res.status(400).json({
        code: 400,
        message: '视频链接不能为空',
        data: null
      });
    }

    // 生成抖音分享链接
    const shareUrl = `snssdk1128://platformapi/startapp?appKey=${process.env.DOUYIN_APP_ID}&videoPath=${encodeURIComponent(video_url)}&caption=${encodeURIComponent(caption || '')}&hashtags=${encodeURIComponent(hashtags || '')}`;

    res.json({
      code: 200,
      message: 'success',
      data: {
        share_url: shareUrl,
        video_url,
        caption,
        hashtags
      }
    });

  } catch (error) {
    console.error('❌ 生成抖音分享链接失败:', error);
    res.status(500).json({
      code: 500,
      message: '生成分享链接失败',
      data: null
    });
  }
});

module.exports = router; 