#!/bin/bash

# Cloudflare Workers 一键部署脚本
# 使用方法: ./deploy-workers.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
echo "🚀 开始部署到 $ENVIRONMENT 环境..."

# 检查必要工具
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装，请先运行: npm install -g wrangler"
    exit 1
fi

# 检查登录状态
if ! wrangler whoami &> /dev/null; then
    echo "❌ 请先登录 Cloudflare: wrangler login"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm run install:all

# 构建前端
echo "🏗️ 构建前端资源..."
npm run build

# 进入 worker 目录
cd worker

# 检查配置文件
if [ ! -f "wrangler.toml" ]; then
    echo "❌ 未找到 wrangler.toml 配置文件"
    exit 1
fi

# 检查环境变量
echo "🔍 检查环境变量..."
REQUIRED_SECRETS=(
    "KUAIZI_APP_KEY"
    "KUAIZI_APP_SECRET" 
    "KUAIZI_ACCOUNT_ID"
    "DOUYIN_APP_ID"
    "DOUYIN_APP_SECRET"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
    if ! wrangler secret list | grep -q "$secret"; then
        echo "⚠️  环境变量 $secret 未设置"
        echo "请运行: wrangler secret put $secret"
    fi
done

# 检查 KV 命名空间
echo "🗄️ 检查 KV 命名空间..."
if ! wrangler kv:namespace list | grep -q "VIDEO_CACHE"; then
    echo "⚠️  KV 命名空间可能未创建，请运行:"
    echo "wrangler kv:namespace create VIDEO_CACHE"
    echo "wrangler kv:namespace create VIDEO_CACHE --preview"
fi

# 部署
echo "🚀 部署到 $ENVIRONMENT..."
if [ "$ENVIRONMENT" = "production" ]; then
    npm run deploy
elif [ "$ENVIRONMENT" = "staging" ]; then
    npm run deploy:staging
else
    echo "❌ 无效的环境: $ENVIRONMENT (支持: staging, production)"
    exit 1
fi

echo "✅ 部署完成！"

# 显示部署信息
echo ""
echo "📊 部署信息:"
echo "环境: $ENVIRONMENT"
echo "时间: $(date)"

# 获取部署 URL
APP_NAME=$(grep "^name" wrangler.toml | sed 's/name = "\(.*\)"/\1/')
if [ "$ENVIRONMENT" = "production" ]; then
    DEPLOY_URL="https://$APP_NAME.workers.dev"
else
    DEPLOY_URL="https://$APP_NAME-staging.workers.dev"
fi

echo "访问地址: $DEPLOY_URL"
echo ""

# 测试部署
echo "🧪 测试部署..."
if curl -f -s "$DEPLOY_URL/health" > /dev/null; then
    echo "✅ 健康检查通过"
else
    echo "❌ 健康检查失败，请检查部署状态"
fi

echo ""
echo "🎉 部署流程完成！"
echo ""
echo "📋 后续步骤:"
echo "1. 访问 $DEPLOY_URL 测试应用"
echo "2. 查看实时日志: cd worker && npm run tail"
echo "3. 监控 Workers 指标: https://dash.cloudflare.com"
echo "" 