/// <reference types="vite/client" />

// API 请求的基础URL
// 一般是博客的根URL，例如 'https://blog.scarletborder.cn'。
declare const __API_ENDPOINT__: string;
declare const __CDN_BASE__: string;

// Swiper 按需 CSS 子路径无类型声明，这里补充环境声明
declare module 'swiper/css';
declare module 'swiper/css/navigation';
declare module 'swiper/css/pagination';
