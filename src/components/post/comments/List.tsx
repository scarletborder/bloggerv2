import React, { useRef, useState, useEffect } from 'react';
import { useInfiniteScroll, useLatest, useUpdateEffect } from 'ahooks';
import { isMobile } from 'react-device-detect';
// 引入新的服务函数
import { GetPostLegacyComments, GetNewestComments } from '../../../services/BloggerComment';
import { getCurrentTheme } from '../../../constants/colors';
import { CommentItemComponent } from './Item';
import type { CommentsState } from './types';
import type { SetState } from 'ahooks/lib/useSetState';
import type { CommentItem } from '../../../models/CommentItem'; // 确保引入类型

type CommentListProps = {
  Ctx: CommentsState;
  setCtx: SetState<CommentsState>;
}

export default function CommentList({ Ctx, setCtx }: CommentListProps) {
  const colors = getCurrentTheme();
  const { postId, refreshKey } = Ctx;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const latestPostId = useLatest(postId);

  // ==================== 修改开始 ====================

  // 新增 State: 用于存放用户提交后，新拉取到的评论
  const [newComments, setNewComments] = useState<CommentItem[]>([]);

  // Ref: 用于跟踪当前显示的所有评论中的最新时间戳
  const latestTimestampRef = useRef<number>(0);

  // ahooks 无限滚动逻辑保持不变，它只负责处理"旧评论"
  const {
    data: legacyCommentsData,
    loading: legacyLoading,
    loadingMore,
    noMore,
    reload: legacyReload,
  } = useInfiniteScroll(
    async (d) => {
      // ... (这个函数的内部逻辑保持不变)
      if (!latestPostId.current) {
        return { list: [], noMore: true, total: 0 };
      }
      const startIndex = d?.list ? d.list.length : 0;
      const result = await GetPostLegacyComments({
        postId: latestPostId.current,
        startIndex,
        pageSize: 10,
      });
      if (startIndex === 0) {
        setCtx({ totalComments: result.total, loading: false });
      }
      const currentTotal = (d?.list?.length || 0) + result.items.length;
      return {
        list: result.items,
        noMore: currentTotal >= result.total,
        total: result.total,
      };
    },
    {
      target: isMobile ? undefined : scrollContainerRef,
      isNoMore: (d) => d?.noMore === true,
      threshold: 100,
    }
  );

  // 合并新旧评论用于渲染
  const allComments = [...newComments, ...(legacyCommentsData?.list || [])];

  // 每次渲染后，更新最新的时间戳
  useEffect(() => {
    if (allComments.length > 0) {
      // 我们的列表是新的在前，所以第一个就是最新的
      const maxTimestamp = Math.max(...allComments.map(c => c.timeStamp));
      latestTimestampRef.current = maxTimestamp;
    }
  }, [allComments]);

  // 这是新的核心逻辑：监听 refreshKey 的变化来获取"新"评论
  useUpdateEffect(() => {
    // refreshKey > 0 确保了首次加载时不触发
    if (refreshKey > 0 && latestTimestampRef.current > 0) {
      const fetchNew = async () => {
        const newlyFetched = await GetNewestComments({
          postId: latestPostId.current,
          minTimestamp: latestTimestampRef.current,
        });

        if (newlyFetched.length > 0) {
          // 将新获取的评论追加到 newComments 数组的开头
          setNewComments(prev => [...newlyFetched, ...prev]);
          // 更新总数
          setCtx(prev => ({ totalComments: (prev.totalComments || 0) + newlyFetched.length }));
        }
      };
      fetchNew();
    }
  }, [refreshKey]);


  // 当 postId 改变时，重置所有状态并重新加载
  useUpdateEffect(() => {
    if (postId) {
      setNewComments([]); // 清空新评论
      latestTimestampRef.current = 0; // 重置时间戳
      setCtx({ loading: true, totalComments: 0 });
      legacyReload(); // 重新加载旧评论
    }
  }, [postId]);

  // ==================== 修改结束 ====================

  const scrollAreaStyles: React.CSSProperties = {
    maxHeight: isMobile ? 'none' : '600px',
    overflowY: isMobile ? 'visible' : 'auto',
    paddingRight: isMobile ? '0' : '8px',
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

  return (
    <>
      {/* 现在判断 allComments */}
      {allComments.length === 0 && !legacyLoading ? (
        <div style={emptyStyles}>
          暂无评论，快来抢沙发吧！
        </div>
      ) : (
        <div ref={scrollContainerRef} style={scrollAreaStyles}>
          {/* 渲染合并后的列表 */}
          {allComments.map((comment, index) => (
            <CommentItemComponent
              key={`${comment.timeStamp}-${index}`}
              comment={comment}
              setCtx={setCtx}
            />
          ))}

          {/* loading 和 noMore 仍然由 useInfiniteScroll 控制 */}
          {loadingMore && (
            <div style={loadMoreStyles}>
              正在加载更多评论...
            </div>
          )}

          {noMore && allComments.length > 0 && (
            <div style={loadMoreStyles}>
              已显示全部评论
            </div>
          )}
        </div>
      )}
    </>
  );
}