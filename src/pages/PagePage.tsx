import { useEffect, useState } from "react";
import { getPageDetail, type PageDetail } from "../services/PageDetail";
import { useLocation } from "react-router-dom";
import { useAsyncEffect } from "ahooks";
import { isMobile } from "react-device-detect";
import { useTitle } from "ahooks";

const PagePage: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const [pageDetail, setPageDetail] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useTitle(`${pageDetail?.title ?? "Loading"} - 绯境之外`);

  useAsyncEffect(async () => {
    if (!pathname) return;
    const processedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    try {
      setLoading(true);
      setError(null);
      const detail = await getPageDetail(processedPath);
      setPageDetail(detail);
    } catch (err) {
      console.error('Failed to load page:', err);
      setError(err instanceof Error ? err.message : '加载页面失败');
    } finally {
      setLoading(false);
    }
  }, [pathname]);

  // 监听滚动，显示/隐藏回到顶部按钮（仅移动端）
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 回到顶部功能
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 页面容器样式
  const pageStyles: React.CSSProperties = {
    backgroundColor: 'var(--background-color)',
    minHeight: '100vh',
    color: 'var(--text-color)',
  };

  // 主内容区域样式 - 占满整个宽度
  const mainStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    minWidth: '100%',
    margin: '0 auto',
    padding: isMobile ? '16px 4px' : '32px',
    position: 'relative',
  };

  // 加载状态样式
  const loadingStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    fontSize: isMobile ? '16px' : '18px',
    color: 'var(--text-secondary-color)',
  };

  // 错误状态样式
  const errorStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    textAlign: 'center',
    color: 'var(--text-color)',
  };

  const errorTitleStyles: React.CSSProperties = {
    fontSize: isMobile ? '1.5rem' : '2rem',
    marginBottom: '16px',
    color: 'var(--primary-color)',
  };

  const errorMessageStyles: React.CSSProperties = {
    fontSize: isMobile ? '14px' : '16px',
    color: 'var(--text-secondary-color)',
    marginBottom: '24px',
  };

  const backButtonStyles: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: 'var(--primary-color)',
    color: 'var(--surface-color)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.2s ease',
  };

  // 悬浮的回到顶部按钮样式（仅移动端）
  const scrollTopButtonStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color)',
    color: 'var(--surface-color)',
    border: 'none',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: showScrollTop && isMobile ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
    zIndex: 1000,
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div style={pageStyles}>
        <div style={loadingStyles}>
          <div>正在加载页面...</div>
        </div>
      </div>
    );
  }

  if (error || !pageDetail) {
    return (
      <div style={pageStyles}>
        <div style={errorStyles}>
          <h1 style={errorTitleStyles}>😔 页面加载失败</h1>
          <p style={errorMessageStyles}>
            {error || '找不到指定的页面'}
          </p>
          <a
            href="/"
            style={backButtonStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-color)';
            }}
          >
            返回首页
          </a>
        </div>
      </div>
    );
  }

  // 渲染页面内容
  return (
    <div style={pageStyles}>
      <main style={mainStyles}>
        {/* 页面标题 */}
        <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '16px' }}>
          {pageDetail.title}
        </h1>

        {/* 页面内容 - 直接渲染 HTML */}
        <div
          dangerouslySetInnerHTML={{ __html: pageDetail.content }}
          style={{
            fontSize: isMobile ? '14px' : '16px',
            lineHeight: '1.6',
          }}
        />
      </main>

      {/* 悬浮的回到顶部按钮（仅移动端） */}
      <button
        style={scrollTopButtonStyles}
        onClick={scrollToTop}
        onMouseEnter={(e) => {
          if (isMobile) return;
          e.currentTarget.style.backgroundColor = 'var(--primary-hover-color)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          if (isMobile) return;
          e.currentTarget.style.backgroundColor = 'var(--primary-color)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary-hover-color)';
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary-color)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="回到顶部"
      >
        ↑
      </button>
    </div>
  );
};

export default PagePage;