/**
 * 输入验证工具 - Cloudflare Workers版本
 */

/**
 * 验证NFC标签ID
 */
export function validateNfcId(nfcId) {
  if (!nfcId || typeof nfcId !== 'string') {
    return { valid: false, error: 'NFC ID必须是字符串' };
  }
  
  if (nfcId.length < 4 || nfcId.length > 50) {
    return { valid: false, error: 'NFC ID长度必须在4-50字符之间' };
  }
  
  // 只允许字母、数字、下划线、短横线
  if (!/^[a-zA-Z0-9_-]+$/.test(nfcId)) {
    return { valid: false, error: 'NFC ID只能包含字母、数字、下划线和短横线' };
  }
  
  return { valid: true };
}

/**
 * 验证类别参数
 */
export function validateCategory(category) {
  if (!category) {
    return { valid: true }; // 可选参数
  }
  
  if (typeof category !== 'string') {
    return { valid: false, error: '类别必须是字符串' };
  }
  
  if (category.length > 50) {
    return { valid: false, error: '类别长度不能超过50字符' };
  }
  
  return { valid: true };
}

/**
 * 验证分页参数
 */
export function validatePagination(page, size) {
  const pageNum = parseInt(page) || 1;
  const sizeNum = parseInt(size) || 20;
  
  if (pageNum < 1 || pageNum > 1000) {
    return { valid: false, error: '页码必须在1-1000之间' };
  }
  
  if (sizeNum < 1 || sizeNum > 100) {
    return { valid: false, error: '每页大小必须在1-100之间' };
  }
  
  return { 
    valid: true, 
    page: pageNum, 
    size: sizeNum 
  };
}

/**
 * 验证视频ID
 */
export function validateVideoId(videoId) {
  if (!videoId || typeof videoId !== 'string') {
    return { valid: false, error: '视频ID必须是字符串' };
  }
  
  if (videoId.length < 1 || videoId.length > 100) {
    return { valid: false, error: '视频ID长度必须在1-100字符之间' };
  }
  
  return { valid: true };
}

/**
 * 验证抖音分享参数
 */
export function validateDouyinShare(data) {
  const errors = [];
  
  if (!data.video_url || typeof data.video_url !== 'string') {
    errors.push('视频URL是必需的');
  } else if (!isValidUrl(data.video_url)) {
    errors.push('视频URL格式无效');
  }
  
  if (data.caption && typeof data.caption !== 'string') {
    errors.push('标题必须是字符串');
  } else if (data.caption && data.caption.length > 500) {
    errors.push('标题长度不能超过500字符');
  }
  
  if (data.hashtags && !Array.isArray(data.hashtags)) {
    errors.push('标签必须是数组');
  } else if (data.hashtags && data.hashtags.length > 10) {
    errors.push('标签数量不能超过10个');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 通用输入验证函数
 */
export function validateInput(data, rules) {
  const errors = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    // 检查必需字段
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field}是必需的`);
      continue;
    }
    
    // 跳过非必需且为空的字段
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // 类型检查
    if (rule.type && typeof value !== rule.type) {
      errors.push(`${field}必须是${rule.type}类型`);
      continue;
    }
    
    // 字符串长度检查
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      errors.push(`${field}长度不能少于${rule.minLength}字符`);
    }
    
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      errors.push(`${field}长度不能超过${rule.maxLength}字符`);
    }
    
    // 数值范围检查
    if (rule.min && typeof value === 'number' && value < rule.min) {
      errors.push(`${field}不能小于${rule.min}`);
    }
    
    if (rule.max && typeof value === 'number' && value > rule.max) {
      errors.push(`${field}不能大于${rule.max}`);
    }
    
    // 正则表达式验证
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors.push(`${field}格式无效`);
    }
    
    // 自定义验证函数
    if (rule.validator && typeof rule.validator === 'function') {
      const result = rule.validator(value);
      if (result !== true) {
        errors.push(typeof result === 'string' ? result : `${field}验证失败`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证URL格式
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * 清理和验证请求参数
 */
export function sanitizeParams(params) {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') {
      continue;
    }
    
    if (typeof value === 'string') {
      // 移除危险字符和过长内容
      cleaned[key] = value.trim().substring(0, 1000);
    } else if (typeof value === 'number') {
      cleaned[key] = value;
    } else if (Array.isArray(value)) {
      cleaned[key] = value.slice(0, 20); // 限制数组长度
    }
  }
  
  return cleaned;
} 