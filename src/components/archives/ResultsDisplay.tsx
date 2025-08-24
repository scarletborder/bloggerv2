import React, { useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { getCurrentTheme } from '../../constants/colors';

interface PostItem {
  path: string;
  title: string;
  tags: string[];
  summary: string;
  published: number;
}

interface ResultsDisplayProps {
  data: {
    list: PostItem[];
    nextId?: string;
  } | undefined;
  loading: boolean;
  loadMore: () => void;
  loadingMore: boolean;
  noMore: boolean;
  emptyMessage?: string;
}

export default function ResultsDisplay({
  data,
  loading,
  loadMore,
  loadingMore,
  noMore,
  emptyMessage = "暂无文章"
}: ResultsDisplayProps) {
  const colors = getCurrentTheme();
  const ref = useRef<HTMLDivElement>(null);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const formatTags = (tags: string[]): React.ReactNode => {
    if (!tags || tags.length === 0) return null;

    return (
      <div style={tagsContainerStyles}>
        {tags.slice(0, 3).map((tag, index) => (
          <span key={tag} style={tagStyles(index)}>
            {tag}
          </span>
        ))}
        {tags.length > 3 && (
          <span style={moreTagsStyles}>
            +{tags.length - 3}
          </span>
        )}
      </div>
    );
  };

  // 样式定义
  const containerStyles: React.CSSProperties = {
    backgroundColor: colors.surface,
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '16px' : '20px',
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
    height: isMobile ? 'auto' : '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: '700',
    color: colors.text,
    marginBottom: isMobile ? '12px' : '16px',
    textAlign: 'center',
  };

  const scrollContainerStyles: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: isMobile ? '400px' : '500px',
    maxHeight: isMobile ? '600px' : 'unset',
    paddingRight: isMobile ? '0' : '8px',
  };

  const postItemStyles: React.CSSProperties = {
    backgroundColor: colors.background,
    borderRadius: isMobile ? '10px' : '12px',
    margin: isMobile ? '0 0 12px' : '0 0 16px',
    padding: isMobile ? '14px' : '16px',
    border: `1px solid ${colors.border}`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
  };

  const postTitleStyles: React.CSSProperties = {
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '600',
    color: colors.text,
    marginBottom: '8px',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const postSummaryStyles: React.CSSProperties = {
    color: colors.textSecondary,
    fontSize: isMobile ? '13px' : '14px',
    lineHeight: '1.5',
    marginBottom: '10px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const postMetaStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  };

  const postDateStyles: React.CSSProperties = {
    color: colors.textSecondary,
    fontSize: isMobile ? '11px' : '12px',
    fontWeight: '500',
  };

  const tagsContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    alignItems: 'center',
  };

  const tagStyles = (index: number): React.CSSProperties => {
    const tagColors = [
      '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
      '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
    ];
    return {
      fontSize: isMobile ? '10px' : '11px',
      padding: isMobile ? '2px 6px' : '3px 8px',
      backgroundColor: tagColors[index % tagColors.length],
      color: '#ffffff',
      borderRadius: '10px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
    };
  };

  const moreTagsStyles: React.CSSProperties = {
    fontSize: isMobile ? '10px' : '11px',
    padding: isMobile ? '2px 6px' : '3px 8px',
    backgroundColor: colors.textSecondary,
    color: '#ffffff',
    borderRadius: '10px',
    fontWeight: '500',
  };

  const loadingStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px',
    color: colors.textSecondary,
    fontSize: '16px',
  };

  const emptyStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 20px',
    color: colors.textSecondary,
    fontSize: '16px',
  };

  const loadMoreButtonStyles: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '12px 24px',
    marginTop: '16px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const noMoreStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '16px',
    color: colors.textSecondary,
    fontSize: '14px',
    marginTop: '8px',
  };

  if (loading && !data) {
    return (
      <div style={containerStyles}>
        <h3 style={titleStyles}>📄 搜索结果</h3>
        <div style={loadingStyles}>正在搜索文章...</div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <h3 style={titleStyles}>📄 搜索结果</h3>

      <div ref={ref} style={scrollContainerStyles}>
        {!data || !data.list || data.list.length === 0 ? (
          <div style={emptyStyles}>{emptyMessage}</div>
        ) : (
          <>
            {data.list.map((post, index) => (
              <div
                key={`${post.path}-${index}`}
                style={postItemStyles}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                onClick={() => {
                  console.log('Navigate to:', post.path);
                  // 这里可以添加导航逻辑
                }}
              >
                <h4 style={postTitleStyles}>{post.title}</h4>
                <p style={postSummaryStyles}>{post.summary}</p>
                <div style={postMetaStyles}>
                  <span style={postDateStyles}>
                    📅 {formatDate(post.published)}
                  </span>
                  {formatTags(post.tags)}
                </div>
              </div>
            ))}

            {!noMore && (
              <button
                style={loadMoreButtonStyles}
                onClick={loadMore}
                disabled={loadingMore}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.backgroundColor = colors.primaryHover;
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.backgroundColor = colors.primary;
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {loadingMore ? '正在加载...' : '加载更多文章'}
              </button>
            )}

            {noMore && data.list.length > 0 && (
              <div style={noMoreStyles}>
                已显示全部文章
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
