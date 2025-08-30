import React, { useEffect, useRef, useState } from 'react';
import { useBoolean } from 'ahooks';
import type { Timeout } from 'ahooks/lib/useRequest/src/types';
import type { CommentsState } from './types';
import type { SetState } from 'ahooks/lib/useSetState';

type CommentFormProps = {
  Ctx: CommentsState;
  setCtx: SetState<CommentsState>;
  onCommentSubmitted: () => void; // 接收来自 CommentArea 的刷新函数
}

/**
 * 优化后的Blogger评论表单组件。
 * 允许用户在当前页面输入内容，然后通过“剪贴板继承”的方式在弹出窗口中快速发布。
 */
export const CommentForm: React.FC<CommentFormProps> = ({ Ctx, setCtx, onCommentSubmitted }) => {
  const { blogId, postId, replyToId } = Ctx;

  // 新增 state 来管理本地文本框的内容
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, { set: setIsSubmitting }] = useBoolean(false);
  const pollTimerRef = useRef<Timeout | null>(null);

  // 当回复目标变化时 (用户点击了另一条评论的回复)，清空文本框
  useEffect(() => {
    setCommentText('');
  }, [replyToId]);

  // 当组件卸载时，确保清除任何正在运行的定时器
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // 1. 阻止按钮的默认行为，防止页面刷新
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

    // 2. 改进轮询逻辑
    pollTimerRef.current = setInterval(() => {
      // 检查 popup 是否存在且已关闭
      // `popup.closed` 是关键属性
      if (!popup || popup.closed) {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);

        setIsSubmitting(false);
        setCommentText('');
        console.log('评论窗口已关闭，触发刷新...');

        // 3. 调用从父组件传入的回调函数，而不是刷新整个页面
        onCommentSubmitted();
      }
    }, 500);
  };

  const handleCancelReply = () => {
    setCtx({ replyToId: null });
  };

  return (
    <div className="comment-form-container">
      <h3>
        {replyToId ? '正在回复...' : '发表新评论'}
      </h3>
      {/* 修改 textarea，使其变为一个受控组件 */}
      <textarea
        placeholder="在此输入您的评论..."
        rows={6}
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}
      />
      <div className="form-actions" style={{ marginTop: '10px' }}>
        <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '等待窗口...' : '发布评论 (内容已复制)'}
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