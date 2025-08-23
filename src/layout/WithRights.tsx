import React from 'react';
import { useTheme } from 'ahooks';
import { isMobile } from 'react-device-detect';

interface WithRightsProps {
  children: React.ReactNode;
  copyrightText?: string;
  companyName?: string;
  links?: { name: string; url: string }[];
}

const WithRights: React.FC<WithRightsProps> = ({
  children,
  copyrightText = `© ${new Date().getFullYear()} 版权所有`,
  companyName = "Your Company",
  links = [
    { name: "隐私政策", url: "/privacy" },
    { name: "服务条款", url: "/terms" },
    { name: "联系我们", url: "/contact" }
  ]
}) => {
  const { theme } = useTheme();

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'inherit', // 继承而不是覆盖
    color: 'inherit', // 继承而不是覆盖
  };

  const mainContentStyles: React.CSSProperties = {
    flex: 1,
    width: '100%',
  };

  const footerStyles: React.CSSProperties = {
    backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f5f5f5',
    borderTop: '1px solid var(--border-color)',
    padding: isMobile ? '20px 16px' : '24px 48px',
    marginTop: 'auto',
    color: theme === 'dark' ? '#888888' : '#666666',
  };

  const footerContentStyles: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
    gap: isMobile ? '16px' : '32px',
    alignItems: isMobile ? 'center' : 'flex-start',
    textAlign: isMobile ? 'center' : 'left',
  };

  const sectionStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-color)',
    marginBottom: '8px',
  };

  const linkStyles: React.CSSProperties = {
    color: 'inherit',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
  };

  const linkHoverStyles: React.CSSProperties = {
    ...linkStyles,
    color: 'var(--primary-color)',
  };

  const copyrightStyles: React.CSSProperties = {
    fontSize: '14px',
    color: 'inherit',
    lineHeight: '1.4',
  };

  const companyStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-color)',
    marginBottom: '4px',
  };

  const [hoveredLink, setHoveredLink] = React.useState<string | null>(null);

  return (
    <div style={containerStyles}>
      <main style={mainContentStyles}>
        {children}
      </main>
      <footer style={footerStyles}>
        <div style={footerContentStyles}>
          {/* 第一列：公司信息 */}
          <div style={sectionStyles}>
            <div style={companyStyles}>{companyName}</div>
            <div style={copyrightStyles}>{copyrightText}</div>
          </div>

          {/* 第二列：快速链接 (PC端显示) */}
          {!isMobile && (
            <div style={sectionStyles}>
              <div style={titleStyles}>快速链接</div>
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  style={hoveredLink === link.name ? linkHoverStyles : linkStyles}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          )}

          {/* 第三列：联系信息 (PC端显示) */}
          {!isMobile && (
            <div style={sectionStyles}>
              <div style={titleStyles}>联系方式</div>
              <div style={copyrightStyles}>
                邮箱: contact@example.com
              </div>
              <div style={copyrightStyles}>
                电话: +86 123 4567 8901
              </div>
            </div>
          )}

          {/* 移动端：简化的链接显示 */}
          {isMobile && (
            <div style={{ ...sectionStyles, flexDirection: 'row', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  style={hoveredLink === link.name ? linkHoverStyles : linkStyles}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default WithRights;