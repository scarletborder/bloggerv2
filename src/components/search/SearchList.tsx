// src/components/search/SearchList.tsx
import React from 'react';
import { isMobile } from 'react-device-detect';
import { useMemoizedFn } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import { getCurrentTheme } from '../../constants/colors';
import { type PostItem } from '../../models/PostItem';

interface SearchListProps {
  data: { list: PostItem[] } | undefined;
  loadingMore: boolean;
  noMore: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export default function SearchList({
  data,
  loadingMore,
  noMore,
  scrollContainerRef,
}: SearchListProps) {
  const colors = getCurrentTheme();
  const navigate = useNavigate();

  const handlePostClick = useMemoizedFn((postPath: string) => {
    navigate(`/${postPath}`);
  });

  const formatDate = (timestamp: number): string => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
      2,
      '0',
    )}/${String(d.getDate()).padStart(2, '0')}`;
  };

  const tagStyles = (index: number): React.CSSProperties => {
    const tagColors = [
      '#007bff',
      '#28a745',
      '#dc3545',
      '#ffc107',
      '#17a2b8',
      '#6f42c1',
      '#e83e8c',
      '#fd7e14',
      '#20c997',
      '#6c757d',
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
          <span style={moreTagsStyles}>+{tags.length - 3}</span>
        )}
      </div>
    );
  };

  const scrollContainerStyles: React.CSSProperties = {
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: isMobile ? '0' : '0 16px 0 0', // PC端增加padding避免滚动条遮挡
  };

  const moreTagsStyles: React.CSSProperties = {
    fontSize: isMobile ? '10px' : '11px',
    padding: isMobile ? '2px 6px' : '3px 8px',
    backgroundColor: colors.textSecondary,
    color: '#ffffff',
    borderRadius: '10px',
    fontWeight: '500',
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

  const loadingMoreStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '16px',
    color: colors.textSecondary,
    fontSize: '14px',
    marginTop: '8px',
  };

  const noMoreStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '16px',
    color: colors.textSecondary,
    fontSize: '14px',
    marginTop: '8px',
  };

  return (
    <div ref={scrollContainerRef} style={scrollContainerStyles}>
      {data?.list.map((post, index) => (
        <div
          key={`${post.path}-${index}`}
          style={postItemStyles}
          onMouseEnter={(e) => {
            if (!isMobile) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 6px 12px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isMobile) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
          onClick={() => handlePostClick(post.path)}
        >
          <h4 style={postTitleStyles}>{post.title}</h4>
          <p style={postSummaryStyles}>{post.summary}</p>
          <div style={postMetaStyles}>
            <span style={postDateStyles}>📅 {formatDate(post.published)}</span>
            {formatTags(post.tags)}
          </div>
        </div>
      ))}

      {loadingMore && <div style={loadingMoreStyles}>正在加载更多文章...</div>}

      {noMore && data?.list && data.list.length > 0 && (
        <div style={noMoreStyles}>已显示全部文章</div>
      )}
    </div>
  );
}
