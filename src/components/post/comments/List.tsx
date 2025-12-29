import React, { useState, useEffect } from 'react';
import { useLatest } from 'ahooks';
import { GetPostLegacyComments } from '../../../services/BloggerComment';
import { getCurrentTheme } from '../../../constants/colors';
import { CommentItemComponent } from './Item';
import type { CommentsState } from './types';
import type { SetState } from 'ahooks/lib/useSetState';
import type { CommentItem } from '../../../models/CommentItem';
import { usePaginationUrl } from '../../../hooks/usePaginationUrl';
import { Pagination } from 'tdesign-react';

type CommentListProps = {
  Ctx: CommentsState;
  setCtx: SetState<CommentsState>;
  ClickReplyButton: () => void;
};

export default function CommentList({
  Ctx,
  setCtx,
  ClickReplyButton,
}: CommentListProps) {
  const colors = getCurrentTheme();
  const { postId } = Ctx;
  const latestPostId = useLatest(postId);

  const { startIndex, pageSize, updateUrl } = usePaginationUrl({
    defaultStartIndex: 1,
    defaultPageSize: 10,
  });

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchComments = async (page: number, size: number) => {
    if (!latestPostId.current) {
      setComments([]);
      setTotal(0);
      setCtx({ totalComments: 0, loading: false });
      setLoading(false);
      return;
    }
    setLoading(true);
    // 更新上层 context 的 loading 状态
    setCtx(prev => ({ ...prev, loading: true }));

    try {
      const result = await GetPostLegacyComments({
        postId: latestPostId.current,
        startIndex: (page - 1) * size + 1, // Blogger API startIndex 从1开始
        maxResults: size,
      });
      setComments(result.items);
      setTotal(result.total);
      setCtx(prev => ({
        ...prev,
        totalComments: result.total,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
      setTotal(0);
      setCtx(prev => ({ ...prev, totalComments: 0, loading: false }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(startIndex + 1, pageSize); // startIndex 从0开始，页码从1开始
  }, [postId, startIndex, pageSize]);

  const scrollAreaStyles: React.CSSProperties = {
    // 桌面端样式保持不变，移动端样式将不再直接使用在这个容器上
    maxHeight: 'min(600px, 80vh)',
    minHeight: 'max(10vh, 185px)',
    overflowY: 'scroll',
    paddingRight: '8px',
  };

  const emptyStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 20px',
    color: colors.textSecondary,
    fontSize: '16px',
  };

  const handlePageChange = (pageInfo: { current: number; pageSize: number }) => {
    updateUrl(pageInfo.current - 1, pageInfo.pageSize); // startIndex 从0开始
  };

  if (loading) {
    return <div style={emptyStyles}>正在加载评论...</div>;
  }

  // ==================== 修改开始 (JSX 渲染逻辑) ====================
  return (
    <>
      {comments.length === 0 ? (
        <div style={emptyStyles}>暂无评论，快来抢沙发吧！</div>
      ) : (
        <>
          <div style={scrollAreaStyles}>
            {comments.map(comment => (
              <CommentItemComponent
                key={comment.timeStamp}
                comment={comment}
                setCtx={setCtx}
                ClickReplyButton={ClickReplyButton}
              />
            ))}
          </div>
          <Pagination
            current={startIndex + 1}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showJumper
            showPageSize
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </>
      )}
    </>
  );
  // ==================== 修改结束 (JSX 渲染逻辑) ====================
}
