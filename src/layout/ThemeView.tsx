import React from 'react';
import { useTheme } from 'ahooks';
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

  // 移动端字体大小 (em)
  const mobileFontSizes = {
    p: '3em',
    span: '3em',
    div: '3em',
    a: '3em',
    h1: '6em',
    h2: '5.4em',
    h3: '3.8em',
    h4: '3.4em',
    h5: '3.2em',
    h6: '3em',
    pre: '2.6em',
    code: '2.6em',
    small: '2.4em',
    label: '3em',
    input: '3em',
    button: '3em',
    li: '3em',
    blockquote: '3em',
    caption: '2.6em',
    figcaption: '2.6em',
  };

  const currentFontSizes = isMobile ? mobileFontSizes : pcFontSizes;

  const containerStyles: React.CSSProperties = {
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-color)',
    minHeight: '100vh',
    width: '100%',
    fontFamily: isMobile
      ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    lineHeight: isMobile ? '1.6' : '1.5',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };  // 创建全局样式字符串 - 使用 CSS 变量
  const globalStyles = `
    p {
      font-size: ${currentFontSizes.p};
      margin: ${isMobile ? '1em 0' : '16px 0'};
      color: var(--text-color);
    }

    span {
      font-size: ${currentFontSizes.span};
      color: var(--text-color);
    }

    div {
      font-size: ${currentFontSizes.div};
      color: var(--text-color);
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
      margin: ${isMobile ? '1.2em 0 0.8em' : '32px 0 24px'};
      color: var(--text-color);
      line-height: 1.2;
    }

    h2 {
      font-size: ${currentFontSizes.h2};
      font-weight: 600;
      margin: ${isMobile ? '1.1em 0 0.7em' : '28px 0 20px'};
      color: var(--text-color);
      line-height: 1.3;
    }

    h3 {
      font-size: ${currentFontSizes.h3};
      font-weight: 600;
      margin: ${isMobile ? '1em 0 0.6em' : '24px 0 16px'};
      color: var(--text-color);
      line-height: 1.3;
    }

    h4 {
      font-size: ${currentFontSizes.h4};
      font-weight: 600;
      margin: ${isMobile ? '0.9em 0 0.5em' : '20px 0 12px'};
      color: var(--text-color);
      line-height: 1.4;
    }

    h5 {
      font-size: ${currentFontSizes.h5};
      font-weight: 600;
      margin: ${isMobile ? '0.8em 0 0.4em' : '18px 0 10px'};
      color: var(--text-color);
      line-height: 1.4;
    }

    h6 {
      font-size: ${currentFontSizes.h6};
      font-weight: 600;
      margin: ${isMobile ? '0.7em 0 0.3em' : '16px 0 8px'};
      color: var(--text-color);
      line-height: 1.4;
    }

    pre {
      font-size: ${currentFontSizes.pre};
      background-color: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: ${isMobile ? '1em' : '16px'};
      margin: ${isMobile ? '1em 0' : '16px 0'};
      overflow-x: auto;
      color: var(--text-color);
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    }

    code {
      font-size: ${currentFontSizes.code};
      background-color: var(--surface-color);
      padding: ${isMobile ? '0.2em 0.4em' : '2px 6px'};
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
      padding: ${isMobile ? '0.75em' : '12px'};
      outline: none;
      transition: border-color 0.2s ease;
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
      padding: ${isMobile ? '0.75em 1.5em' : '12px 24px'};
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
      margin: ${isMobile ? '0.5em 0' : '8px 0'};
    }

    blockquote {
      font-size: ${currentFontSizes.blockquote};
      color: var(--text-secondary-color);
      border-left: 3px solid var(--primary-color);
      padding-left: ${isMobile ? '1em' : '16px'};
      margin: ${isMobile ? '1em 0' : '16px 0'};
      font-style: italic;
    }

    caption, figcaption {
      font-size: ${currentFontSizes.caption};
      color: var(--text-secondary-color);
      text-align: center;
      margin: ${isMobile ? '0.5em 0' : '8px 0'};
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: ${isMobile ? '1em 0' : '16px 0'};
    }

    th, td {
      font-size: ${currentFontSizes.p};
      border: 1px solid var(--border-color);
      padding: ${isMobile ? '0.75em' : '12px'};
      text-align: left;
    }

    th {
      background-color: var(--surface-color);
      font-weight: 600;
    }

    hr {
      border: none;
      border-top: 1px solid var(--border-color);
      margin: ${isMobile ? '2em 0' : '32px 0'};
    }
  `;

  React.useEffect(() => {
    // 设置 HTML 的 data-theme 属性
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');

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