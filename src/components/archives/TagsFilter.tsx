import React, { useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { useRequest, useMemoizedFn } from 'ahooks';
import { getAllTags } from '../../actions/blogger.service';
import { getCurrentTheme } from '../../constants/colors';
import type { JSX } from 'react/jsx-runtime';
interface TagsFilterProps {
  onTagSelect: (tag: string) => void;
  onTagSearch: (tag: string) => void;
  selectedTag?: string;
  initialTag?: string;
}

export default function TagsFilter({
  onTagSelect,
  onTagSearch,
  selectedTag,
  initialTag,
}: TagsFilterProps): JSX.Element {
  const colors = getCurrentTheme();

  const { data: tags = [], loading } = useRequest(getAllTags, {
    onError: (err) => {
      console.error('Failed to fetch tags:', err);
    },
  });

  // 处理初始标签自动选择
  useEffect(() => {
    if (initialTag && tags.length > 0 && !selectedTag) {
      // 检查初始标签是否在标签列表中存在
      const tagExists = tags.some(tag => tag.term === initialTag);
      if (tagExists) {
        onTagSelect(initialTag);
      }
    }
  }, [initialTag, tags, selectedTag, onTagSelect]);

  const handleTagClick = useMemoizedFn((tag: string) => {
    console.log('Tag clicked:', tag); // 添加调试信息
    onTagSelect(tag);
    onTagSearch(tag); // 直接触发搜索
  });

  const getTagColor = (index: number): string => {
    const tagColors = [
      '#007bff',
      '#28a745',
      '#dc3545',
      '#ffc107',
      '#17a2b8',
      '#6f42c1',
      '#e83e8c',
      '#fd7e14',
      '#20c997',
      '#6c757d',
    ];
    return tagColors[index % tagColors.length];
  };

  // PC版样式
  const pcContainerStyles: React.CSSProperties = {
    background: `linear-gradient(135deg, ${colors.primary}22, ${colors.surface})`,
    borderRadius: '16px',
    padding: '24px',
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const pcScrollContainerStyles: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: '8px',
  };

  const pcTagsGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
  };

  // 移动版样式
  const mobileContainerStyles: React.CSSProperties = {
    background: `linear-gradient(135deg, ${colors.primary}15, ${colors.surface})`,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
  };

  const mobileTagsGridStyles: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: '700',
    color: colors.text,
    marginBottom: isMobile ? '12px' : '16px',
    textAlign: 'center',
    background: `linear-gradient(45deg, ${colors.primary}, ${colors.primaryHover})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const pcTagStyles = (
    index: number,
    isSelected: boolean,
  ): React.CSSProperties => ({
    padding: '10px 16px',
    backgroundColor: isSelected
      ? getTagColor(index)
      : `${getTagColor(index)}30`,
    color: isSelected ? '#ffffff' : colors.text,
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition:
      'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textAlign: 'center',
    boxShadow: isSelected
      ? `0 4px 12px ${getTagColor(index)}40`
      : '0 2px 6px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${colors.border}`,
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    width: '100%',
    minWidth: '0',
  });

  const mobileTagStyles = (
    index: number,
    isSelected: boolean,
  ): React.CSSProperties => ({
    padding: '8px 14px',
    backgroundColor: isSelected
      ? getTagColor(index)
      : `${getTagColor(index)}30`,
    color: isSelected ? '#ffffff' : colors.text,
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    border: `1px solid ${colors.border}`,
    outline: 'none',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    maxWidth: '120px',
  });

  const loadingStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px',
    color: colors.textSecondary,
    fontSize: '16px',
  };

  if (loading) {
    return (
      <div style={isMobile ? mobileContainerStyles : pcContainerStyles}>
        <div style={loadingStyles}>正在加载标签...</div>
      </div>
    );
  }

  return (
    <div style={isMobile ? mobileContainerStyles : pcContainerStyles}>
      <h3 style={titleStyles}>🏷️ 文章标签</h3>
      <div style={isMobile ? undefined : pcScrollContainerStyles}>
        <div style={isMobile ? mobileTagsGridStyles : pcTagsGridStyles}>
          {tags.map((tag, index) => {
            const isSelected = selectedTag === tag.term;
            return (
              <button
                key={tag.term}
                style={
                  isMobile
                    ? mobileTagStyles(index, isSelected)
                    : pcTagStyles(index, isSelected)
                }
                onClick={() => handleTagClick(tag.term)}
                title={tag.term} // 显示完整标签名作为 tooltip
                onMouseEnter={(e) => {
                  if (!isMobile && !isSelected) {
                    e.currentTarget.style.backgroundColor = `${getTagColor(index)}50`;
                    e.currentTarget.style.boxShadow =                      '0 4px 8px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile && !isSelected) {
                    e.currentTarget.style.backgroundColor = `${getTagColor(index)}30`;
                    e.currentTarget.style.boxShadow =                      '0 2px 6px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                {tag.term}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
