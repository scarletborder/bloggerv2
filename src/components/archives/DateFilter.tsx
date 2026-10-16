import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { isMobile } from 'react-device-detect';
import { useSetState, useMemoizedFn } from 'ahooks';
import { getCurrentTheme } from '../../constants/colors';
import PostCacheManager from '../../utils/postCache';

interface DateFilterProps {
  onDateSearch: (year: number, month: number) => void;
  onRefreshRequest?: () => void;
  showRefreshButton?: boolean;
  initialYear?: number;
  initialMonth?: number;
}

export interface DateFilterRef {
  updateCacheDisplay: () => Promise<void>;
}


const DateFilter = forwardRef<DateFilterRef, DateFilterProps>((
  {
    onDateSearch,
    onRefreshRequest,
    showRefreshButton = false,
    initialYear,
    initialMonth,
  },
  ref,
) => {
  const colors = getCurrentTheme();
  const [dateState, setDateState] = useSetState({
    selectedYear: initialYear || new Date().getFullYear(),
    selectedMonth: initialMonth || new Date().getMonth() + 1,
  });
  const [cachedCounts, setCachedCounts] = useSetState<
  Record<string, Record<string, number>>
  >({});

  // 初始化缓存管理器和加载缓存统计
  useEffect(() => {
    const initCache = async () => {
      await PostCacheManager.init();
      const counts = await PostCacheManager.getCachedDateCounts();
      setCachedCounts(counts);
    };
    initCache();
  }, []);

  // 处理初始值变化时的自动搜索
  useEffect(() => {
    if (initialYear && initialMonth) {
      // 如果有初始值且与当前状态不同，触发搜索
      const { selectedYear, selectedMonth } = dateState;
      if (selectedYear === initialYear && selectedMonth === initialMonth) {
        // 延迟触发搜索，确保组件已完全初始化
        setTimeout(() => {
          onDateSearch(initialYear, initialMonth);
        }, 200);
      }
    }
  }, [initialYear, initialMonth, dateState, onDateSearch]);

  // 暴露方法给父组件
  useImperativeHandle(
    ref,
    () => ({
      updateCacheDisplay: async () => {
        const counts = await PostCacheManager.getCachedDateCounts();
        setCachedCounts(counts);
      },
    }),
    [],
  );

  const handleSearch = useMemoizedFn(() => {
    const { selectedYear, selectedMonth } = dateState;
    // 直接触发搜索，缓存逻辑已经在useInfiniteScroll内部处理
    onDateSearch(selectedYear, selectedMonth);
  });

  const handleRefresh = useMemoizedFn(async () => {
    const { selectedYear, selectedMonth } = dateState;

    // 清除缓存
    await PostCacheManager.clearCache(selectedYear, selectedMonth);

    // 更新缓存统计
    const counts = await PostCacheManager.getCachedDateCounts();
    setCachedCounts(counts);

    // 触发刷新请求
    if (onRefreshRequest) {
      onRefreshRequest();
    }
  });

  // 生成年份选项 (近10年)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthStr = month.toString().padStart(2, '0');
    const yearStr = dateState.selectedYear.toString();
    const cachedCount = cachedCounts[yearStr]?.[monthStr];

    return {
      value: month,
      label:
        cachedCount !== undefined
          ? `${month}月 (${cachedCount})`
          : `${month}月`,
    };
  });

  // PC版样式
  const pcContainerStyles: React.CSSProperties = {
    background: `linear-gradient(135deg, ${colors.primary}15, ${colors.surface})`,
    borderRadius: '16px',
    padding: '20px',
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
  };

  const pcContentStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const pcRowStyles: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  };

  const pcSelectStyles: React.CSSProperties = {
    flex: 1,
    padding: '10px 12px',
    fontSize: '14px',
    fontWeight: '500',
    border: `2px solid ${colors.border}`,
    borderRadius: '8px',
    backgroundColor: colors.background,
    color: colors.text,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  };

  const pcButtonStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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

  const mobileContentStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const mobileRowStyles: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  };

  const mobileSelectStyles: React.CSSProperties = {
    flex: 1,
    padding: '8px 10px',
    fontSize: '14px',
    fontWeight: '500',
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    backgroundColor: colors.background,
    color: colors.text,
    cursor: 'pointer',
  };

  const mobileButtonStyles: React.CSSProperties = {
    width: '100%',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '700',
    color: colors.text,
    marginBottom: isMobile ? '8px' : '12px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const refreshButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: colors.primary,
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={isMobile ? mobileContainerStyles : pcContainerStyles}>
      <h3 style={titleStyles}>
        📅 按日期浏览
        {showRefreshButton && (
          <button
            style={refreshButtonStyles}
            onClick={() => void handleRefresh()}
            title="刷新缓存"
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = `${colors.primaryHover}20`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            🔄
          </button>
        )}
      </h3>
      <div style={isMobile ? mobileContentStyles : pcContentStyles}>
        <div style={isMobile ? mobileRowStyles : pcRowStyles}>
          <select
            style={isMobile ? mobileSelectStyles : pcSelectStyles}
            value={dateState.selectedYear}
            onChange={e => setDateState({ selectedYear: Number(e.target.value) })
            }
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>

          <select
            style={isMobile ? mobileSelectStyles : pcSelectStyles}
            value={dateState.selectedMonth}
            onChange={e => setDateState({ selectedMonth: Number(e.target.value) })
            }
          >
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          style={isMobile ? mobileButtonStyles : pcButtonStyles}
          onClick={handleSearch}
          onMouseEnter={(e) => {
            if (!isMobile) {
              e.currentTarget.style.backgroundColor = colors.primaryHover;
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isMobile) {
              e.currentTarget.style.backgroundColor = colors.primary;
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          🔍 搜索文章
        </button>
      </div>
    </div>
  );
});

DateFilter.displayName = 'DateFilter';

export default DateFilter;
