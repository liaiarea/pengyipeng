/**
 * 验证工具函数 - Cloudflare Workers版本
 */

/**
 * 验证请求参数
 * @param {Request} request 请求对象
 * @param {Object} rules 验证规则
 * @returns {Object} 验证结果
 */
export async function validateRequest(request, rules = {}) {
  const errors = [];
  const url = new URL(request.url);
  
  try {
    // 获取参数数据
    let data = {};
    
    if (request.method === 'GET') {
      data = Object.fromEntries(url.searchParams.entries());
    } else if (request.method === 'POST') {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await request.json();
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        data = Object.fromEntries(formData.entries());
      }
    }

    // 验证规则
    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];
      
      // 必填验证
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors.push(`${field}不能为空`);
        continue;
      }
      
      // 如果字段为空且不是必填，跳过后续验证
      if (!value) continue;
      
      // 类型验证
      if (rule.type) {
        if (!validateType(value, rule.type)) {
          errors.push(`${field}类型错误，应为${rule.type}`);
          continue;
        }
      }
      
      // 长度验证
      if (rule.minLength && value.toString().length < rule.minLength) {
        errors.push(`${field}长度不能少于${rule.minLength}个字符`);
      }
      
      if (rule.maxLength && value.toString().length > rule.maxLength) {
        errors.push(`${field}长度不能超过${rule.maxLength}个字符`);
      }
      
      // 正则验证
      if (rule.pattern && !rule.pattern.test(value.toString())) {
        errors.push(`${field}格式不正确`);
      }
      
      // 自定义验证函数
      if (rule.validator && typeof rule.validator === 'function') {
        const result = rule.validator(value);
        if (result !== true) {
          errors.push(result || `${field}验证失败`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      data
    };

  } catch (error) {
    return {
      valid: false,
      errors: ['请求数据格式错误'],
      data: {}
    };
  }
}

/**
 * 验证数据类型
 * @param {*} value 值
 * @param {string} type 类型
 * @returns {boolean} 是否有效
 */
function validateType(value, type) {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return !isNaN(Number(value));
    case 'integer':
      return Number.isInteger(Number(value));
    case 'boolean':
      return typeof value === 'boolean' || value === 'true' || value === 'false';
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'url':
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    default:
      return true;
  }
}

/**
 * 常用验证规则
 */
export const validationRules = {
  // NFC相关
  store_id: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 50
  },
  
  category: {
    type: 'string',
    maxLength: 20
  },
  
  // 分页相关
  page: {
    type: 'integer',
    validator: (value) => {
      const num = Number(value);
      return num > 0 || '页码必须大于0';
    }
  },
  
  limit: {
    type: 'integer',
    validator: (value) => {
      const num = Number(value);
      return (num > 0 && num <= 100) || '每页数量必须在1-100之间';
    }
  },
  
  // 用户代理
  userAgent: {
    type: 'string',
    maxLength: 500
  }
}; 