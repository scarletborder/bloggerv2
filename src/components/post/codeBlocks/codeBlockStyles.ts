/**
 * 代码块增强功能样式
 * 为语言标签和复制按钮提供样式定义
 */

/**
 * 生成代码块增强功能的 CSS 样式
 * @param theme 当前主题 ('dark' | 'light')
 * @returns CSS 样式字符串
 */
export const generateCodeBlockEnhancementStyles = (
  theme: 'dark' | 'light',
): string => {
  return `
    /* 代码块容器整体样式 */
    .enhanced-code-block {
      position: relative; /* 改为非 important，避免不必要的覆盖 */
      border-radius: 8px;
      overflow: hidden;
      margin: 16px 0;
      border: 1px solid ${
        theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      };
    }

    /* 代码块头部，用于容纳工具栏 */
    .code-header {
      background: ${
        theme === 'dark'
          ? 'linear-gradient(135deg, #1e1e2e 0%, #24243e 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      };
      border-bottom: 1px solid ${
        theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      };
      padding: 8px 12px;
      display: flex;
      justify-content: flex-end; /* 修改为 flex-end 使工具栏靠右 */
      align-items: center;
      min-height: 36px;
      box-shadow: ${
        theme === 'dark'
          ? '0 1px 3px rgba(0, 0, 0, 0.3)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)'
      };
    }

    /* 工具栏，包含语言和复制按钮 */
    .code-toolbar {
      display: flex;
      gap: 8px;
    }

    /* 语言标签样式 */
    .code-language-label {
      background-color: ${
        theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
      };
      color: ${
        theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'
      };
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'JetBrains Mono', 'Consolas', 'Monaco', 'SF Mono', 'Cascadia Code', 'Roboto Mono', 'Courier New', "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", monospace;
      border: 1px solid ${
        theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
      };
      user-select: none;
    }

    /* 复制按钮样式 */
    .code-copy-button {
      background-color: ${
        theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      };
      color: ${
        theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'
      };
      border: 1px solid ${
        theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
      };
      border-radius: 4px;
      padding: 4px 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .code-copy-button:hover {
      background-color: ${
        theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
      };
      color: ${
        theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'
      };
      border-color: ${
        theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
      };
      transform: translateY(-1px);
      box-shadow: ${
        theme === 'dark'
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)'
      };
    }

    .code-copy-button:active {
      transform: translateY(0);
      box-shadow: none;
    }

    .code-copy-button:focus-visible {
      box-shadow: 0 0 0 2px ${
        theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
      };
    }

    /* 代码内容区域样式，应用于 <pre> 元素 */
    .code-content {
      background-color: ${theme === 'dark' ? '#282a36' : '#f8f9fa'};
      margin: 0 !important;
      border: none !important;
      border-radius: 0 !important;
    }

    /* 复制成功状态 */
    .code-copy-button.copied {
      background-color: ${
        theme === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'
      };
      color: ${theme === 'dark' ? '#22c55e' : '#16a34a'};
      border-color: ${
        theme === 'dark' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'
      };
    }

    /* 复制失败状态 */
    .code-copy-button.error {
      background-color: ${
        theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'
      };
      color: ${theme === 'dark' ? '#ef4444' : '#dc2626'};
      border-color: ${
        theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'
      };
    }

    .copy-icon {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
    }

    .copy-text {
      white-space: nowrap;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* 其他媒体查询和状态样式保持不变... */
    @media (max-width: 768px) {
      .code-header {
        padding: 6px 8px;
        min-height: 32px;
      }
      .code-toolbar { gap: 6px; }
      .code-language-label { padding: 3px 6px; font-size: 10px; }
      .code-copy-button { padding: 3px 6px; font-size: 10px; }
      .copy-icon { width: 10px; height: 10px; }
      .copy-text { font-size: 9px; }
    }
    @media (prefers-contrast: high) {
      .code-language-label, .code-copy-button {
        background-color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
        border-width: 2px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .code-copy-button { transition: none; }
      .code-copy-button:hover { transform: none; box-shadow: none; }
      .code-copy-button:active { transform: none; }
    }
    @media print {
      .code-header { display: none; }
    }
  `;
};
