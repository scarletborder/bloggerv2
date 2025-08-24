import React from 'react';
import { isMobile } from 'react-device-detect';


// 全局footer信息对象数组
const FOOTER_SECTIONS = [
  {
    title: '',
    items: [
      'Your Company',
      `© ${new Date().getFullYear()} 版权所有`,
    ],
  },
  {
    title: '联系方式',
    items: [
      '邮箱: contact@example.com',
      '电话: +86 123 4567 8901',
    ],
  },
];

interface WithRightsProps {
  children: React.ReactNode;
}

const WithRights: React.FC<WithRightsProps> = ({
  children,
}) => {

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
    backgroundColor: 'var(--surface-color)',
    borderTop: '1px solid var(--border-color)',
    padding: isMobile ? '20px 16px' : '24px 48px',
    marginTop: 'auto',
    color: 'var(--text-secondary-color)',
  };

  const footerContentStyles: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'center' : 'flex-start',
    gap: isMobile ? '16px' : '32px',
    flexDirection: 'row', // 手机端也横向排布
    flexWrap: isMobile ? 'wrap' : 'nowrap',
  };

  const sectionStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0,
    flex: 1,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-color)',
    marginBottom: '8px',
  };

  const copyrightStyles: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--text-secondary-color)',
    lineHeight: '1.4',
  };

  const companyStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-color)',
    marginBottom: '4px',
  };

  return (
    <div style={containerStyles}>
      <main style={mainContentStyles}>{children}</main>
      <footer style={footerStyles}>
        <div style={footerContentStyles}>
          {FOOTER_SECTIONS.map((section, idx) => (
            <div style={sectionStyles} key={idx}>
              {section.title && <div style={titleStyles}>{section.title}</div>}
              {section.items.map((item, i) => (
                <div
                  style={idx === 0 ? (i === 0 ? companyStyles : copyrightStyles) : copyrightStyles}
                  key={i}
                >
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default WithRights;