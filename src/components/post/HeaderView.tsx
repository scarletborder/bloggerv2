import React from 'react';
import { isMobile } from 'react-device-detect';
import { useNavigate } from 'react-router-dom';

interface HeaderViewProps {
  title: string;
  published: string;
  updated?: string;
  tags: string[];
}

/**
 * 文章头部组件 - 显示标题、发布时间、更新时间和标签
 */
const HeaderView: React.FC<HeaderViewProps> = ({ title, published, updated, tags }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const headerStyles: React.CSSProperties = {
    marginBottom: isMobile ? '20px' : '32px',
    paddingBottom: isMobile ? '16px' : '24px',
    borderBottom: `2px solid var(--border-color)`,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? '1.8rem' : '2.5rem',
    fontWeight: 'bold',
    color: 'var(--text-color)',
    margin: 0,
    marginBottom: isMobile ? '12px' : '16px',
    lineHeight: 1.2,
    wordBreak: 'break-word',
  };

  const metaContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '8px' : '16px',
    marginBottom: isMobile ? '12px' : '16px',
    fontSize: isMobile ? '14px' : '15px',
    color: 'var(--text-secondary-color)',
  };

  const metaItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const tagsContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: isMobile ? '6px' : '8px',
    marginTop: isMobile ? '8px' : '12px',
  };

  const tagStyles: React.CSSProperties = {
    display: 'inline-block',
    padding: isMobile ? '4px 8px' : '6px 12px',
    backgroundColor: 'var(--surface-color)',
    color: 'var(--primary-color)',
    border: '1px solid var(--primary-color)',
    borderRadius: '16px',
    fontSize: isMobile ? '12px' : '13px',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const tagHoverStyles = `
    .post-tag:hover {
      background-color: var(--primary-color);
      color: var(--surface-color);
      transform: translateY(-1px);
      box-shadow: var(--shadow-color) 0px 2px 4px;
    }
  `;

  return (
    <>
      <style>{tagHoverStyles}</style>
      <header style={headerStyles}>
        <h1 style={titleStyles}>{title}</h1>

        <div style={metaContainerStyles}>
          <div style={metaItemStyles}>
            <span>📅</span>
            <span>发布于 {formatDate(published)}</span>
          </div>

          {updated && updated !== published && (
            <div style={metaItemStyles}>
              <span>🔄</span>
              <span>更新于 {formatDate(updated)}</span>
            </div>
          )}
        </div>

        {tags.length > 0 && (
          <div style={tagsContainerStyles}>
            {tags.map((tag, index) => (
              <span
                key={index}
                className="post-tag"
                style={tagStyles}
                onClick={() => {
                  console.log('Search for tag:', tag);
                  navigate(`/archives?tag=${tag}`);
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>
    </>
  );
};

export default HeaderView;
