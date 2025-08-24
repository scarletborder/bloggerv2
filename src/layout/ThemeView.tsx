import React from 'react';
import useTheme from '../hooks/useTheme';
import { isMobile } from 'react-device-detect';

interface ThemeViewProps {
  children: React.ReactNode;
}

const ThemeView: React.FC<ThemeViewProps> = ({ children }) => {
  const { theme } = useTheme();

  // PC 端字体大小 (px)
  const pcFontSizes = {
    p: '16px',
    span: '16px',
    div: '16px',
    a: '16px',
    h1: '32px',
    h2: '28px',
    h3: '24px',
    h4: '20px',
    h5: '18px',
    h6: '16px',
    pre: '14px',
    code: '14px',
    small: '14px',
    label: '16px',
    input: '16px',
    button: '16px',
    li: '16px',
    blockquote: '16px',
    caption: '14px',
    figcaption: '14px',
  };

  // 移动端字体大小 (px) - 修复过大的字体问题
  const mobileFontSizes = {
    p: '16px',
    span: '16px',
    div: '16px',
    a: '16px',
    h1: '28px',
    h2: '24px',
    h3: '22px',
    h4: '20px',
    h5: '18px',
    h6: '16px',
    pre: '14px',
    code: '14px',
    small: '14px',
    label: '16px',
    input: '16px',
    button: '16px',
    li: '16px',
    blockquote: '16px',
    caption: '14px',
    figcaption: '14px',
  };

  const currentFontSizes = isMobile ? mobileFontSizes : pcFontSizes;

  const containerStyles: React.CSSProperties = {
    // 移除背景色设置，避免与HTML/CSS样式冲突
    // backgroundColor: 'var(--bg-color)',
    // color: 'var(--text-color)',
    minHeight: '100vh',
    width: '100%',
    maxWidth: '100vw',
    overflowX: 'hidden',
    position: 'relative',
    wordWrap: 'break-word',
    fontFamily: isMobile
      ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    lineHeight: isMobile ? '1.6' : '1.5',
    // 移除过渡效果，避免闪烁
    // transition: 'background-color 0.3s ease, color 0.3s ease',
  };  // 创建全局样式字符串 - 使用 CSS 变量
  const globalStyles = `
    html, body {
      ${isMobile ? `
        overflow-x: hidden;
        max-width: 100vw;
        position: relative;
        touch-action: pan-y;
      ` : ''}
    }

    * {
      box-sizing: border-box;
      ${isMobile ? `
        max-width: 100%;
        overflow-wrap: break-word;
        word-wrap: break-word;
        hyphens: auto;
      ` : ''}
    }

    p {
      font-size: ${currentFontSizes.p};
      margin: ${isMobile ? '12px 0' : '16px 0'};
      color: var(--text-color);
      ${isMobile ? `
        max-width: 100%;
        overflow-wrap: break-word;
        word-wrap: break-word;
      ` : ''}
    }

    span {
      font-size: ${currentFontSizes.span};
      color: var(--text-color);
      ${isMobile ? `
        max-width: 100%;
        overflow-wrap: break-word;
        word-wrap: break-word;
      ` : ''}
    }

    div {
      font-size: ${currentFontSizes.div};
      color: var(--text-color);
      ${isMobile ? `
        max-width: 100%;
        overflow-wrap: break-word;
        word-wrap: break-word;
      ` : ''}
    }

    a {
      font-size: ${currentFontSizes.a};
      color: var(--primary-color);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    a:hover {
      color: var(--primary-hover-color);
      text-decoration: underline;
    }

    h1 {
      font-size: ${currentFontSizes.h1};
      font-weight: 700;
      margin: ${isMobile ? '16px 0 12px' : '32px 0 24px'};
      color: var(--text-color);
      line-height: 1.2;
    }

    h2 {
      font-size: ${currentFontSizes.h2};
      font-weight: 600;
      margin: ${isMobile ? '14px 0 10px' : '28px 0 20px'};
      color: var(--text-color);
      line-height: 1.3;
    }

    h3 {
      font-size: ${currentFontSizes.h3};
      font-weight: 600;
      margin: ${isMobile ? '12px 0 8px' : '24px 0 16px'};
      color: var(--text-color);
      line-height: 1.3;
    }

    h4 {
      font-size: ${currentFontSizes.h4};
      font-weight: 600;
      margin: ${isMobile ? '10px 0 6px' : '20px 0 12px'};
      color: var(--text-color);
      line-height: 1.4;
    }

    h5 {
      font-size: ${currentFontSizes.h5};
      font-weight: 600;
      margin: ${isMobile ? '8px 0 4px' : '18px 0 10px'};
      color: var(--text-color);
      line-height: 1.4;
    }

    h6 {
      font-size: ${currentFontSizes.h6};
      font-weight: 600;
      margin: ${isMobile ? '6px 0 2px' : '16px 0 8px'};
      color: var(--text-color);
      line-height: 1.4;
    }

    pre {
      font-size: ${currentFontSizes.pre};
      background-color: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: ${isMobile ? '12px' : '16px'};
      margin: ${isMobile ? '12px 0' : '16px 0'};
      overflow-x: auto;
      color: var(--text-color);
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    }

    code {
      font-size: ${currentFontSizes.code};
      background-color: var(--surface-color);
      padding: ${isMobile ? '2px 4px' : '2px 6px'};
      border-radius: 3px;
      color: var(--text-color);
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    }

    small {
      font-size: ${currentFontSizes.small};
      color: var(--text-secondary-color);
    }

    label {
      font-size: ${currentFontSizes.label};
      color: var(--text-color);
      font-weight: 500;
    }

    input, textarea {
      font-size: ${currentFontSizes.input};
      color: var(--text-color);
      background-color: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: ${isMobile ? '8px' : '12px'};
      outline: none;
      transition: border-color 0.2s ease;
      max-width: 100%;
      box-sizing: border-box;
    }

    input:focus, textarea:focus {
      border-color: var(--primary-color);
    }

    button {
      font-size: ${currentFontSizes.button};
      color: var(--bg-color);
      background-color: var(--primary-color);
      border: none;
      border-radius: 4px;
      padding: ${isMobile ? '8px 16px' : '12px 24px'};
      cursor: pointer;
      transition: background-color 0.2s ease;
      font-weight: 500;
    }

    button:hover {
      background-color: var(--primary-hover-color);
    }

    li {
      font-size: ${currentFontSizes.li};
      color: var(--text-color);
      margin: ${isMobile ? '6px 0' : '8px 0'};
    }

    blockquote {
      font-size: ${currentFontSizes.blockquote};
      color: var(--text-secondary-color);
      border-left: 3px solid var(--primary-color);
      padding-left: ${isMobile ? '12px' : '16px'};
      margin: ${isMobile ? '12px 0' : '16px 0'};
      font-style: italic;
    }

    caption, figcaption {
      font-size: ${currentFontSizes.caption};
      color: var(--text-secondary-color);
      text-align: center;
      margin: ${isMobile ? '6px 0' : '8px 0'};
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: ${isMobile ? '12px 0' : '16px 0'};
      max-width: 100%;
      overflow-x: auto;
      display: block;
      white-space: nowrap;
    }

    th, td {
      font-size: ${currentFontSizes.p};
      border: 1px solid var(--border-color);
      padding: ${isMobile ? '8px' : '12px'};
      text-align: left;
    }

    th {
      background-color: var(--surface-color);
      font-weight: 600;
    }

    hr {
      border: none;
      border-top: 1px solid var(--border-color);
      margin: ${isMobile ? '20px 0' : '32px 0'};
    }

    /* 滚动条样式 */
    ::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }

    ::-webkit-scrollbar-track {
      background: var(--scrollbar-track-color);
      border-radius: 6px;
    }

    ::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb-color);
      border-radius: 6px;
      border: 2px solid var(--scrollbar-track-color);
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--scrollbar-thumb-color);
      opacity: 0.8;
    }

    ::-webkit-scrollbar-corner {
      background: var(--scrollbar-track-color);
    }

    /* Firefox 滚动条样式 */
    * {
      scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
    }
  `;

  React.useEffect(() => {
    // 移除重复的主题设置，由 useTheme hook 统一管理
    // document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');

    // 动态创建并注入样式
    const styleId = 'theme-view-global-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.innerHTML = globalStyles;
  }, [globalStyles, theme]);

  return (
    <div style={containerStyles}>
      {children}
    </div>
  );
};

export default ThemeView;