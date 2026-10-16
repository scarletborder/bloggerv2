import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { JSX } from 'react/jsx-runtime';
import HomePage from './pages/HomePage';
import PageView from './layout/PageView';
import WithNav from './layout/WithNav';

// 首页保持直接引用（着陆页，避免懒加载瀑布流），其余页面按需加载
const PagesPage = lazy(() => import('./pages/PagesPage'));
const ArchivesPage = lazy(() => import('./pages/ArchivesPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const PagePage = lazy(() => import('./pages/PagePage'));
const PostPage = lazy(() => import('./pages/PostPage'));

function RouteFallback(): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        color: 'var(--text-secondary-color)',
        fontSize: '16px',
      }}
    >
      加载中...
    </div>
  );
}

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

export default function AppRoutes(): JSX.Element {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* .html 结尾重定向 */}
        <Route path="*:html" element={<HtmlRedirect />} />

        {/* 首页 */}
        <Route path="/" element={<PageView children={<HomePage />} />} />
        {/* 工具页面 */}
        <Route
          path="/pages"
          element={<PageView children={<PagesPage />} />}
        />
        {/* 归档页面 */}
        <Route
          path="/archives"
          element={<WithNav children={<ArchivesPage />} />}
        />
        {/* 搜索页面 */}
        <Route
          path="/search"
          element={<WithNav children={<SearchPage />} />}
        />

        {/* page */}
        <Route
          path="/p/:id"
          element={<PageView children={<PagePage />} />}
        />
        {/* 文章页面 - 捕获所有路径作为文章路径 */}
        <Route path="/*" element={<PageView children={<PostPage />} />} />
      </Routes>
    </Suspense>
  );
}
