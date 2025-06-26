# 🚀 Cloudflare Workers 部署指南

## 快速部署步骤

### 1. 环境准备
```bash
# 安装Wrangler CLI
npm install -g wrangler

# 登录Cloudflare
wrangler login
```

### 2. 安装项目依赖
```bash
# 安装所有依赖
npm run install:all
```

### 3. 创建KV存储空间
```bash
cd worker

# 创建生产环境KV
wrangler kv:namespace create VIDEO_CACHE

# 创建预览环境KV
wrangler kv:namespace create VIDEO_CACHE --preview
```

**重要：** 复制返回的ID，更新 `wrangler.toml` 文件中的 `id` 和 `preview_id` 字段。

### 4. 设置环境变量
```bash
# Kuaizi API配置
wrangler secret put KUAIZI_APP_KEY
wrangler secret put KUAIZI_APP_SECRET
wrangler secret put KUAIZI_ACCOUNT_ID

# 抖音API配置
wrangler secret put DOUYIN_APP_ID
wrangler secret put DOUYIN_APP_SECRET
```

### 5. 一键部署
```bash
# 部署到生产环境
npm run worker:deploy

# 或部署到测试环境
npm run worker:deploy:staging
```

### 6. 使用部署脚本（推荐）
```bash
# 给脚本执行权限
chmod +x deploy-workers.sh

# 部署到测试环境
./deploy-workers.sh staging

# 部署到生产环境
./deploy-workers.sh production
```

## 📋 部署后验证

### 健康检查
```bash
curl https://your-app-name.workers.dev/health
```

### API测试
```bash
# NFC跳转测试
curl "https://your-app-name.workers.dev/api/nfc/redirect?store_id=test&category=general"

# 获取视频列表
curl "https://your-app-name.workers.dev/api/nfc/videos?page=1&limit=5"
```

## 🔧 配置说明

### wrangler.toml 关键配置
- `name`: Workers应用名称
- `main`: 入口文件路径
- `site.bucket`: 前端静态文件目录
- `kv_namespaces`: KV存储配置

### 环境变量
- `KUAIZI_APP_KEY`: 快子API密钥
- `KUAIZI_APP_SECRET`: 快子API秘钥
- `KUAIZI_ACCOUNT_ID`: 快子账户ID
- `DOUYIN_APP_ID`: 抖音应用ID
- `DOUYIN_APP_SECRET`: 抖音应用密钥

## 🛠️ 常见问题

### 1. KV命名空间创建失败
确保已登录Cloudflare并有Workers权限。

### 2. 静态资源404
检查 `client/dist` 目录是否存在，运行 `npm run build` 构建前端。

### 3. API调用失败
检查环境变量是否正确设置，使用 `wrangler secret list` 查看。

### 4. 部署权限问题
确保Cloudflare账户有Workers权限，检查域名配置。

## 📊 监控和维护

### 查看实时日志
```bash
cd worker
npm run tail
```

### 管理KV存储
```bash
# 查看所有键
wrangler kv:key list --binding VIDEO_CACHE

# 获取特定键值
wrangler kv:key get "key_name" --binding VIDEO_CACHE
```

### 更新应用
```bash
# 更新代码后重新部署
npm run worker:deploy
```

## 🔗 相关链接
- [Cloudflare Workers文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI文档](https://developers.cloudflare.com/workers/wrangler/)
- [项目详细部署文档](./CLOUDFLARE_DEPLOY.md) 