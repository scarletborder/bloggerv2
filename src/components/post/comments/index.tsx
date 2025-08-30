import { useSetState } from "ahooks";
import type { CommentsState } from "./types";
import { isMobile } from "react-device-detect";
import { getCurrentTheme } from "../../../constants/colors";
import CommentList from "./List";
import { CommentForm } from "./Form";
import React, { useRef } from 'react'; // 1. 引入 useRef

interface CommentAreaProps {
  postId: string;
  blogId: string;
}

export default function CommentArea({ postId, blogId }: CommentAreaProps) {
  const colors = getCurrentTheme();
  // 为评论表单创建一个 ref
  const formRef = useRef<HTMLDivElement>(null);

  // 状态：当前正在回复的评论ID
  const [state, setState] = useSetState<CommentsState>({
    postId,
    blogId,
    replyToId: null,
    loading: true,
    totalComments: 0,
    refreshKey: 0, // 初始值为 0
  });

  // 定义一个传递给 CommentForm 的刷新函数
  // 这个函数将更新 refreshKey，从而触发 CommentList 的刷新
  const triggerRefresh = () => {
    setState(prev => ({
      replyToId: null, // 提交后清除回复目标
      refreshKey: (prev.refreshKey || 0) + 1, // 增加 refreshKey
    }));
  };

  // 2. "发表评论" 按钮的点击处理函数
  const handlePostCommentClick = () => {
    // 3. 平滑滚动到 ref 指向的元素（评论表单）
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };


  const CommentsListComp = <CommentList Ctx={state} setCtx={setState} />;
  // 对 CommentFormComp 的引用保持不变
  const CommentFormComp = <CommentForm Ctx={state} setCtx={setState} onCommentSubmitted={triggerRefresh} />;

  const containerStyles: React.CSSProperties = {
    marginTop: '32px',
    padding: isMobile ? '0px' : '24px',
    backgroundColor: colors.background,
    borderRadius: isMobile ? '0' : '16px',
    border: isMobile ? 'none' : `1px solid ${colors.border}`,
  };


  const countStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'normal',
    color: colors.textSecondary,
  };


  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? '20px' : '24px',
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // 5. 让标题和按钮分布在两端
    gap: '8px',
  };

  const loadingStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '20px',
    color: colors.textSecondary,
    fontSize: '14px',
  };

  const postButtonStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'normal',
    padding: '8px 16px',
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  };


  return (
    <div style={containerStyles}>
      {state.loading ?
        <div style={loadingStyles}>正在加载评论...</div> :
        <div style={titleStyles}>
          {/* 标题和评论数组合在一起 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, padding: 0 }}>
              💬 评论区
            </h3>
            {state.totalComments > 0 && (
              <span style={countStyles}>({state.totalComments} 条评论)</span>
            )}
          </div>
          {/* 右侧的新按钮 */}
          <button style={postButtonStyle} onClick={handlePostCommentClick}>
            发表评论
          </button>
        </div>}

      {CommentsListComp}

      {/* 4. 将 CommentFormComp 包裹在带 ref 的 div 中 */}
      <div ref={formRef}>
        {CommentFormComp}
      </div>
    </div>
  );
}