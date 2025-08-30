import React, { useState, useRef, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import type { CommentItem } from '../../../models/CommentItem';
import { getCurrentTheme } from '../../../constants/colors';
import { SourceIcon } from '../common';

interface CommentItemComponentProps {
  comment: CommentItem;
}

export function CommentItemComponent({ comment }: CommentItemComponentProps) {
  const colors = getCurrentTheme();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const linkIconRef = useRef<HTMLSpanElement>(null);

  // Handle click outside for mobile
  useEffect(() => {
    if (!isMobile || !showTooltip) return;

    const handleClickOutside = (event: MouseEvent) => {
      // 检查点击事件是否发生在 linkIconRef 及其子元素之外
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

  const handleIconClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!comment.author.url) return;

    if (isMobile) {
      if (showTooltip) {
        // Second click: copy URL
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
        // First click: show tooltip
        setShowTooltip(true);
        setTooltipText(comment.author.url);
      }
    } else {
      // PC: copy URL directly
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

  // ==================== 修改开始 ====================

  const authorInfoStyles: React.CSSProperties = {
    flex: 1,
    position: 'relative', // 1. 设置为新的定位上下文
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
    // 2. 移除了 position: 'relative'
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
    // 4. 优化 Tooltip 内部文本样式
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

  // ==================== 修改结束 ====================

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
                onClick={handleIconClick}
              >
                🔗
              </span>
            )}

            <SourceIcon source={comment.source} />
          </div>
          <div style={dateStyles}>
            {formatDate(comment.timeStamp)}
          </div>

          {comment.author.url && showTooltip && tooltipText && (
            <div style={tooltipStyles}>
              <span style={getTooltipTextStyles()}>
                {tooltipText}
              </span>
            </div>
          )}
        </div>
      </div>
      <div
        style={contentStyles}
        dangerouslySetInnerHTML={{ __html: comment.content }}
      />
      {showToast && (
        <div style={toastStyles}>
          复制成功！
        </div>
      )}
    </div>
  );
}