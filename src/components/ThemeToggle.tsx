import React from 'react';
import useTheme from '../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, themeMode, toggleTheme } = useTheme({
    localStorageKey: 'theme',
  });

  // 获取滑块位置 - 使用calc确保不超出边界
  const getSliderPosition = () => {
    return themeMode === 'light' ? '2px' : 'calc(100% - 26px)';
  };

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '50px',
    height: '28px',
    backgroundColor: theme === 'dark' ? '#333' : '#ddd',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    border: '1px solid var(--border-color)',
  };

  const sliderStyles: React.CSSProperties = {
    position: 'absolute',
    top: '2px',
    left: getSliderPosition(),
    width: '24px',
    height: '24px',
    backgroundColor: theme === 'dark' ? '#222' : '#fff',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  };

  const iconStyles: React.CSSProperties = {
    width: '14px',
    height: '14px',
    fill: theme === 'dark' ? '#fff' : '#666',
    transition: 'fill 0.3s ease',
  };

  // 根据当前主题显示不同的图标
  const renderContent = () => {
    if (theme === 'dark') {
      // 月亮图标
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          style={iconStyles}
        >
          <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-175.5c0-65.8 36.5-123.1 90.3-152.3c6.5-3.5 9.9-10.9 8.7-18.3s-8.1-12.9-15.7-13.4C238.8 32.8 231.2 32 223.5 32z" />
        </svg>
      );
    } else {
      // 太阳图标
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          style={iconStyles}
        >
          <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM352 256c0 53-43 96-96 96s-96-43-96-96s43-96 96-96s96 43 96 96zm32 0c0-70.7-57.3-128-128-128s-128 57.3-128 128s57.3 128 128 128s128-57.3 128-128z" />
        </svg>
      );
    }
  };

  const getTooltipText = () => {
    return themeMode === 'dark' ? 'Dark Mode' : 'Light Mode';
  };

  return (
    <div
      style={containerStyles}
      onClick={toggleTheme}
      title={getTooltipText()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
    >
      <div style={sliderStyles}>{renderContent()}</div>
    </div>
  );
};

export default ThemeToggle;
