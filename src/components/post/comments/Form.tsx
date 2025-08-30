import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { useBoolean } from 'ahooks';
// 不再需要 Timeout 类型
// import type { Timeout } from 'ahooks/lib/useRequest/src/types'; 
import type { CommentsState } from './types';
import type { SetState } from 'ahooks/lib/useSetState';

type CommentFormProps = {
  Ctx: CommentsState;
  setCtx: SetState<CommentsState>;
}

export const CommentForm: React.FC<CommentFormProps> = ({ Ctx, setCtx }) => {
  const { blogId, postId, replyToId } = Ctx;

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, { set: setIsSubmitting }] = useBoolean(false);

  // 使用一个 Ref 来确保 focus 事件处理函数只被有效执行一次
  const isWaitingForPopupClose = useRef(false);

  useEffect(() => {
    setCommentText('');
  }, [replyToId]);

  // 新增 Effect 来处理 focus 事件的监听和清理
  useEffect(() => {
    const handleFocus = () => {
      // 只有当我们确实在等待弹出窗口关闭时，才响应 focus 事件
      if (isWaitingForPopupClose.current) {
        console.log('主窗口获得焦点，判定评论流程结束，触发刷新...');
        isWaitingForPopupClose.current = false; // 重置标志
        window.location.reload(); // 刷新页面以加载新评论
      }
    };

    // 添加事件监听
    window.addEventListener('focus', handleFocus);

    // 组件卸载时，清理监听器
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
    // onCommentSubmitted 和 setIsSubmitting 是函数，通常是稳定的，但为了严谨可以加入依赖
  }, [setIsSubmitting]);

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!commentText.trim()) {
      alert('请输入评论内容！');
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await navigator.clipboard.writeText(commentText);
    } catch (err) {
      console.error('自动复制失败:', err);
    }

    const editorBaseUrl = 'https://www.blogger.com/comment/frame/';
    let finalUrl = `${editorBaseUrl}${blogId}?po=${postId}&hl=zh-CN&origin=${window.location.origin}`;
    if (replyToId) {
      finalUrl += `&parentID=${replyToId}`;
    }

    const popupOptions = 'width=600,height=550,resizable=yes,scrollbars=yes';
    const popup = window.open(finalUrl, `blogger-comment-${Date.now()}`, popupOptions);

    if (!popup) {
      alert('评论窗口被浏览器拦截，请允许弹出窗口后重试。');
      setIsSubmitting(false);
      return;
    }

    // 不再使用 setInterval 轮询，而是设置一个标志，告诉 focus 监听器我们正在等待
    isWaitingForPopupClose.current = true;
  };

  const handleCancelReply = () => {
    setCtx({ replyToId: null });
  };

  return (
    <div className="comment-form-container">
      <h3>
        {replyToId ? '正在回复...' : '发表新评论'}
      </h3>
      <textarea
        placeholder="在此输入您的评论..."
        rows={6}
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}
      />
      <div className="form-actions" style={{ marginTop: '10px' }}>
        <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '等待窗口关闭...' : '发布评论 (内容已复制)'}
        </button>
        {replyToId && (
          <button type="button" onClick={handleCancelReply} style={{ marginLeft: '10px' }}>
            取消回复
          </button>
        )}
      </div>
      <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
        <strong>提示：</strong>点击发布后，您的评论内容将<strong>自动复制</strong>。
        请在弹出的新窗口中<strong>粘贴 (Ctrl+V)</strong>并完成发布。
      </p>
    </div>
  );
};