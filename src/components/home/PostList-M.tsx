import React, { useRef, useCallback } from 'react';
import { usePagination, useUpdateEffect } from 'ahooks';
import { Link } from 'react-router-dom';
import GetPostList from '../../services/PostList';
import { getCurrentTheme } from '../../constants/colors';
import { usePaginationUrl } from '../../hooks';
import { type PostItem as MobilePostItemProps } from '../../models/PostItem';

interface PostListMobileProps { }

function MobilePostItem({ path, title, tags, summary, published }: MobilePostItemProps) {
  const colors = getCurrentTheme();

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // 为每个tag生成不同的颜色
  const getTagColor = (index: number): string => {
    const tagColors = [
      '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
      '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
    ];
    return tagColors[index % tagColors.length];
  };

  const cardOuterStyles: React.CSSProperties = {
    backgroundColor: colors.surface,
    borderRadius: '12px',
    margin: '0 auto 20px',
    boxShadow: colors.shadow,
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: `1px solid ${colors.border}`,
  };

  const cardLinkStyles: React.CSSProperties = {
    textDecoration: 'none',
    display: 'block',
    color: 'inherit',
  };

  const titleStyles: React.CSSProperties = {
    padding: '15px 15px 5px',
    margin: '0',
    fontSize: '20px',
    color: colors.text,
    fontWeight: 'bold',
    lineHeight: '1.3',
  };

  const contentStyles: React.CSSProperties = {
    padding: '0 15px 15px',
  };

  const summaryStyles: React.CSSProperties = {
    color: colors.textSecondary,
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '10px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const footerStyles: React.CSSProperties = {
    backgroundColor: colors.background,
    padding: '10px 15px',
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  };

  const dateInfoStyles: React.CSSProperties = {
    fontSize: '12px',
    color: colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  };

  const tagsContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    alignItems: 'center',
  };

  const tagStyles = (index: number): React.CSSProperties => ({
    fontSize: '11px',
    padding: '3px 8px',
    backgroundColor: getTagColor(index),
    color: '#ffffff',
    borderRadius: '12px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  });

  return (
    <div>
      <div style={cardOuterStyles}>
        <Link to={`/${path}`} style={cardLinkStyles}>
          <h3 style={titleStyles}>
            {title}
          </h3>
          <div style={contentStyles}>
            <div style={summaryStyles}>
              {summary}
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </Link>

        <div style={footerStyles}>
          <div style={dateInfoStyles}>
            <span>发布于 {formatDate(published)}</span>
          </div>

          {tags.length > 0 && (
            <div style={tagsContainerStyles}>
              {tags.map((tag, index) => (
                <span key={index} style={tagStyles(index)}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobilePageToggle({
  current,
  total,
  pageSize,
  displayedItemsCount,
  onPrevious,
  onNext
}: {
  current: number;
  total: number;
  pageSize: number;
  displayedItemsCount: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const colors = getCurrentTheme();

  const canGoPrevious = current > 1;
  const totalDisplayed = (current - 1) * pageSize + displayedItemsCount;
  const canGoNext = totalDisplayed < total;

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 12px',
    marginTop: '24px',
  };

  const buttonStyles: React.CSSProperties = {
    flex: '1',
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: '600',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: '8px',
    backgroundColor: colors.surface,
    color: colors.text,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  };

  const disabledButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: colors.border,
    color: colors.textSecondary,
    cursor: 'not-allowed',
    opacity: 0.6,
  };

  const activeButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: colors.primary,
    color: '#ffffff',
    borderColor: colors.primary,
  };

  const pageInfoStyles: React.CSSProperties = {
    fontSize: '14px',
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
    minWidth: '80px',
  };

  return (
    <div style={containerStyles}>
      <button
        style={canGoPrevious ? activeButtonStyles : disabledButtonStyles}
        onClick={onPrevious}
        disabled={!canGoPrevious}
      >
        ← 上一页
      </button>

      <div style={pageInfoStyles}>
        第 {current} 页
      </div>

      <button
        style={canGoNext ? activeButtonStyles : disabledButtonStyles}
        onClick={onNext}
        disabled={!canGoNext}
      >
        下一页 →
      </button>
    </div>
  );
}

export default function PostListMobile({ }: PostListMobileProps) {
  const colors = getCurrentTheme();
  const postListRef = useRef<HTMLDivElement>(null);

  // 使用URL参数同步分页状态 - 必须在组件顶层调用
  const { startIndex: urlStartIndex, pageSize: urlPageSize, updateUrl } = usePaginationUrl({
    defaultStartIndex: 0,
    defaultPageSize: 10,
  });

  // 计算初始页码
  const initialCurrent = Math.floor(urlStartIndex / urlPageSize) + 1;

  const { data, loading, pagination } = usePagination(
    ({ current, pageSize }) => {
      // 使用URL中的startIndex或根据当前页计算
      const startIndex = current === initialCurrent ? urlStartIndex : (current - 1) * pageSize;

      return GetPostList({
        current,
        pageSize,
        startIndex,
      });
    },
    {
      cacheKey: 'postList',
      defaultCurrent: initialCurrent,
      defaultPageSize: urlPageSize,
    },
  );

  // 监听分页变化，滚动到组件顶部
  useUpdateEffect(() => {
    if (postListRef.current) {
      postListRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [pagination.current]);

  // 格式化月份标题
  const formatMonthTitle = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year} 年 ${month} 月`;
  };

  // 检查是否需要显示月份标题
  const shouldShowMonthTitle = (currentPost: any, index: number): boolean => {
    if (index === 0) return true; // 第一篇文章总是显示

    const prevPost = data?.list[index - 1];
    if (!prevPost) return true;

    const currentDate = new Date(currentPost.published);
    const prevDate = new Date(prevPost.published);

    return (
      currentDate.getFullYear() !== prevDate.getFullYear() ||
      currentDate.getMonth() !== prevDate.getMonth()
    );
  };

  // 处理分页变化的回调函数
  const handlePageChange = useCallback((newCurrent: number, newPageSize: number) => {
    // 计算新的startIndex
    const newStartIndex = (newCurrent - 1) * newPageSize;
    // 更新URL参数
    updateUrl(newStartIndex, newPageSize);
    // 更新分页状态
    pagination.onChange(newCurrent, newPageSize);
  }, [updateUrl, pagination]);

  const containerStyles: React.CSSProperties = {
    maxWidth: '100%',
    margin: '0',
    padding: '12px',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '20px',
    color: colors.text,
    textAlign: 'center',
    padding: '0 12px',
  };

  const loadingStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 12px',
    color: colors.textSecondary,
    fontSize: '16px',
  };

  const emptyStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 12px',
    color: colors.textSecondary,
    fontSize: '16px',
  };

  const listStyles: React.CSSProperties = {
    marginBottom: '20px',
  };

  const monthTitleStyles: React.CSSProperties = {
    textAlign: 'center',
    margin: '15px 0 10px',
    fontSize: '18px',
    color: colors.primary,
    fontWeight: 'bold',
  };

  if (loading && !data) {
    return (
      <div ref={postListRef} style={containerStyles}>
        <h2 style={titleStyles}>最新文章</h2>
        <div style={loadingStyles}>正在加载文章...</div>
      </div>
    );
  }

  if (!data || !data.list || data.list.length === 0) {
    return (
      <div ref={postListRef} style={containerStyles}>
        <h2 style={titleStyles}>最新文章</h2>
        <div style={emptyStyles}>暂无文章</div>
      </div>
    );
  }

  return (
    <div ref={postListRef} style={containerStyles}>
      <h2 style={titleStyles}>最新文章</h2>

      <div style={listStyles}>
        {data.list.map((post, index) => (
          <React.Fragment key={`${post.path}-${index}`}>
            {shouldShowMonthTitle(post, index) && (
              <div style={monthTitleStyles}>
                <span>{formatMonthTitle(post.published)}</span>
              </div>
            )}
            <MobilePostItem
              path={post.path}
              title={post.title}
              tags={post.tags}
              summary={post.summary}
              published={post.published}
            />
          </React.Fragment>
        ))}
      </div>

      <MobilePageToggle
        current={pagination.current}
        total={data.total}
        pageSize={pagination.pageSize}
        displayedItemsCount={data.list.length}
        onPrevious={() => handlePageChange(pagination.current - 1, pagination.pageSize)}
        onNext={() => handlePageChange(pagination.current + 1, pagination.pageSize)}
      />
    </div>
  );
}
