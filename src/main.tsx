import './styles/theme.css'; // TDesign 设计系统颜色定义（基础样式，含主题 CSS 变量）
import './styles/global.css'; // 全局排版和元素样式
import './constants/colors.css'; // 向后兼容的颜色样式（已弃用，使用 theme.css 替代）
import './utils/themeManager'; // 确保主题管理器早期初始化

/**
 * 应用入口（双模式）。
 *
 * 本主题采用 "Blogger 原生渲染 + React 岛屿增强" 的混合架构：
 * - 模板中存在 #root 时（Blogger error 视图 / 本地开发）：走 SPA 模式，
 *   由 react-router 渲染 /archives、/search、/pages 等纯客户端路由；
 * - 否则（主页 / 文章 / 页面，Blogger 原生服务端渲染）：走岛屿模式，
 *   React 只挂载到模板预留的增强节点（主题切换、目录、正文增强、友链）。
 *
 * SPA 与岛屿代码均通过动态 import 拆分为独立 chunk，
 * 原生页面不会下载 SPA 及其重依赖（swiper / tdesign-mobile 等）。
 */
const spaRoot = document.getElementById('root');

if (spaRoot) {
  void import('./spa').then(({ mountSpa }) => mountSpa(spaRoot));
} else {
  void import('./islands').then(({ mountIslands }) => mountIslands());
}
