#!/usr/bin/env node

/**
 * Cloudflare自动化部署脚本
 * 使用方法: node deploy-cloudflare.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 NFC抖音视频 - Cloudflare自动化部署脚本');
console.log('================================================');

// 检查必要文件
function checkFiles() {
  const requiredFiles = [
    'wrangler.toml',
    'package.json',
    'client/package.json',
    'server/index.js'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ 缺少必要文件: ${file}`);
      process.exit(1);
    }
  }
  
  console.log('✅ 项目文件检查通过');
}

// 安装依赖
function installDependencies() {
  console.log('📦 安装项目依赖...');
  
  try {
    execSync('npm run install:deps', { stdio: 'inherit' });
    console.log('✅ 依赖安装完成');
  } catch (error) {
    console.error('❌ 依赖安装失败:', error.message);
    process.exit(1);
  }
}

// 构建项目
function buildProject() {
  console.log('🔨 构建项目...');
  
  try {
    execSync('npm run build:all', { stdio: 'inherit' });
    console.log('✅ 项目构建完成');
  } catch (error) {
    console.error('❌ 项目构建失败:', error.message);
    process.exit(1);
  }
}

// 检查Wrangler登录状态
function checkWranglerAuth() {
  console.log('🔐 检查Cloudflare认证状态...');
  
  try {
    execSync('npx wrangler whoami', { stdio: 'pipe' });
    console.log('✅ Cloudflare认证有效');
    return true;
  } catch (error) {
    console.log('⚠️  需要登录Cloudflare账户');
    return false;
  }
}

// 登录Cloudflare
function loginCloudflare() {
  console.log('🔑 登录Cloudflare...');
  
  try {
    execSync('npx wrangler login', { stdio: 'inherit' });
    console.log('✅ Cloudflare登录成功');
  } catch (error) {
    console.error('❌ Cloudflare登录失败:', error.message);
    process.exit(1);
  }
}

// 创建KV命名空间
function createKVNamespace() {
  console.log('💾 创建KV存储命名空间...');
  
  try {
    const result = execSync('npx wrangler kv:namespace create VIDEO_CACHE', { encoding: 'utf8' });
    console.log('KV命名空间创建结果:', result);
    
    const previewResult = execSync('npx wrangler kv:namespace create VIDEO_CACHE --preview', { encoding: 'utf8' });
    console.log('KV预览命名空间创建结果:', previewResult);
    
    console.log('⚠️  请将上述ID更新到wrangler.toml配置文件中');
    console.log('✅ KV命名空间创建完成');
  } catch (error) {
    console.warn('⚠️  KV命名空间可能已存在:', error.message);
  }
}

// 部署到Cloudflare
function deployToCloudflare(env = 'production') {
  console.log(`🚀 部署到Cloudflare (${env})...`);
  
  try {
    const command = env === 'staging' ? 'npm run deploy:staging' : 'npm run deploy';
    execSync(command, { stdio: 'inherit' });
    console.log('✅ 部署成功！');
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    process.exit(1);
  }
}

// 显示部署结果
function showDeploymentInfo() {
  console.log('\n🎉 部署完成！');
  console.log('================================================');
  console.log('📝 后续配置步骤:');
  console.log('1. 在Cloudflare Dashboard中配置环境变量:');
  console.log('   - KUAIZI_APP_KEY');
  console.log('   - KUAIZI_APP_SECRET');
  console.log('   - KUAIZI_ACCOUNT_ID');
  console.log('   - DOUYIN_APP_ID');
  console.log('   - DOUYIN_APP_SECRET');
  console.log('\n2. 更新wrangler.toml中的KV命名空间ID');
  console.log('\n3. 测试部署结果:');
  console.log('   访问: https://你的应用.workers.dev/health');
  console.log('\n📚 详细文档: ./CLOUDFLARE_GIT_DEPLOY.md');
}

// 主函数
async function main() {
  try {
    // 1. 检查文件
    checkFiles();
    
    // 2. 安装依赖
    installDependencies();
    
    // 3. 构建项目
    buildProject();
    
    // 4. 检查认证
    if (!checkWranglerAuth()) {
      loginCloudflare();
    }
    
    // 5. 创建KV命名空间
    createKVNamespace();
    
    // 6. 部署
    const env = process.argv[2] || 'production';
    deployToCloudflare(env);
    
    // 7. 显示结果
    showDeploymentInfo();
    
  } catch (error) {
    console.error('\n❌ 部署过程出现错误:', error.message);
    console.log('\n📞 获取帮助:');
    console.log('- 查看详细文档: ./CLOUDFLARE_GIT_DEPLOY.md');
    console.log('- Cloudflare文档: https://developers.cloudflare.com/workers/');
    process.exit(1);
  }
}

// 运行脚本
main(); 