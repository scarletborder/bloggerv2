import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './constants/colors.css'; // 导入颜色主题 CSS
import ThemeView from './layout/ThemeView';
import AppRoutes from './routes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeView>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeView>
  </StrictMode>,
);
