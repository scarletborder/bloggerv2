import React, { useRef, useState, useEffect } from 'react';
import { useVirtualList, useLatest } from 'ahooks';
import { isMobile } from 'react-device-detect';
import { GetPostLegacyComments } from '../../../services/BloggerComment';
import { getCurrentTheme } from '../../../constants/colors';
import { CommentItemComponent } from './Item';
import type { CommentsState } from './types';
import type { SetState } from 'ahooks/lib/useSetState';
import type { CommentItem } from '../../../models/CommentItem';

type CommentListProps = {
  Ctx: CommentsState;
  setCtx: SetState<CommentsState>;
  ClickReplyButton: () => void;
}

export default function CommentList({ Ctx, setCtx, ClickReplyButton }: CommentListProps) {
  const colors = getCurrentTheme();
  const { postId } = Ctx;
  const latestPostId = useLatest(postId);

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [allComments, setAllComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // useVirtualList Hook 仅在桌面端有意义，但我们可以在这里保留其定义
  const [virtualList] = useVirtualList(allComments, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: 110,
    overscan: 10,
  });

  const fetchAllComments = async () => {
    if (!latestPostId.current) {
      setAllComments([]);
      setCtx({ totalComments: 0, loading: false });
      setLoading(false);
      return;
    }
    setLoading(true);
    // 更新上层 context 的 loading 状态
    setCtx(prev => ({ ...prev, loading: true }));

    try {
      const result = await GetPostLegacyComments({ postId: latestPostId.current });
      setAllComments(result.items);
      setCtx(prev => ({ ...prev, totalComments: result.total, loading: false }));
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setAllComments([]);
      setCtx(prev => ({ ...prev, totalComments: 0, loading: false }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComments();
  }, [postId]);


  const scrollAreaStyles: React.CSSProperties = {
    // 桌面端样式保持不变，移动端样式将不再直接使用在这个容器上
    height: '600px',
    overflowY: 'auto',
    paddingRight: '8px',
  };

  const emptyStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 20px',
    color: colors.textSecondary,
    fontSize: '16px',
  };

  if (loading) {
    return (
      <div style={emptyStyles}>
        正在加载评论...
      </div>
    );
  }

  // ==================== 修改开始 (JSX 渲染逻辑) ====================
  return (
    <>
      {allComments.length === 0 ? (
        <div style={emptyStyles}>
          暂无评论，快来抢沙发吧！
        </div>
      ) : (
        // 根据是否为移动端进行条件渲染
        isMobile ? (
          // --- 移动端：渲染完整列表 ---
          // 不需要 ref，也不需要固定的高度和滚动样式
          <div>
            {allComments.map((comment) => (
              <CommentItemComponent
                key={comment.timeStamp}
                comment={comment}
                setCtx={setCtx}
                ClickReplyButton={ClickReplyButton}
              />
            ))}
          </div>
        ) : (
          // --- 桌面端：使用虚拟列表 ---
          <div ref={containerRef} style={scrollAreaStyles}>
            <div ref={wrapperRef}>
              {virtualList.map((ele) => (
                <div key={ele.data.timeStamp}>
                  <CommentItemComponent
                    comment={ele.data}
                    setCtx={setCtx}
                    ClickReplyButton={ClickReplyButton}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </>
  );
  // ==================== 修改结束 (JSX 渲染逻辑) ====================
}