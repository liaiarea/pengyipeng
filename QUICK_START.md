# 🚀 快速开始指南

## 30秒部署到Cloudflare

### 方法一：一键自动部署 ⚡

```bash
# 1. 克隆项目
git clone https://github.com/your-username/nfc-douyin-video.git
cd nfc-douyin-video

# 2. 一键部署
node deploy-cloudflare.js
```

### 方法二：GitHub Pages集成 🔗

1. **Fork这个仓库** 
   点击右上角Fork按钮

2. **连接Cloudflare**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Workers & Pages → 创建应用程序 → Pages → 连接到Git
   - 选择你Fork的仓库

3. **构建配置**
   ```
   构建命令: npm run build:all
   输出目录: client/dist
   ```

4. **添加环境变量**
   ```
   KUAIZI_APP_KEY=你的快子API密钥
   KUAIZI_APP_SECRET=你的快子API秘钥
   KUAIZI_ACCOUNT_ID=你的快子账户ID
   DOUYIN_APP_ID=抖音应用ID
   DOUYIN_APP_SECRET=抖音应用密钥
   ```

## 🎯 获取API密钥

### 快子API申请
1. 访问 [快子开放平台](https://open.kuaizi.ai)
2. 注册并实名认证
3. 创建应用获取密钥
4. 充值账户余额

### 抖音开放平台
1. 访问 [抖音开放平台](https://developer.open-douyin.com)
2. 注册开发者账户
3. 创建移动应用
4. 获取APP_ID和APP_SECRET

## 📱 配置NFC标签

**URL格式:**
```
https://your-app.pages.dev/api/nfc/redirect?store_id=你的商店ID&category=视频分类
```

**示例:**
```
# 餐厅美食视频
https://your-app.pages.dev/api/nfc/redirect?store_id=restaurant001&category=food

# 商店通用视频  
https://your-app.pages.dev/api/nfc/redirect?store_id=shop001&category=general
```

## ✅ 测试验证

部署成功后，访问这些URL测试：

- **健康检查**: `https://your-app.pages.dev/health`
- **前端页面**: `https://your-app.pages.dev/`
- **NFC测试**: `https://your-app.pages.dev/api/nfc/redirect?store_id=test&category=general`

## 🎉 完成！

现在你的NFC抖音营销工具已经部署完成，用户可以通过NFC标签直接获取和分享视频了！

### 下一步
- 📖 阅读 [完整部署指南](./CLOUDFLARE_GIT_DEPLOY.md)
- 🔧 查看 [API文档](./docs/API.md)
- 💬 加入 [技术支持群](https://discord.gg/yourproject) 