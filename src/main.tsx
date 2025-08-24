import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './constants/colors.css'; // 导入颜色主题 CSS
import './utils/themeManager'; // 确保主题管理器早期初始化
import ThemeView from './layout/ThemeView';
import AppRoutes from './routes';

// Import Swiper styles
import 'swiper/swiper-bundle.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeView>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeView>
  </StrictMode>,
);
