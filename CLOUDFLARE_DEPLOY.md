# Cloudflare Workers 部署指南

## 📋 部署前准备

### 1. 环境要求
- Node.js 18+ 
- npm 或 yarn
- Cloudflare 账户
- 已配置的 Kuaizi API 密钥
- 已配置的抖音开放平台应用

### 2. 安装 Wrangler CLI
```bash
npm install -g wrangler
# 或者使用本地安装
npm install wrangler --save-dev
```

### 3. 登录 Cloudflare
```bash
wrangler login
```

## 🚀 部署步骤

### 第一步：安装依赖
```bash
# 安装根目录依赖
npm install

# 进入 worker 目录并安装依赖
cd worker
npm install
```

### 第二步：构建前端资源
```bash
# 在根目录执行
npm run build

# 或者单独构建前端
cd client
npm run build
```

### 第三步：创建 KV 命名空间
```bash
cd worker

# 创建生产环境 KV 命名空间
wrangler kv:namespace create VIDEO_CACHE

# 创建预览环境 KV 命名空间  
wrangler kv:namespace create VIDEO_CACHE --preview
```

记录返回的命名空间 ID，并更新 `wrangler.toml` 中的配置：
```toml
[[kv_namespaces]]
binding = "VIDEO_CACHE"
id = "your-production-kv-id"
preview_id = "your-preview-kv-id"
```

### 第四步：设置环境变量
```bash
# 设置 Kuaizi API 密钥
wrangler secret put KUAIZI_APP_KEY
wrangler secret put KUAIZI_APP_SECRET
wrangler secret put KUAIZI_ACCOUNT_ID

# 设置抖音 API 密钥
wrangler secret put DOUYIN_APP_ID
wrangler secret put DOUYIN_APP_SECRET
```

### 第五步：更新 wrangler.toml 配置
编辑 `worker/wrangler.toml` 文件：
```toml
name = "your-app-name"  # 修改为你的应用名称

[vars]
DOMAIN = "https://your-app-name.your-subdomain.workers.dev"  # 修改为你的域名
```

### 第六步：部署到 Cloudflare Workers
```bash
cd worker

# 预览部署（本地开发）
npm run dev

# 部署到生产环境
npm run deploy

# 或部署到 staging 环境
npm run deploy:staging
```

## 🔧 高级配置

### 自定义域名
1. 在 Cloudflare Dashboard 中添加你的域名
2. 在 Workers & Pages 中绑定自定义域名
3. 更新 `wrangler.toml` 中的 `DOMAIN` 变量

### CORS 配置
编辑 `worker/middleware/cors.js` 中的允许域名列表：
```javascript
const allowedOrigins = [
  'https://your-domain.com',
  'https://your-app.workers.dev'
];
```

### 速率限制调整
编辑 `worker/middleware/rateLimit.js` 中的限制参数：
```javascript
const RATE_LIMIT_WINDOW = 15 * 60; // 时间窗口（秒）
const RATE_LIMIT_MAX_REQUESTS = 100; // 最大请求数
```

## 📊 监控和日志

### 查看实时日志
```bash
cd worker
npm run tail
```

### 查看 Workers 指标
访问 Cloudflare Dashboard > Workers & Pages > 你的应用 > Metrics

### KV 存储管理
```bash
# 查看 KV 中的键
wrangler kv:key list --binding VIDEO_CACHE

# 获取特定键的值
wrangler kv:key get "key_name" --binding VIDEO_CACHE

# 删除键
wrangler kv:key delete "key_name" --binding VIDEO_CACHE
```

## 🧪 测试和调试

### 本地开发
```bash
cd worker
npm run dev
```
访问 `http://localhost:8787` 进行本地测试

### 测试 API 端点
```bash
# 健康检查
curl https://your-app.workers.dev/health

# NFC 跳转测试
curl "https://your-app.workers.dev/api/nfc/redirect?store_id=test123&category=general"

# 获取视频列表
curl "https://your-app.workers.dev/api/nfc/videos?page=1&limit=10"
```

## 📁 项目结构（Workers 版本）

```
worker/
├── index.js              # 主入口文件
├── package.json           # 依赖配置
├── wrangler.toml         # Workers 配置
├── router/
│   └── index.js          # 路由系统
├── handlers/
│   ├── nfc.js            # NFC 处理器
│   ├── kuaizi.js         # Kuaizi API 处理器
│   └── douyin.js         # 抖音处理器
├── services/
│   └── kuaiziService.js  # Kuaizi 服务
├── middleware/
│   ├── cors.js           # CORS 中间件
│   └── rateLimit.js      # 速率限制中间件
└── utils/
    ├── response.js       # 响应工具
    └── validation.js     # 验证工具
```

## 🔒 安全建议

### 1. 环境变量安全
- 使用 `wrangler secret` 命令设置敏感信息
- 不要在代码中硬编码 API 密钥
- 定期轮换 API 密钥

### 2. 速率限制
- 根据实际需求调整速率限制参数
- 监控异常访问模式
- 考虑添加 IP 白名单功能

### 3. CORS 配置
- 只允许必要的域名访问
- 生产环境不使用通配符 `*`
- 定期审查允许的域名列表

## 🚨 故障排除

### 常见问题

#### 1. 部署失败
```bash
# 检查 wrangler 配置
wrangler whoami

# 验证配置文件
wrangler validate
```

#### 2. KV 存储错误
- 确认 KV 命名空间 ID 正确
- 检查 KV 绑定配置
- 验证读写权限

#### 3. API 调用失败
- 检查环境变量设置
- 验证 API 密钥有效性
- 查看 Workers 日志

#### 4. 静态资源 404
- 确认前端构建成功
- 检查 assets 配置
- 验证文件路径

### 日志分析
```bash
# 查看错误日志
wrangler tail --format pretty

# 过滤特定类型日志
wrangler tail --format json | grep "ERROR"
```

## 💰 成本估算

### Cloudflare Workers 定价
- **免费层**：每天 100,000 请求
- **付费层**：$5/月，每月 1000 万请求
- **KV 存储**：免费 1GB，超出 $0.50/GB

### 优化建议
- 使用缓存减少 API 调用
- 合理设置 KV TTL
- 监控请求量和存储使用

## 📞 技术支持

如遇到部署问题，可以：
1. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
2. 访问 [Cloudflare Community](https://community.cloudflare.com/)
3. 联系项目维护者

---

**注意**：首次部署前请仔细阅读本指南，确保所有配置正确。建议先在 staging 环境测试，确认无误后再部署到生产环境。 