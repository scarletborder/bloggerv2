import React, { useRef, useState, useCallback } from 'react';
import { usePagination, useUpdateEffect } from 'ahooks';
import GetPostList from '../../services/PostList';
import PostListItem from './PostListItem';
import PostListPageToggle from './PostListPageToggle';
import { getCurrentTheme } from '../../constants/colors';

interface PostListProps { }

export default function PostList({ }: PostListProps) {
  const colors = getCurrentTheme();
  const postListRef = useRef<HTMLDivElement>(null);
  const [displayedItemsCount, setDisplayedItemsCount] = useState(0);

  const { data, loading, pagination } = usePagination(
    ({ current, pageSize }) => {
      // 计算当前应该传递的 startIndex
      const startIndex = current === 1 ? 0 : displayedItemsCount;

      return GetPostList({
        current,
        pageSize,
        startIndex,
      });
    },
    {
      cacheKey: 'postList',
      defaultPageSize: 10,
    },
  );

  // 更新已显示的文章数量
  const updateDisplayedCount = useCallback(() => {
    if (data?.list) {
      const currentPageItems = data.list.length;
      const totalDisplayed = (pagination.current - 1) * pagination.pageSize + currentPageItems;
      setDisplayedItemsCount(totalDisplayed);
    }
  }, [data, pagination.current, pagination.pageSize]);

  // 当数据变化时更新计数
  useUpdateEffect(() => {
    updateDisplayedCount();
  }, [data, updateDisplayedCount]);

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
        onPrevious={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
        onNext={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
      />
    </div>
  );
}