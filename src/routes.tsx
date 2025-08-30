import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import * as Pages from "./pages";
import PageView from "./layout/PageView";
import WithNav from "./layout/WithNav";

function HtmlRedirect() {
  const location = useLocation();
  const { pathname, search, hash } = location;
  // 匹配 .html 结尾
  if (/\.html$/.test(pathname)) {
    const newPath = pathname.replace(/\.html$/, "");
    return <Navigate to={newPath + search + hash} replace />;
  }
  return null;
}

/**
 * 检查当前窗口是否是评论成功后Blogger重定向回来的弹出窗口。
 * @returns {boolean} 如果是，则返回 true。
 */
const isCommentSuccessPopup = (): boolean => {
  const { search, hash, pathname } = window.location;

  // 条件1: URL 中包含 ?sc=... 查询参数
  const hasSuccessParam = search.includes('sc=');

  // 条件2: URL 中包含 #c... 哈希
  const hasCommentHash = hash.startsWith('#c');

  // 条件3 (备用): 检查旧的 window.name 方式，作为补充
  const hasSuccessName = pathname.startsWith('new-comment-');

  // 如果满足URL条件，或者满足备用的 window.name 条件，就认为是成功弹窗
  return (hasSuccessParam && hasCommentHash) || hasSuccessName;
};

export default function AppRoutes() {
  if (isCommentSuccessPopup()) {
    window.close();
  }
  return (
    <Routes>
      {/* .html 结尾重定向 */}
      <Route path="*:html" element={<HtmlRedirect />} />

      {/* 首页 */}
      <Route path="/" element={<PageView children={<Pages.HomePage />} />} />
      {/* 工具页面 */}
      <Route
        path="/tools"
        element={<PageView children={<Pages.ToolsPage />} />}
      />
      {/* 归档页面 */}
      <Route
        path="/archives"
        element={<WithNav children={<Pages.ArchivesPage />} />}
      />
      {/* 搜索页面 */}
      <Route
        path="/search"
        element={<WithNav children={<Pages.SearchPage />} />}
      />
      {/* 文章页面 - 捕获所有路径作为文章路径 */}
      <Route path="/*" element={<PageView children={<Pages.PostPage />} />} />
    </Routes>
  );
}
