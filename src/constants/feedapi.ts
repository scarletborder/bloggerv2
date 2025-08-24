/**
 * The full base URL of your Blogger blog.
 * This should NOT have a trailing slash.
 */
export const BLOG_URL = import.meta.env.DEV ? "/proxy-api" : "https://blog.scarletborder.cn";

/**
 * Default timeout for API requests in milliseconds.
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * 每次请求的博文数量
 */
export const PAGE_SIZE = 8;
