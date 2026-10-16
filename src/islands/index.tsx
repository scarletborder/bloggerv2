import { createRoot } from 'react-dom/client';
import React from 'react';
import { isMobile } from 'react-device-detect';
import ThemeToggle from '../components/ThemeToggle';
import TableOfContents from '../components/post/TableOfContents';
import PostBodyEnhancer from '../components/post/islands/PostBodyEnhancer';
import Blogroll from '../components/home/Blogroll';

/**
 * 岛屿（Islands）挂载入口 —— Blogger 原生渲染页面专用。
 *
 * 与整页 SPA 模式互斥：模板中只有 error 视图（/archives、/search、/pages 等
 * 纯客户端路由）会渲染 #root 走 SPA；主页 / 文章 / 页面由 Blogger 原生
 * 服务端渲染，React 仅挂载到模板预留的增强节点上。
 */

/** 将 React 组件挂载到指定 id 的岛屿节点，节点不存在时跳过 */
const mountIsland = (id: string, element: React.ReactNode): void => {
  const container = document.getElementById(id);
  if (!container) return;
  createRoot(container).render(element);
};

export function mountIslands(): void {
  // 导航栏主题切换（所有原生页面）
  mountIsland('react-theme', <ThemeToggle />);

  // 文章页：正文增强（代码高亮 / KaTeX / 外链嵌入 / 图片灯箱）
  mountIsland('react-post-body', <PostBodyEnhancer />);

  // 文章页：目录（组件内部基于 .blog-content DOM 收集标题）
  mountIsland('react-toc', <TableOfContents content='' />);

  // 主页：友站链接（数据来自 CDN 上的 blogroll.json）
  mountIsland('react-blogroll', <Blogroll isMobile={isMobile} />);
}
