# 🌐 Cloudflare网页部署指南

## 📋 通过网页界面部署的步骤

### 方法一：直接上传代码（推荐）

#### 1. 打开Cloudflare Workers Dashboard
- 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
- 登录你的账户
- 点击左侧菜单 "Workers 和 Pages"

#### 2. 创建新的Worker
- 点击 "创建应用程序"
- 选择 "创建Worker"
- 输入应用名称（如：`nfc-douyin-video`）
- 点击 "部署"

#### 3. 复制代码
- 进入Worker编辑器
- 删除默认代码
- 复制 `web-deploy-code.js` 文件中的全部代码
- 粘贴到编辑器中
- 点击 "保存并部署"

#### 4. 测试部署
访问你的Worker URL进行测试：
```
https://your-worker-name.your-subdomain.workers.dev
```

### 方法二：GitHub集成自动部署

#### 1. 准备GitHub仓库
- 将项目代码推送到GitHub
- 确保仓库是公开的或你有权限访问

#### 2. 连接GitHub
- 在Cloudflare Dashboard中选择 "连接到Git"
- 授权GitHub访问
- 选择你的仓库

#### 3. 配置构建设置
```
框架预设: 无
构建命令: npm run build
输出目录: client/dist
根目录: /
环境变量: NODE_ENV=production
```

#### 4. 部署设置
- 分支: main
- 自动部署: 开启
- 预览部署: 开启

## 🔧 网页配置步骤

### 1. 设置环境变量
在Worker设置页面添加以下环境变量：

**变量 (Variables):**
- `NODE_ENV`: `production`
- `DOMAIN`: `https://your-worker-name.workers.dev`

**机密 (Secrets):**
- `KUAIZI_APP_KEY`: 你的快子API密钥
- `KUAIZI_APP_SECRET`: 你的快子API秘钥
- `KUAIZI_ACCOUNT_ID`: 你的快子账户ID
- `DOUYIN_APP_ID`: 抖音应用ID
- `DOUYIN_APP_SECRET`: 抖音应用密钥

### 2. 创建KV存储（可选）
如果需要缓存功能：
- 在Workers Dashboard中点击 "KV"
- 创建命名空间: `VIDEO_CACHE`
- 在Worker设置中绑定KV命名空间

### 3. 配置自定义域名（可选）
- 在Worker设置中点击 "触发器"
- 添加自定义域名
- 配置DNS记录

## 📱 NFC标签配置

### NFC标签URL格式
```
https://your-worker-name.workers.dev/api/nfc/redirect?store_id=店铺ID&category=视频分类
```

### 参数说明
- `store_id`: 商户标识（必需）
- `category`: 视频分类（可选）
  - `general`: 通用视频
  - `food`: 美食视频
  - `lifestyle`: 生活视频

### 示例URL
```
https://nfc-douyin-video.workers.dev/api/nfc/redirect?store_id=shop001&category=food
```

## 🧪 测试和验证

### 1. 基础功能测试
```bash
# 健康检查
curl https://your-worker-name.workers.dev/health

# 主页面
curl https://your-worker-name.workers.dev/

# NFC跳转
curl "https://your-worker-name.workers.dev/api/nfc/redirect?store_id=test&category=general"
```

### 2. 移动端测试
- 用手机浏览器访问URL
- 测试视频播放功能
- 测试分享功能
- 测试NFC跳转

### 3. NFC标签测试
- 将URL写入NFC标签
- 用支持NFC的手机测试
- 验证跳转和视频播放

## 📊 监控和维护

### 1. 查看访问日志
- 在Worker Dashboard中点击 "分析"
- 查看请求数量、错误率等指标
- 监控性能数据

### 2. 实时日志
- 在Worker编辑器中点击 "日志"
- 查看实时请求日志
- 调试错误信息

### 3. 性能优化
- 启用缓存策略
- 优化图片和视频资源
- 监控响应时间

## 🔒 安全配置

### 1. 域名限制
在代码中配置允许的域名：
```javascript
const allowedOrigins = [
    'https://your-domain.com',
    'https://your-worker-name.workers.dev'
];
```

### 2. 速率限制
配置API调用频率限制：
```javascript
const RATE_LIMIT = {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 最大请求数
};
```

### 3. 输入验证
确保所有用户输入都经过验证和清理。

## 💡 优化建议

### 1. 缓存策略
- 使用KV存储缓存视频数据
- 设置合适的缓存过期时间
- 缓存热门视频内容

### 2. 性能优化
- 压缩HTML、CSS、JS
- 使用CDN加速静态资源
- 优化图片格式和大小

### 3. 用户体验
- 添加加载动画
- 优化移动端适配
- 提供离线支持

## 🆘 常见问题

### Q: 部署后无法访问
A: 检查Worker名称是否正确，确保已保存并部署代码。

### Q: 视频无法播放
A: 检查视频URL是否有效，确保支持CORS跨域访问。

### Q: NFC跳转失败
A: 检查URL参数格式，确保store_id参数存在。

### Q: 环境变量未生效
A: 确保在Worker设置中正确配置了环境变量，重新部署Worker。

## 📞 技术支持

如遇到问题，请检查：
1. Cloudflare Workers状态页面
2. 浏览器开发者工具控制台
3. Worker实时日志
4. 网络连接状态

---

**部署完成后，你的NFC抖音视频营销工具就可以正常使用了！** 🎉 