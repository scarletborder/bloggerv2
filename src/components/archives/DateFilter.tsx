import React from 'react';
import { isMobile } from 'react-device-detect';
import { useSetState, useMemoizedFn } from 'ahooks';
import { getCurrentTheme } from '../../constants/colors';

interface DateFilterProps {
  onDateSearch: (year: number, month: number) => void;
}

export default function DateFilter({ onDateSearch }: DateFilterProps) {
  const colors = getCurrentTheme();
  const [dateState, setDateState] = useSetState({
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1
  });

  const handleSearch = useMemoizedFn(() => {
    onDateSearch(dateState.selectedYear, dateState.selectedMonth);
  });

  // 生成年份选项 (近10年)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

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
  };

  return (
    <div style={isMobile ? mobileContainerStyles : pcContainerStyles}>
      <h3 style={titleStyles}>
        📅 按日期浏览
      </h3>
      <div style={isMobile ? mobileContentStyles : pcContentStyles}>
        <div style={isMobile ? mobileRowStyles : pcRowStyles}>
          <select
            style={isMobile ? mobileSelectStyles : pcSelectStyles}
            value={dateState.selectedYear}
            onChange={(e) => setDateState({ selectedYear: Number(e.target.value) })}
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>

          <select
            style={isMobile ? mobileSelectStyles : pcSelectStyles}
            value={dateState.selectedMonth}
            onChange={(e) => setDateState({ selectedMonth: Number(e.target.value) })}
          >
            {monthOptions.map(month => (
              <option key={month} value={month}>{month}月</option>
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
}
