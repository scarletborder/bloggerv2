import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'tdesign-mobile-react/es/style/index.css';

import './styles/theme.css'; // TDesign 设计系统颜色定义（基础样式）
import './styles/global.css'; // 全局排版和元素样式
import './constants/colors.css'; // 向后兼容的颜色样式（已弃用，使用 theme.css 替代）
import './utils/themeManager'; // 确保主题管理器早期初始化
import ThemeView from './layout/ThemeView';
import AppRoutes from './routes';
import { enhanceBlogger } from './blogger/enhance';
import './styles/blogger.css';

// Import Swiper styles
import 'swiper/swiper-bundle.css';

const nativeRoot = document.getElementById('blogger-native');
// Utility routes keep their existing React views; posts keep Blogger's HTML and URL.
const utilityRoute = ['/archives', '/pages'].includes(window.location.pathname)
  || (window.location.pathname === '/search' && new URLSearchParams(window.location.search).has('q'));
if (nativeRoot && !utilityRoute) {
  enhanceBlogger();
} else {
  const root = document.getElementById('root') ?? document.body.appendChild(document.createElement('div'));
  if (nativeRoot) {
    document.querySelector('.native-nav')?.remove();
    document.querySelector('.native-footer')?.remove();
    nativeRoot.remove();
  }
  createRoot(root).render(<StrictMode>
    <ThemeView>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeView>
  </StrictMode>);
}
