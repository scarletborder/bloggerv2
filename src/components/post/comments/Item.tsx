import React, { useState, useRef, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import type { CommentItem, MetaBlogger } from '../../../models/CommentItem';
import { getCurrentTheme } from '../../../constants/colors';
import { SourceIcon } from '../common';
import type { SetState } from 'ahooks/lib/useSetState';
import type { CommentsState } from './types';

interface CommentItemComponentProps {
  comment: CommentItem;
  setCtx: SetState<CommentsState>;
  ClickReplyButton: () => void;
}

export function CommentItemComponent({ comment, setCtx, ClickReplyButton }: CommentItemComponentProps) {
  const colors = getCurrentTheme();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const linkIconRef = useRef<HTMLSpanElement>(null);

  const handleReplyClick = () => {
    if (comment.source !== 'blogger') return;
    const meta = comment.meta as MetaBlogger;
    setCtx({ replyToId: meta.id });
    ClickReplyButton();
  };

  useEffect(() => {
    if (!isMobile || !showTooltip) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (linkIconRef.current && !linkIconRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
        setTooltipText('');
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showTooltip]);

  const handleMouseEnter = () => {
    if (!isMobile && comment.author.url) {
      setShowTooltip(true);
      setTooltipText(comment.author.url);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowTooltip(false);
      setTooltipText('');
    }
  };

  const handleLinkIconClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!comment.author.url) return;
    if (isMobile) {
      if (showTooltip) {
        try {
          await navigator.clipboard.writeText(comment.author.url);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        } catch (err) {
          console.error('Failed to copy URL:', err);
        }
        setShowTooltip(false);
        setTooltipText('');
      } else {
        setShowTooltip(true);
        setTooltipText(comment.author.url);
      }
    } else {
      try {
        await navigator.clipboard.writeText(comment.author.url);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==================== 样式定义区 (CSS-in-JS) ====================

  const commentItemStyles: React.CSSProperties = {
    padding: isMobile ? '16px' : '20px',
    marginBottom: '16px',
    backgroundColor: colors.surface,
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
  };

  const authorStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    gap: '12px',
  };

  const avatarStyles: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: colors.border,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    color: colors.text,
  };

  const authorInfoStyles: React.CSSProperties = {
    flex: 1,
    position: 'relative',
  };

  const authorNameStyles: React.CSSProperties = {
    fontWeight: '600',
    color: colors.text,
    fontSize: '16px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const linkIconStyles: React.CSSProperties = {
    cursor: 'pointer',
    fontSize: '16px',
    userSelect: 'none',
  };

  const tooltipStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '8px',
    zIndex: 1000,
    width: '100%',
    pointerEvents: 'none',
  };

  const getTooltipTextStyles = (): React.CSSProperties => ({
    backgroundColor: colors.background,
    padding: '6px 10px',
    borderRadius: '6px',
    display: 'inline-block',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    boxSizing: 'border-box',
  });

  const toastStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    zIndex: 1001,
    opacity: showToast ? 1 : 0,
    transition: 'opacity 0.3s ease',
  };

  const dateStyles: React.CSSProperties = {
    fontSize: '13px',
    color: colors.textSecondary,
    marginTop: '2px',
  };

  const contentStyles: React.CSSProperties = {
    color: colors.text,
    lineHeight: '1.6',
    fontSize: '14px',
    wordBreak: 'break-word',
  };

  const actionsStyles: React.CSSProperties = {
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'flex-end',
  };

  const replyButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease',
  };

  // ==================== 新增：引用块的样式 ====================
  const quoteBlockStyles: React.CSSProperties = {
    margin: '0 0 12px 0',
    padding: '8px 12px',
    borderLeft: `4px solid ${colors.border}`,
    backgroundColor: colors.background,
    color: colors.textSecondary,
    fontSize: '13px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
  // ==================== 修改结束 ====================

  /**
   * 创建被引用内容的摘要
   * @param htmlContent - 被引用评论的HTML内容
   * @returns 纯文本摘要
   */
  const createBrief = (htmlContent: string): string => {
    // 创建一个临时div来解析HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    // 获取纯文本，并截断
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.length > 50 ? `${text.substring(0, 50)}...` : text;
  };

  return (
    <div style={commentItemStyles}>
      <div style={authorStyles}>
        <div style={avatarStyles}>
          {comment.author.image ? (
            <img
              src={comment.author.image}
              alt={comment.author.name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            comment.author.name.charAt(0).toUpperCase()
          )}
        </div>
        <div style={authorInfoStyles}>
          <div style={authorNameStyles}>
            {comment.author.url ? (
              <a
                href={comment.author.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...authorNameStyles, gap: 0 }}
              >
                {comment.author.name}
              </a>
            ) : (
              comment.author.name
            )}
            {comment.author.url && (
              <span
                ref={linkIconRef}
                style={linkIconStyles}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleLinkIconClick}
              >
                🔗
              </span>
            )}
            <SourceIcon source={comment.source} />
          </div>
          <div style={dateStyles}>{formatDate(comment.timeStamp)}</div>
          {comment.author.url && showTooltip && tooltipText && (
            <div style={tooltipStyles}>
              <span style={getTooltipTextStyles()}>{tooltipText}</span>
            </div>
          )}
        </div>
      </div>

      {/* ==================== 新增：条件渲染引用块 ==================== */}
      {comment.inReplyTo && (
        <div style={quoteBlockStyles}>
          {`> ${comment.inReplyTo.author.name}: ${createBrief(comment.inReplyTo.content)}`}
        </div>
      )}
      {/* ==================== 修改结束 ==================== */}

      <div
        style={contentStyles}
        dangerouslySetInnerHTML={{ __html: comment.content }}
      />

      <div style={actionsStyles}>
        {comment.source === 'blogger' && (
          <button
            style={replyButtonStyles}
            onClick={handleReplyClick}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.border)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            回复
          </button>
        )}
      </div>

      {showToast && <div style={toastStyles}>复制成功！</div>}
    </div>
  );
}