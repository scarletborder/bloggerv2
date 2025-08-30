export const BLOG_BASE = "https://blog.scarletborder.cn"
/**
 * The full base URL of your Blogger blog.
 * This should NOT have a trailing slash.
 */
export const BLOG_URL = import.meta.env.DEV ? "/proxy-api" : BLOG_BASE;

// 为一些pkg提供的完整资源请求前缀
export const API_URL_PREFIX = import.meta.env.DEV ? `${window.location.origin}/proxy-api` : BLOG_BASE;

/**
 * Default timeout for API requests in milliseconds.
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * 每次请求的博文数量
 */
export const PAGE_SIZE = 8;
