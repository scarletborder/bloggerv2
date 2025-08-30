import React, { useRef, useState } from 'react';
import { useInfiniteScroll, useLatest, useUpdateEffect } from 'ahooks';
import { isMobile } from 'react-device-detect';
import { GetPostLegacyComments } from '../../../services/LegacyComment';
import { getCurrentTheme } from '../../../constants/colors';
import { CommentItemComponent } from './CommentItem';
import { Seperator } from '../common';

type CommentAreaProps = {
  postId: string;
}

export default function CommentArea({ postId }: CommentAreaProps) {
  const colors = getCurrentTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [totalComments, setTotalComments] = useState<number>(0);

  // 使用useLatest确保在异步回调中获取最新值
  const latestPostId = useLatest(postId);

  // 评论的无限滚动
  const {
    data: commentsData,
    loading: commentsLoading,
    loadMore: _commentsLoadMore,
    loadingMore: commentsLoadingMore,
    noMore: commentsNoMore,
    reload: commentsReload,
  } = useInfiniteScroll(
    async (d) => {
      if (!latestPostId.current) {
        return { list: [], noMore: true };
      }

      const startIndex = d?.list ? d.list.length : 0;
      const result = await GetPostLegacyComments({
        postId: latestPostId.current,
        startIndex,
        pageSize: 10,
      });

      // 仅在首次加载时更新总评论数
      if (startIndex === 0) {
        setTotalComments(result.total);
      }

      const currentTotal = (d?.list?.length || 0) + result.items.length;

      return {
        list: result.items,
        // 根据API返回的总数判断是否还有更多
        noMore: currentTotal >= result.total,
      };
    },
    {
      // 在移动端，滚动目标是整个页面(undefined)，在桌面端是指定的div
      target: isMobile ? undefined : scrollContainerRef,
      isNoMore: (d) => d?.noMore === true,
      // 移除了 manual: true 以启用自动加载
      threshold: 100,
    }
  );

  // 当 postId 改变时重新加载评论
  useUpdateEffect(() => {
    if (postId) {
      setTotalComments(0);
      commentsReload();
    }
  }, [postId]);

  const containerStyles: React.CSSProperties = {
    marginTop: '32px',
    padding: isMobile ? '0px' : '24px',
    backgroundColor: colors.background,
    borderRadius: isMobile ? '0' : '16px',
    border: isMobile ? 'none' : `1px solid ${colors.border}`,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? '20px' : '24px',
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const countStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'normal',
    color: colors.textSecondary,
  };

  const scrollAreaStyles: React.CSSProperties = {
    maxHeight: isMobile ? 'none' : '600px',
    overflowY: isMobile ? 'visible' : 'auto',
    paddingRight: isMobile ? '0' : '8px',
  };

  const loadingStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '20px',
    color: colors.textSecondary,
    fontSize: '14px',
  };

  const emptyStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 20px',
    color: colors.textSecondary,
    fontSize: '16px',
  };

  const loadMoreStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '16px',
    color: colors.textSecondary,
    fontSize: '14px',
  };


  if (commentsLoading && !commentsData?.list?.length) {
    return (
      <div style={containerStyles}>
        {isMobile && <Seperator />}
        <h3 style={titleStyles}>
          💬 评论区
        </h3>
        <div style={loadingStyles}>
          正在加载评论...
        </div>
      </div>
    );
  }

  const commentsList = commentsData?.list || [];

  return (
    <div style={containerStyles}>
      {isMobile && <Seperator />}
      <h3 style={titleStyles}>
        💬 评论区
        {totalComments > 0 && (
          <span style={countStyles}>({totalComments} 条评论)</span>
        )}
      </h3>

      {commentsList.length === 0 && !commentsLoading ? (
        <div style={emptyStyles}>
          暂无评论，快来抢沙发吧！
        </div>
      ) : (
        <div ref={scrollContainerRef} style={scrollAreaStyles}>
          {commentsList.map((comment, index) => (
            <CommentItemComponent key={`${comment.timeStamp}-${index}`} comment={comment} />
          ))}

          {commentsLoadingMore && (
            <div style={loadMoreStyles}>
              正在加载更多评论...
            </div>
          )}

          {commentsNoMore && commentsList.length > 0 && (
            <div style={loadMoreStyles}>
              已显示全部评论
            </div>
          )}
        </div>
      )}
    </div>
  );
}