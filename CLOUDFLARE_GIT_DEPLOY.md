# 🚀 Cloudflare Git部署完整指南

基于[Cloudflare Workers文档](https://developers.cloudflare.com/workers/)和[Vue框架指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/vue/)，项目已完全重构为支持Git集成部署。

## 📋 项目结构调整

项目已重构为Cloudflare Workers + Static Assets架构：

```
📁 项目根目录/
├── 📄 wrangler.toml          # Cloudflare Workers配置
├── 📄 package.json           # 根项目配置
├── 📁 client/                # Vue前端应用
│   ├── 📄 package.json       # 前端依赖
│   ├── 📄 vite.config.js     # Vite配置
│   └── 📁 src/               # Vue源码
├── 📁 server/                # Workers后端
│   ├── 📄 index.js           # Workers入口文件
│   ├── 📁 routes/            # API路由
│   ├── 📁 middleware/        # 中间件
│   ├── 📁 services/          # 业务服务
│   └── 📁 utils/             # 工具函数
└── 📁 docs/                  # 部署文档
```

## 🔧 核心配置文件

### 1. wrangler.toml
```toml
name = "nfc-douyin-video"
main = "./server/index.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# 静态资源配置
[assets]
directory = "./client/dist"
not_found_handling = "single_page_application"
html_handling = "auto"

# 环境变量
[vars]
NODE_ENV = "production"
API_VERSION = "v1"

# KV存储
[[kv_namespaces]]
binding = "VIDEO_CACHE"
id = ""  # 需要创建后填入
preview_id = ""

# 构建配置
[build]
command = "npm run build:all"
```

### 2. package.json (根目录)
包含完整的构建和部署脚本：
- `build:all` - 完整构建流程
- `deploy` - 部署到生产环境
- `deploy:staging` - 部署到测试环境

## 🌐 Git部署方式

### 方式一：GitHub集成 (推荐)

#### 1. 准备GitHub仓库
```bash
# 提交所有更改
git add .
git commit -m "重构项目支持Cloudflare Workers + Static Assets"
git push origin main
```

#### 2. Cloudflare Dashboard设置
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择 "Workers & Pages" → "创建应用程序"
3. 选择 "Pages" → "连接到Git"
4. 选择你的GitHub仓库

#### 3. 构建配置
```
框架预设: 无 (None)
构建命令: npm run build:all
输出目录: client/dist
根目录: /
Node.js版本: 18
```

#### 4. 环境变量设置
在Pages设置中添加：
```
NODE_ENV=production
KUAIZI_APP_KEY=你的快子API密钥
KUAIZI_APP_SECRET=你的快子API秘钥
KUAIZI_ACCOUNT_ID=你的快子账户ID
DOUYIN_APP_ID=抖音应用ID
DOUYIN_APP_SECRET=抖音应用密钥
```

#### 5. Functions配置
在Pages设置中：
- 兼容性日期: 2024-01-01
- 兼容性标志: nodejs_compat

### 方式二：Wrangler CLI部署

#### 1. 安装依赖
```bash
npm run install:deps
```

#### 2. 登录Cloudflare
```bash
npm run cf:login
```

#### 3. 创建KV命名空间
```bash
npm run kv:create
```
复制返回的ID，更新`wrangler.toml`中的相应字段。

#### 4. 设置环境变量
```bash
npm run secrets:set
```

#### 5. 部署
```bash
# 部署到生产环境
npm run deploy

# 或部署到测试环境
npm run deploy:staging
```

## 🏗️ 项目架构特点

### 1. 混合部署架构
- **静态资源**: Vue SPA通过Cloudflare CDN提供
- **API后端**: Cloudflare Workers处理动态请求
- **路由分离**: `/api/*` 由Workers处理，其他由静态资源处理

### 2. ES模块支持
- 全面使用ES6+ import/export语法
- 兼容Cloudflare Workers运行时
- 支持现代JavaScript特性

### 3. 自动路由处理
- SPA路由: 自动回退到index.html
- API路由: Workers智能路由分发
- NFC跳转: 无缝重定向处理

### 4. 生产级特性
- **CORS处理**: 完整的跨域支持
- **速率限制**: KV存储实现的智能限流
- **错误处理**: 统一的错误响应格式
- **缓存策略**: 边缘缓存优化

## 🧪 部署后测试

### 1. 基础功能测试
```bash
# 健康检查
curl https://your-app.pages.dev/health

# API测试
curl https://your-app.pages.dev/api

# NFC跳转测试
curl "https://your-app.pages.dev/api/nfc/redirect?store_id=test&category=general"
```

### 2. 前端页面测试
- 主页: https://your-app.pages.dev/
- NFC跳转页面访问
- 移动端兼容性测试
- 视频播放功能测试

### 3. 完整流程测试
1. NFC标签写入URL
2. 手机NFC碰触测试
3. 视频获取和展示
4. 抖音分享功能

## 📱 NFC标签配置

### URL格式
```
https://your-app.pages.dev/api/nfc/redirect?store_id=商户ID&category=视频分类
```

### 支持的分类
- `general`: 通用视频
- `food`: 美食类视频
- `lifestyle`: 生活类视频
- `product`: 产品展示
- `service`: 服务介绍

### 示例配置
```
# 餐厅美食视频
https://your-app.pages.dev/api/nfc/redirect?store_id=restaurant001&category=food

# 商店通用视频
https://your-app.pages.dev/api/nfc/redirect?store_id=shop001&category=general
```

## 🔧 环境变量说明

### 必需变量
- `KUAIZI_APP_KEY`: 快子API应用密钥
- `KUAIZI_APP_SECRET`: 快子API应用秘钥
- `KUAIZI_ACCOUNT_ID`: 快子账户ID
- `DOUYIN_APP_ID`: 抖音开放平台应用ID
- `DOUYIN_APP_SECRET`: 抖音开放平台应用密钥

### 可选变量
- `NODE_ENV`: 运行环境 (production/staging/development)
- `API_VERSION`: API版本标识
- `DOMAIN`: 自定义域名 (用于回调URL)

## 🚀 生产部署清单

### 部署前检查
- [ ] GitHub仓库已更新
- [ ] 环境变量已配置
- [ ] KV命名空间已创建
- [ ] 域名DNS已解析

### 部署后验证
- [ ] 健康检查通过
- [ ] 前端页面正常加载
- [ ] API接口响应正常
- [ ] NFC跳转功能正常
- [ ] 视频获取和播放正常
- [ ] 抖音分享功能正常

### 监控配置
- [ ] Cloudflare Analytics已启用
- [ ] Workers日志监控已配置
- [ ] 错误告警已设置
- [ ] 性能指标监控已启用

## 🎯 优势特点

- ✅ **零服务器运维**: 完全Serverless架构
- ✅ **全球CDN加速**: Cloudflare边缘网络
- ✅ **自动扩容**: 按需弹性扩展
- ✅ **极低延迟**: 边缘计算优化
- ✅ **成本优化**: 按使用量付费
- ✅ **高可用性**: 99.99%+ SLA保证
- ✅ **开发友好**: Git集成自动部署

## 📞 技术支持

### 常见问题
1. **构建失败**: 检查Node.js版本和依赖
2. **API调用失败**: 验证环境变量配置
3. **视频获取失败**: 检查快子API配置
4. **NFC跳转异常**: 验证URL格式和参数

### 获取帮助
- [Cloudflare Workers文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Community](https://community.cloudflare.com/)
- 项目Issue提交

---

**🎉 部署完成后，你的NFC抖音视频营销工具将具备企业级的性能和可靠性！** 