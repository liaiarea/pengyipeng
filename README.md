# 🎬 NFC抖音视频营销工具

一个结合NFC技术和抖音SDK的创新营销推广工具，通过碰一碰NFC标签直接发布抖音视频。

## ✨ 项目特色

- 🏷️ **NFC一碰即发** - 用户只需碰一碰NFC标签即可跳转发布视频
- 🤖 **AI智能内容** - 集成Kuaizi OpenAPI，获取AI剪辑好的视频素材
- 📱 **移动端优化** - 专为手机端设计，支持iOS/Android双平台
- 🚀 **即时分享** - 一键跳转抖音应用，无缝发布体验
- 💼 **商家友好** - 为实体商家量身定制的营销推广解决方案

## 🛠️ 技术栈

### 后端
- **Node.js** + **Express** - 服务端框架
- **Kuaizi OpenAPI** - AI视频素材获取
- **抖音开放平台** - 视频分享集成

### 前端
- **Vue.js 3** + **Vite** - 现代前端框架
- **Vant UI** - 移动端组件库
- **PWA** - 渐进式Web应用

### 部署
- **Docker** - 容器化部署
- **HTTPS** - 安全传输协议
- **CDN** - 静态资源加速

## 🚀 快速开始

### 1. 克隆项目
\`\`\`bash
git clone <repository-url>
cd nfc-douyin-video
\`\`\`

### 2. 安装依赖
\`\`\`bash
# 安装所有依赖
npm run install:all
\`\`\`

### 3. 环境配置
复制环境变量模板：
\`\`\`bash
cp env.example .env
\`\`\`

编辑 `.env` 文件，填入你的API配置：
\`\`\`bash
# Kuaizi API配置
KUAIZI_APP_KEY=your_app_key_here
KUAIZI_APP_SECRET=your_app_secret_here

# 抖音开放平台配置
DOUYIN_APP_ID=your_douyin_app_id
DOUYIN_APP_SECRET=your_douyin_app_secret

# 服务器配置
PORT=3000
DOMAIN=http://localhost:3000
\`\`\`

### 4. 启动开发环境
\`\`\`bash
# 同时启动前后端
npm run dev
\`\`\`

访问：
- 前端：http://localhost:5173
- 后端：http://localhost:3000

## 📱 使用流程

### 1. NFC标签配置
使用NFC工具写入URL到标签：
\`\`\`
https://your-domain.com/nfc-redirect?store_id=shop001&category=food
\`\`\`

### 2. 用户体验流程
1. 📱 **用户碰一碰** - 手机靠近NFC标签
2. 🔗 **自动跳转** - 浏览器打开指定页面
3. 🎬 **获取视频** - 系统调用Kuaizi API获取AI视频
4. 👀 **预览确认** - 用户预览视频内容和文案
5. 🎵 **发布抖音** - 一键跳转抖音应用发布

### 3. 支持的URL参数
- `store_id` - 商店标识符
- `category` - 视频分类（food、retail、service等）

## 🔧 API接口

### NFC相关
- `GET /api/nfc/redirect` - NFC跳转处理
- `POST /api/nfc/trigger` - 手动触发视频获取
- `GET /api/nfc/videos` - 获取可用视频列表

### Kuaizi集成
- `GET /api/kuaizi/videos` - 获取视频素材
- `GET /api/kuaizi/test` - 测试API连接

### 抖音集成
- `POST /api/douyin/share-url` - 生成分享链接
- `GET /api/douyin/callback` - 分享回调处理

## 🏗️ 项目结构

\`\`\`
nfc-douyin-video/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # 通用组件
│   │   ├── router/        # 路由配置
│   │   └── services/      # API服务
│   ├── package.json
│   └── vite.config.js
├── server/                # 后端代码
│   ├── routes/           # 路由处理
│   ├── services/         # 业务逻辑
│   ├── middleware/       # 中间件
│   ├── package.json
│   └── index.js
├── .cursorrules          # 开发规则
├── env.example           # 环境变量模板
└── README.md
\`\`\`

## 🔒 安全说明

- ✅ 环境变量管理敏感信息
- ✅ API请求频率限制
- ✅ 用户输入验证和过滤
- ✅ HTTPS安全传输
- ✅ CORS跨域保护

## 📋 API申请指南

### Kuaizi OpenAPI
1. 访问 [Kuaizi开放平台](https://open.kuaizi.ai)
2. 注册账户并实名认证
3. 创建应用获取APP_KEY和APP_SECRET
4. 充值账户余额用于API调用

### 抖音开放平台
1. 访问 [抖音开放平台](https://developer.open-douyin.com)
2. 注册开发者账户
3. 创建移动应用
4. 获取APP_ID和APP_SECRET
5. 配置回调地址

## 🐛 常见问题

### 1. NFC不工作？
- 确保手机支持NFC功能
- iPhone需iOS 11+版本
- Android需开启NFC权限

### 2. 视频获取失败？
- 检查Kuaizi API配置
- 确认账户余额充足
- 查看错误码对照表

### 3. 抖音跳转失败？
- 确保手机已安装抖音应用
- 检查抖音APP_ID配置
- 验证回调地址设置

## 📊 错误码说明

### Kuaizi API错误码
- `40000` - 账户ID验证失败
- `40005` - APP KEY无效
- `61000` - 账户余额不足

### 系统错误码
- `200` - 成功
- `400` - 请求参数错误
- `404` - 资源不存在
- `429` - 请求频率过高
- `500` - 服务器内部错误

## 🚀 部署说明

### Docker部署
\`\`\`bash
# 构建镜像
docker build -t nfc-douyin-video .

# 运行容器
docker run -p 3000:3000 --env-file .env nfc-douyin-video
\`\`\`

### 传统部署
\`\`\`bash
# 构建前端
cd client && npm run build

# 启动后端
cd server && npm start
\`\`\`

## 📞 技术支持

如有问题，请提交Issue或联系开发团队。

## 📄 开源协议

本项目采用 MIT 协议开源。

---

**�� 让营销更简单，让分享更便捷！** 