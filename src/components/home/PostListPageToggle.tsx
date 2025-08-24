import React from 'react';
import { isMobile } from 'react-device-detect';
import { getCurrentTheme } from '../../constants/colors';

interface PostListPageToggleProps {
  current: number;
  total: number;
  pageSize: number;
  displayedItemsCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

const PostListPageToggle: React.FC<PostListPageToggleProps> = ({
  current,
  total,
  pageSize,
  displayedItemsCount,
  onPrevious,
  onNext,
}) => {
  const colors = getCurrentTheme();

  // 判断是否可以向左（上一页）
  const canGoPrevious = current > 1;

  // 判断是否可以向右（下一页）
  // 当已经展现的item总数量没有达到total时候，向右按钮可用
  const totalDisplayedItems = (current - 1) * pageSize + displayedItemsCount;
  const canGoNext = totalDisplayedItems < total;

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? '8px' : '16px',
    padding: isMobile ? '20px 12px' : '20px 0',
  };

  const buttonStyles: React.CSSProperties = {
    padding: isMobile ? '12px 16px' : '8px 16px',
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: isMobile ? '16px' : '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    minWidth: isMobile ? '90px' : '80px',
    flex: isMobile ? '1' : 'none',
    maxWidth: isMobile ? '120px' : 'none',
  };

  const buttonHoverStyles: React.CSSProperties = {
    backgroundColor: colors.primaryHover,
    transform: 'translateY(-1px)',
  };

  const buttonDisabledStyles: React.CSSProperties = {
    backgroundColor: colors.border,
    color: "#627077",
    cursor: 'not-allowed',
    transform: 'none',
  };

  const pageInfoStyles: React.CSSProperties = {
    color: colors.text,
    fontSize: isMobile ? '16px' : '14px',
    fontWeight: '500',
    minWidth: isMobile ? '80px' : '100px',
    textAlign: 'center',
  };

  const [hoveredButton, setHoveredButton] = React.useState<'prev' | 'next' | null>(null);

  const getButtonStyles = (buttonType: 'prev' | 'next', isDisabled: boolean) => {
    if (isDisabled) {
      return { ...buttonStyles, ...buttonDisabledStyles };
    }
    if (hoveredButton === buttonType) {
      return { ...buttonStyles, ...buttonHoverStyles };
    }
    return buttonStyles;
  };

  return (
    <div style={containerStyles}>
      <button
        style={getButtonStyles('prev', !canGoPrevious)}
        disabled={!canGoPrevious}
        onClick={onPrevious}
        onMouseEnter={() => setHoveredButton('prev')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        ← 上一页
      </button>

      <div style={pageInfoStyles}>
        第 {current} 页
      </div>

      <button
        style={getButtonStyles('next', !canGoNext)}
        disabled={!canGoNext}
        onClick={onNext}
        onMouseEnter={() => setHoveredButton('next')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        下一页 →
      </button>
    </div>
  );
};

export default PostListPageToggle;
