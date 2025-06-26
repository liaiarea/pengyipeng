// 🎬 NFC抖音视频营销工具 - Cloudflare Workers网页版
// 使用方法：复制以下全部代码到Cloudflare Workers编辑器中

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NFC抖音视频</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh; 
        }
        .container { 
            max-width: 400px; margin: 0 auto; 
            background: white; padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
        }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; margin: 0; font-size: 24px; }
        .header p { color: #666; margin: 10px 0 0 0; }
        .video-container { margin: 20px 0; text-align: center; }
        .video-container video { width: 100%; max-width: 300px; border-radius: 10px; }
        .btn { 
            display: block; width: 100%; padding: 15px; margin: 10px 0; 
            background: #ff6b6b; color: white; text-decoration: none; 
            text-align: center; border-radius: 8px; border: none; 
            font-size: 16px; cursor: pointer; transition: all 0.3s; 
        }
        .btn:hover { background: #ff5252; transform: translateY(-2px); }
        .btn-secondary { background: #4ecdc4; }
        .btn-secondary:hover { background: #45b7b8; }
        .loading { text-align: center; color: #666; padding: 20px; }
        .error { color: #ff4444; text-align: center; padding: 20px; }
        .info { 
            background: #f8f9fa; padding: 15px; border-radius: 8px; 
            margin: 15px 0; border-left: 4px solid #007bff; 
        }
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
            const content = document.getElementById('content');
            content.innerHTML = 
                '<div class="video-container">' +
                    '<h3>' + video.title + '</h3>' +
                    '<video controls>' +
                        '<source src="' + video.url + '" type="video/mp4">' +
                        '您的浏览器不支持视频播放' +
                    '</video>' +
                '</div>' +
                '<button class="btn" onclick="shareToDouyin()">📱 分享到抖音</button>' +
                '<button class="btn btn-secondary" onclick="copyLink()">🔗 复制链接</button>' +
                '<div class="info">商户: ' + storeId + ' | 分类: ' + category + '</div>';
        }
        
        function showError(message) {
            const content = document.getElementById('content');
            content.innerHTML = 
                '<div class="error">❌ ' + message + '</div>' +
                '<button class="btn" onclick="loadVideo()">🔄 重新加载</button>';
        }
        
        function shareToDouyin() {
            const url = window.location.href;
            if (navigator.share) {
                navigator.share({
                    title: 'NFC抖音视频分享',
                    text: '来看看这个精彩视频！',
                    url: url
                });
            } else {
                copyLink();
                alert('链接已复制，请在抖音中粘贴分享');
            }
        }
        
        function copyLink() {
            const url = window.location.href;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(() => {
                    alert('链接已复制到剪贴板');
                });
            } else {
                alert('请手动复制链接: ' + url);
            }
        }
    </script>
</body>
</html>`;

const SAMPLE_VIDEOS = [
    {
        id: 'food1',
        title: '美食制作教程',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        category: 'food'
    },
    {
        id: 'general1', 
        title: '产品展示视频',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        category: 'general'
    },
    {
        id: 'lifestyle1',
        title: '生活小贴士',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
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
            if (path === '/' || path === '/nfc-redirect') {
                return new Response(HTML_CONTENT, {
                    headers: { 
                        'Content-Type': 'text/html; charset=utf-8',
                        ...corsHeaders
                    }
                });
            }
            
            if (path === '/health') {
                return new Response(JSON.stringify({
                    success: true,
                    message: 'NFC抖音视频服务运行正常',
                    timestamp: new Date().toISOString()
                }), {
                    headers: { 
                        'Content-Type': 'application/json',
                        ...corsHeaders 
                    }
                });
            }
            
            if (path === '/api/video') {
                const storeId = url.searchParams.get('store_id') || 'demo';
                const category = url.searchParams.get('category') || 'general';
                
                let video = SAMPLE_VIDEOS.find(v => v.category === category);
                if (!video) {
                    video = SAMPLE_VIDEOS[0];
                }
                
                return new Response(JSON.stringify({
                    success: true,
                    video: video,
                    store_id: storeId,
                    category: category
                }), {
                    headers: { 
                        'Content-Type': 'application/json',
                        ...corsHeaders 
                    }
                });
            }
            
            if (path === '/api/nfc/redirect') {
                const storeId = url.searchParams.get('store_id');
                const category = url.searchParams.get('category');
                
                if (!storeId) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: '缺少store_id参数'
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
            
            return new Response(JSON.stringify({
                success: false,
                error: '页面不存在'
            }), { 
                status: 404,
                headers: { 
                    'Content-Type': 'application/json',
                    ...corsHeaders 
                }
            });
            
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: '服务器错误',
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