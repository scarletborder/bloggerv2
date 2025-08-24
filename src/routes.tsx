import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import * as Pages from './pages';
import PageView from './layout/PageView';
import WithNav from './layout/WithNav';


function HtmlRedirect() {
  const location = useLocation();
  const { pathname, search, hash } = location;
  // 匹配 .html 结尾
  if (/\.html$/.test(pathname)) {
    const newPath = pathname.replace(/\.html$/, '');
    return <Navigate to={newPath + search + hash} replace />;
  }
  return null;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* .html 结尾重定向 */}
      <Route path="*:html" element={<HtmlRedirect />} />

      {/* 首页 */}
      <Route path="/" element={<PageView children={<Pages.HomePage />} />} />
      {/* 工具页面 */}
      <Route path="/tools" element={<PageView children={<Pages.ToolsPage />} />} />
      {/* 归档页面 */}
      <Route path="/archives" element={<WithNav children={<Pages.ArchivesPage />} />} />
    </Routes>
  );
}
