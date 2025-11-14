import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/theme.css'; // TDesign 设计系统颜色定义（基础样式）
import './constants/colors.css'; // 向后兼容的颜色样式（已弃用，使用 theme.css 替代）
import './utils/themeManager'; // 确保主题管理器早期初始化
import ThemeView from './layout/ThemeView';
import AppRoutes from './routes';

// Import Swiper styles
import 'swiper/swiper-bundle.css';

createRoot(document.getElementById('root')!).render(<StrictMode>
    <ThemeView>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeView>
  </StrictMode>);
