import { useSetState } from "ahooks";
import type { CommentsState } from "./types";
import { isMobile } from "react-device-detect";
import { getCurrentTheme } from "../../../constants/colors";
import CommentList from "./List";
import { CommentForm } from "./Form";

interface CommentAreaProps {
  postId: string;
  blogId: string;
}

export default function CommentArea({ postId, blogId }: CommentAreaProps) {
  const colors = getCurrentTheme();
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

  const CommentsListComp = <CommentList Ctx={state} setCtx={setState} />;
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
    gap: '8px',
  };

  const loadingStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '20px',
    color: colors.textSecondary,
    fontSize: '14px',
  };





  return (
    <div style={containerStyles}>
      {state.loading ?
        <div style={loadingStyles}>正在加载评论...</div> :
        <h3 style={titleStyles}>
          💬 评论区
        </h3>}


      {state.totalComments > 0 && (
        <span style={countStyles}>({state.totalComments} 条评论)</span>
      )}

      {CommentsListComp}
      {CommentFormComp}
    </div>
  );
}
