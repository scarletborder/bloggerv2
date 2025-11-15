/**
 * API请求的基础URL。
 * 这个值由 Vite 在构建时从环境中注入。
 * - 本地开发时: '/proxy-api'
 * - 生产构建时: 'https://blog.scarletborder.cn' (或由环境变量指定)
 */
export const BLOG_BASE = __API_ENDPOINT__;
export const BLOG_URL = __API_ENDPOINT__;

/**
 * 为一些需要完整绝对URL的库提供的请求前缀。
 * 这个逻辑判断 __API_ENDPOINT__ 是否是一个相对路径 (以'/'开头，例如'/proxy-api')，
 * 如果是，则在前面拼接上当前页面的域名 (e.g., 'http://localhost:5173')。
 * 如果 __API_ENDPOINT__ 已经是 'https://...' 这样的绝对路径，则直接使用。
 */
export const API_URL_PREFIX = __API_ENDPOINT__.startsWith('/')
  ? `${window.location.origin}${__API_ENDPOINT__}`
  : __API_ENDPOINT__;

export const CDN_URL_PREFIX = __CDN_BASE__.startsWith('/')
  ? `${window.location.origin}${__CDN_BASE__}`
  : __CDN_BASE__;

/**
 * Default timeout for API requests in milliseconds.
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * 每次请求的博文数量
 */
export const PAGE_SIZE = 8;
