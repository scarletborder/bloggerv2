import { useState } from "react";
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

  const pageStyles: React.CSSProperties = {
    backgroundColor: 'var(--background-color)',
    minHeight: '100vh',
    color: 'var(--text-color)',
  };

  const iframeStyles: React.CSSProperties = {
    width: '100%',
    height: 'calc(100vh - 150px)',
    border: 'none',
    borderRadius: '8px',
  };

  const loadingStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    fontSize: isMobile ? '16px' : '18px',
    color: 'var(--text-secondary-color)',
  };

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

  return (
    <div style={pageStyles}>
      <iframe
        style={iframeStyles}
        srcDoc={pageDetail.content}
        title={pageDetail.title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
};

export default PagePage;