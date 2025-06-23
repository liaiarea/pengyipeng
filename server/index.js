require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const nfcRoutes = require('./routes/nfc');
const kuaiziRoutes = require('./routes/kuaizi');
const douyinRoutes = require('./routes/douyin');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());

// 日志中间件
app.use(morgan('combined'));

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.DOMAIN] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求频率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试'
  }
});
app.use(limiter);

// 路由配置
app.use('/api/nfc', nfcRoutes);
app.use('/api/kuaizi', kuaiziRoutes);
app.use('/api/douyin', douyinRoutes);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// 根路径重定向到前端
app.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'NFC抖音视频API服务',
    data: {
      version: '1.0.0',
      endpoints: [
        'GET /api/nfc/redirect - NFC跳转处理',
        'GET /api/nfc/videos - 获取视频列表',
        'POST /api/nfc/trigger - 手动触发',
        'GET /health - 健康检查'
      ]
    }
  });
});

// 处理前端路由 - 重定向 /nfc-redirect 到 API
app.get('/nfc-redirect', (req, res) => {
  const queryString = new URLSearchParams(req.query).toString();
  const redirectUrl = `/api/nfc/redirect${queryString ? '?' + queryString : ''}`;
  res.redirect(redirectUrl);
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: null
  });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📱 环境: ${process.env.NODE_ENV}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
}); 