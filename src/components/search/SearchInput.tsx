// src/components/search/SearchInput.tsx
import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useMemoizedFn, useKeyPress } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import { getCurrentTheme } from '../../constants/colors';

interface SearchInputProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
  loading?: boolean;
  // 如果为 true，则执行搜索而不跳转页面（用于搜索页面本身）
  disableNavigation?: boolean;
  // 紧凑模式，用于导航栏等小空间
  compact?: boolean;
}

export default function SearchInput({
  onSearch,
  initialQuery = '',
  loading = false,
  disableNavigation = false,
  compact = false,
}: SearchInputProps) {
  const colors = getCurrentTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = useMemoizedFn(() => {
    if (query.trim()) {
      if (disableNavigation && onSearch) {
        // 如果禁用导航且有 onSearch 回调，则执行回调（用于搜索页面本身）
        onSearch(query.trim());
      } else {
        // 默认行为：跳转到搜索页面
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  });

  useKeyPress('Enter', handleSearch);

  const handleKeyDown = useMemoizedFn((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  });

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: compact
      ? isMobile
        ? '180px'
        : '240px'
      : isMobile
        ? '100%'
        : '600px',
    margin: compact ? '0' : '0 auto',
  };

  const searchWrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '0' : '0',
  };

  const labelStyles: React.CSSProperties = {
    position: 'absolute',
    top: compact ? '0' : '-12px',
    left: compact ? '0' : '12px',
    transform: compact ? 'none' : 'translateY(-100%)',
    display: compact ? 'none' : 'flex',
    alignItems: 'center',
    gap: '6px',
    color: colors.textSecondary,
    fontSize: '14px',
    fontWeight: '500',
    background: colors.background,
    padding: '0 8px',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const inputStyles: React.CSSProperties = {
    flex: isMobile ? '1' : '1',
    padding: compact
      ? '8px 36px 8px 12px'
      : isMobile
        ? '14px 16px'
        : '16px 20px',
    fontSize: compact ? '14px' : isMobile ? '16px' : '18px',
    borderRadius: compact ? '20px' : isMobile ? '12px' : '12px 0 0 12px',
    border: compact
      ? '1px solid var(--border-color)'
      : `2px solid ${colors.primary}`,
    backgroundColor: compact ? 'var(--surface-color)' : colors.surface,
    color: compact ? 'var(--text-color)' : colors.text,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    borderRight: compact
      ? '1px solid var(--border-color)'
      : isMobile
        ? `2px solid ${colors.primary}`
        : 'none',
    minWidth: 0,
  };

  const compactIconStyles: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    color: 'var(--text-secondary-color)',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  };

  const buttonStyles: React.CSSProperties = {
    display: isMobile || compact ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    background: `linear-gradient(45deg, ${colors.primary}, ${colors.primaryHover})`,
    border: `2px solid ${colors.primary}`,
    borderLeft: 'none',
    borderRadius: '0 12px 12px 0',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: `0 4px 12px ${colors.primary}40`,
    minWidth: '80px',
    whiteSpace: 'nowrap',
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={containerStyles}>
        <label style={labelStyles} onClick={handleSearch}>
          <svg
            /* Font Awesome SVG */ width="1em"
            height="1em"
            viewBox="0 0 512 512"
            fill="currentColor"
          >
            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path>
          </svg>
          <span>搜索博客</span>
        </label>
        <div style={searchWrapperStyles}>
          <input
            type="text"
            style={inputStyles}
            placeholder={compact ? 'Search...' : '输入关键词...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          {compact && (
            <span style={compactIconStyles}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path>
              </svg>
            </span>
          )}
          <button
            style={buttonStyles}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                搜索中
              </div>
            ) : (
              '搜索'
            )}
          </button>
        </div>
      </div>
    </>
  );
}
