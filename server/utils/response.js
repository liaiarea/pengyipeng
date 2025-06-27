/**
 * 响应工具函数 - Cloudflare Workers版本
 */

export function createResponse(code, message, data = null, error = null) {
  const responseBody = {
    code,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  if (error) {
    responseBody.error = error;
  }
  
  const status = code >= 200 && code < 300 ? code : (code >= 400 ? code : 500);
  
  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });
}

export function createSuccessResponse(data, message = 'success') {
  return createResponse(200, message, data);
}

export function createErrorResponse(code, message, error = null) {
  return createResponse(code, message, null, error);
} 