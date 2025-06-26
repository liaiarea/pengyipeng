/**
 * 响应工具函数 - Cloudflare Workers版本
 */

/**
 * 创建成功响应
 * @param {*} data 响应数据
 * @param {number} code 状态码
 * @param {string} message 消息
 * @returns {Response} Response对象
 */
export function createSuccessResponse(data = null, code = 200, message = 'success') {
  return new Response(JSON.stringify({
    code,
    message,
    data
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * 创建错误响应
 * @param {number} status HTTP状态码
 * @param {string} message 错误消息
 * @param {*} details 错误详情
 * @returns {Response} Response对象
 */
export function createErrorResponse(status = 500, message = '服务器内部错误', details = null) {
  const responseData = {
    code: status,
    message,
    data: null
  };

  if (details && process.env.NODE_ENV !== 'production') {
    responseData.details = details;
  }

  return new Response(JSON.stringify(responseData), {
    status: status >= 400 && status < 600 ? status : 500,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * 创建重定向响应
 * @param {string} url 重定向URL
 * @param {number} status 重定向状态码
 * @returns {Response} Response对象
 */
export function createRedirectResponse(url, status = 302) {
  return Response.redirect(url, status);
}

/**
 * 创建HTML响应
 * @param {string} html HTML内容
 * @param {number} status 状态码
 * @returns {Response} Response对象
 */
export function createHtmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
} 