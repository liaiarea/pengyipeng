/**
 * MD5 哈希工具 - Cloudflare Workers兼容版本
 * 用于快子API签名验证
 */

/**
 * MD5 算法实现 - 基于标准MD5规范
 */
export function md5(input) {
  // MD5 常量
  const HASH_K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ];

  const HASH_S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];

  // 转换为字节数组
  const message = new TextEncoder().encode(input);
  
  // 计算消息长度（以位为单位）
  const msgLength = message.length;
  const msgBitLength = msgLength * 8;
  
  // 添加填充
  const padding = new Uint8Array(Math.ceil((msgLength + 9) / 64) * 64);
  padding.set(message);
  padding[msgLength] = 0x80;
  
  // 添加原始长度（64位小端序）
  const lengthPos = padding.length - 8;
  for (let i = 0; i < 4; i++) {
    padding[lengthPos + i] = (msgBitLength >>> (i * 8)) & 0xff;
  }
  
  // 初始化哈希值
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  
  // 处理每个512位块
  for (let chunk = 0; chunk < padding.length; chunk += 64) {
    const w = new Uint32Array(16);
    
    // 将64字节块转换为16个32位字（小端序）
    for (let i = 0; i < 16; i++) {
      const offset = chunk + i * 4;
      w[i] = padding[offset] | 
             (padding[offset + 1] << 8) | 
             (padding[offset + 2] << 16) | 
             (padding[offset + 3] << 24);
    }
    
    // 初始化轮次值
    let a = h0, b = h1, c = h2, d = h3;
    
    // 主循环
    for (let i = 0; i < 64; i++) {
      let f, g;
      
      if (i < 16) {
        f = (b & c) | ((~b) & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | ((~d) & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | (~d));
        g = (7 * i) % 16;
      }
      
      f = (f + a + HASH_K[i] + w[g]) >>> 0;
      a = d;
      d = c;
      c = b;
      b = (b + leftRotate(f, HASH_S[i])) >>> 0;
    }
    
    // 添加到哈希值
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
  }
  
  // 产生最终哈希值（小端序）
  const result = new Array(16);
  for (let i = 0; i < 4; i++) {
    result[i * 4] = h0 >>> (i * 8) & 0xff;
    result[i * 4 + 1] = h1 >>> (i * 8) & 0xff;
    result[i * 4 + 2] = h2 >>> (i * 8) & 0xff;
    result[i * 4 + 3] = h3 >>> (i * 8) & 0xff;
  }
  
  // 转换为十六进制字符串
  return result.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 左旋转操作
 */
function leftRotate(value, amount) {
  return ((value << amount) | (value >>> (32 - amount))) >>> 0;
} 