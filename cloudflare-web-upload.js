/**
 * NFC抖音视频营销工具 - Cloudflare网页版
 * 复制此代码到Cloudflare Workers编辑器中
 */

const HTML_PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NFC抖音视频</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; margin: 0; font-size: 24px; }
        .header p { color: #666; margin: 10px 0 0 0; }
        .video-container { margin: 20px 0; text-align: center; }
        .video-container video { width: 100%; max-width: 300px; border-radius: 10px; }
        .btn { display: block; width: 100%; padding: 15px; margin: 10px 0; background: #ff6b6b; color: white; text-decoration: none; text-align: center; border-radius: 8px; border: none; font-size: 16px; cursor: pointer; transition: all 0.3s; }
        .btn:hover { background: #ff5252; transform: translateY(-2px); }
        .btn-secondary { background: #4ecdc4; }
        .btn-secondary:hover { background: #45b7b8; }
        .loading { text-align: center; color: #666; padding: 20px; }
        .error { color: #ff4444; text-align: center; padding: 20px; }
        .success { color: #44ff44; text-align: center; padding: 20px; }
        .info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #007bff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 NFC抖音视频</h1>
            <p>碰一碰即可分享精彩视频</p>
        </div>
        <div id="content">
            <div class="loading">正在获取视频内容...</div>
        </div>
    </div>
    
    <script>
        const urlParams = new URLSearchParams(window.location.search);
        const storeId = urlParams.get('store_id') || 'demo';
        const category = urlParams.get('category') || 'general';
        
        window.addEventListener('load', loadVideo);
        
        async function loadVideo() {
            try {
                const response = await fetch('/api/video?store_id=' + storeId + '&category=' + category);
                const data = await response.json();
                
                if (data.success && data.video) {
                    showVideo(data.video);
                } else {
                    showError('暂无可用视频内容');
                }
            } catch (error) {
                console.error('加载视频失败:', error);
                showError('网络连接失败，请重试');
            }
        }
        
        function showVideo(video) {
            document.getElementById('content').innerHTML = 
                '<div class="video-container">' +
                    '<h3>' + video.title + '</h3>' +
                    '<video controls poster="' + (video.poster || '') + '">' +
                        '<source src="' + video.url + '" type="video/mp4">' +
                        '您的浏览器不支持视频播放' +
                    '</video>' +
                '</div>' +
                '<button class="btn" onclick="shareToDouyin()">📱 分享到抖音</button>' +
                '<button class="btn btn-secondary" onclick="copyLink()">🔗 复制链接</button>' +
                '<div class="info">商户ID: ' + storeId + ' | 分类: ' + category + '</div>';
        }
        
        function showError(message) {
            document.getElementById('content').innerHTML = 
                '<div class="error">❌ ' + message + '</div>' +
                '<button class="btn" onclick="loadVideo()">🔄 重新加载</button>' +
                '<div class="info">如需帮助，请联系技术支持</div>';
        }
        
        function shareToDouyin() {
            if (navigator.share) {
                navigator.share({
                    title: 'NFC抖音视频分享',
                    text: '来看看这个精彩视频！',
                    url: window.location.href
                });
            } else {
                copyLink();
                alert('链接已复制，请在抖音中粘贴分享');
            }
        }
        
        function copyLink() {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('链接已复制到剪贴板');
            });
        }
    </script>
</body>
</html>`;

const DEMO_VIDEOS = [
    {
        id: 'v1',
        title: '美食制作教程',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        poster: 'https://via.placeholder.com/320x180/ff6b6b/ffffff?text=美食视频',
        category: 'food'
    },
    {
        id: 'v2', 
        title: '产品展示视频',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        poster: 'https://via.placeholder.com/320x180/4ecdc4/ffffff?text=产品展示',
        category: 'general'
    },
    {
        id: 'v3',
        title: '生活小贴士',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
        poster: 'https://via.placeholder.com/320x180/45b7b8/ffffff?text=生活贴士',
        category: 'lifestyle'
    }
];

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };
        
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }
        
        try {
            // 主页面和NFC跳转
            if (path === '/' || path === '/nfc-redirect') {
                return new Response(HTML_PAGE, {
                    headers: { 
                        'Content-Type': 'text/html; charset=utf-8',
                        ...corsHeaders
                    }
                });
            }
            
            // 健康检查
            if (path === '/health') {
                return new Response(JSON.stringify({
                    success: true,
                    message: 'NFC抖音视频服务运行正常',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }), {
                    headers: { 
                        'Content-Type': 'application/json',
                        ...corsHeaders 
                    }
                });
            }
            
            // 获取视频API
            if (path === '/api/video') {
                const storeId = url.searchParams.get('store_id') || 'demo';
                const category = url.searchParams.get('category') || 'general';
                
                // 根据分类选择视频
                let video = DEMO_VIDEOS.find(v => v.category === category);
                if (!video) {
                    video = DEMO_VIDEOS[0]; // 默认视频
                }
                
                return new Response(JSON.stringify({
                    success: true,
                    video: video,
                    store_id: storeId,
                    category: category,
                    timestamp: new Date().toISOString()
                }), {
                    headers: { 
                        'Content-Type': 'application/json',
                        ...corsHeaders 
                    }
                });
            }
            
            // NFC跳转API
            if (path === '/api/nfc/redirect') {
                const storeId = url.searchParams.get('store_id');
                const category = url.searchParams.get('category');
                
                if (!storeId) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: '缺少必要参数 store_id'
                    }), { 
                        status: 400,
                        headers: { 
                            'Content-Type': 'application/json',
                            ...corsHeaders 
                        }
                    });
                }
                
                const redirectUrl = '/?store_id=' + storeId + '&category=' + (category || 'general');
                return Response.redirect(new URL(redirectUrl, request.url), 302);
            }
            
            // API信息
            if (path === '/api') {
                return new Response(JSON.stringify({
                    success: true,
                    message: 'NFC抖音视频API',
                    version: '1.0.0',
                    endpoints: [
                        'GET / - 主页面',
                        'GET /api/video - 获取视频',
                        'GET /api/nfc/redirect - NFC跳转',
                        'GET /health - 健康检查'
                    ]
                }), {
                    headers: { 
                        'Content-Type': 'application/json',
                        ...corsHeaders 
                    }
                });
            }
            
            // 404处理
            return new Response(JSON.stringify({
                success: false,
                error: '页面不存在',
                path: path
            }), { 
                status: 404,
                headers: { 
                    'Content-Type': 'application/json',
                    ...corsHeaders 
                }
            });
            
        } catch (error) {
            console.error('Worker错误:', error);
            return new Response(JSON.stringify({
                success: false,
                error: '服务器内部错误',
                message: error.message
            }), { 
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    ...corsHeaders 
                }
            });
        }
    }
}; 