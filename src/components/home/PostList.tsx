import React, { useRef, useCallback } from 'react';
import { usePagination, useUpdateEffect } from 'ahooks';
import GetPostList from '../../services/PostList';
import PostListItem from './PostListItem';
import PostListPageToggle from './PostListPageToggle';
import { getCurrentTheme } from '../../constants/colors';
import { usePaginationUrl } from '../../hooks';

interface PostListProps { }

export default function PostList({ }: PostListProps) {
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

  // 处理分页变化的回调函数
  const handlePageChange = useCallback((newCurrent: number, newPageSize: number) => {
    // 计算新的startIndex
    const newStartIndex = (newCurrent - 1) * newPageSize;
    // 更新URL参数
    updateUrl(newStartIndex, newPageSize);
    // 更新分页状态
    pagination.onChange(newCurrent, newPageSize);
  }, [updateUrl, pagination]);

  // 监听分页变化，滚动到组件顶部
  useUpdateEffect(() => {
    if (postListRef.current) {
      postListRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [pagination.current]);

  const containerStyles: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '24px',
    color: colors.text,
    textAlign: 'center',
  };

  const loadingStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px',
    color: colors.textSecondary,
    fontSize: '16px',
  };

  const emptyStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px',
    color: colors.textSecondary,
    fontSize: '16px',
  };

  const listStyles: React.CSSProperties = {
    marginBottom: '20px',
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
          <PostListItem
            key={`${post.path}-${index}`}
            path={post.path}
            title={post.title}
            tags={post.tags}
            summary={post.summary}
            published={post.published}
          />
        ))}
      </div>

      <PostListPageToggle
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