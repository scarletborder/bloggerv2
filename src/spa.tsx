import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'tdesign-mobile-react/es/style/index.css';

// Import Swiper styles (按需引入核心与所用模块样式，减少 CSS 体积)
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import ThemeView from './layout/ThemeView';
import AppRoutes from './routes';

/**
 * SPA 模式挂载入口。
 * 仅在 Blogger 的 error 视图（/archives、/search、/pages 等纯客户端路由）
 * 或本地开发（index.html 含 #root）时使用。
 * 主页 / 文章详情由 Blogger 原生模板服务端渲染，走 islands 模式。
 */
export function mountSpa(root: HTMLElement): void {
  createRoot(root).render(<StrictMode>
      <ThemeView>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeView>
    </StrictMode>);
}
