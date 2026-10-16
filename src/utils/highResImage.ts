/**
 * Blogger / YouTube 图片高清化工具
 * 将博客图床的缩放尺寸（如 /s200/、w400-h300）统一替换为高清尺寸
 */

/** Blogger 图床 URL 中的缩放片段，如 /s1600/、/w400-h300/、/w400/ */
const BLOGGER_RESIZE_REGEX = /\/([sw][0-9]+|w[0-9]+-h[0-9]+)(-[a-z0-9-]+)?\//;

/**
 * 尝试获取图片的高清版本地址
 * @param src 原始图片地址
 * @returns 高清化后的地址；无法识别时原样返回
 */
export const getHighResImage = (src: string): string => {
  if (!src || src.startsWith('data:')) return src;

  // 1. YouTube 缩略图高清化
  if (src.includes('img.youtube.com')) {
    return src.replace(/\/(default|mqdefault|hqdefault|sddefault)\.jpg/, '/maxresdefault.jpg');
  }

  // 2. Blogger 图片服务器高清化（s1600）
  if (src.includes('blogger.googleusercontent.com') || src.includes('.bp.blogspot.com')) {
    if (BLOGGER_RESIZE_REGEX.test(src)) return src.replace(BLOGGER_RESIZE_REGEX, '/s1600/');
    if (src.includes('=')) return src.replace(/=(w[0-9]+|s[0-9]+).*/, '=s1600');
  }

  return src;
};

/**
 * 判断链接是否指向一张可直接查看的大图（用于灯箱取图优先级判断）
 */
export const isDirectImageUrl = (href: string): boolean => /\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i.test(href) || href.includes('blogger.googleusercontent.com/img');
