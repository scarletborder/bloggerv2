/**
 * 代码块增强功能样式
 * 为语言标签和复制按钮提供样式定义
 */

/**
 * 生成代码块增强功能的 CSS 样式
 * @param theme 当前主题 ('dark' | 'light')
 * @returns CSS 样式字符串
 */
export const generateCodeBlockEnhancementStyles = (theme: string): string => {
  return `
    /* 代码块工具栏样式 */
    .code-toolbar {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 10;
      pointer-events: none;
    }

    /* 语言标签样式 */
    .code-language-label {
      background-color: ${
        theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
      };
      color: ${
        theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)"
      };
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      border: 1px solid ${
        theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
      };
      pointer-events: none;
      user-select: none;
    }

    /* 复制按钮样式 */
    .code-copy-button {
      background-color: ${
        theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
      };
      color: ${
        theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)"
      };
      border: 1px solid ${
        theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
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
      pointer-events: auto;
      outline: none;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .code-copy-button:hover {
      background-color: ${
        theme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"
      };
      color: ${
        theme === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)"
      };
      border-color: ${
        theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"
      };
      transform: translateY(-1px);
    }

    .code-copy-button:active {
      transform: translateY(0);
    }

    .code-copy-button:focus-visible {
      box-shadow: 0 0 0 2px ${
        theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"
      };
    }

    /* 复制成功状态 */
    .code-copy-button.copied {
      background-color: ${
        theme === "dark" ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.1)"
      };
      color: ${theme === "dark" ? "#22c55e" : "#16a34a"};
      border-color: ${
        theme === "dark" ? "rgba(34, 197, 94, 0.3)" : "rgba(34, 197, 94, 0.2)"
      };
    }

    /* 复制失败状态 */
    .code-copy-button.error {
      background-color: ${
        theme === "dark" ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.1)"
      };
      color: ${theme === "dark" ? "#ef4444" : "#dc2626"};
      border-color: ${
        theme === "dark" ? "rgba(239, 68, 68, 0.3)" : "rgba(239, 68, 68, 0.2)"
      };
    }

    /* 复制图标样式 */
    .copy-icon {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
    }

    /* 复制文本样式 */
    .copy-text {
      white-space: nowrap;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* 增强的代码块样式调整 */
    .enhanced-code-block {
      position: relative !important;
    }

    /* 确保工具栏不会被代码内容遮挡 */
    .enhanced-code-block .code-toolbar {
      background: linear-gradient(
        135deg, 
        ${
          theme === "dark"
            ? "rgba(40, 42, 54, 0.8)"
            : "rgba(248, 249, 250, 0.8)"
        } 0%,
        ${
          theme === "dark"
            ? "rgba(40, 42, 54, 0.95)"
            : "rgba(248, 249, 250, 0.95)"
        } 100%
      );
      backdrop-filter: blur(4px);
      border-radius: 6px;
      padding: 4px;
      box-shadow: ${
        theme === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)"
      } 0px 2px 4px;
    }

    /* 移动端适配 */
    @media (max-width: 768px) {
      .code-toolbar {
        top: 6px;
        right: 6px;
        gap: 6px;
      }

      .code-language-label {
        padding: 1px 6px;
        font-size: 10px;
      }

      .code-copy-button {
        padding: 3px 6px;
        font-size: 10px;
      }

      .copy-icon {
        width: 10px;
        height: 10px;
      }

      .copy-text {
        font-size: 9px;
      }

      .enhanced-code-block .code-toolbar {
        padding: 3px;
      }
    }

    /* 高对比度模式支持 */
    @media (prefers-contrast: high) {
      .code-language-label {
        background-color: ${
          theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"
        };
        border-width: 2px;
      }

      .code-copy-button {
        background-color: ${
          theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"
        };
        border-width: 2px;
      }
    }

    /* 减少动画偏好支持 */
    @media (prefers-reduced-motion: reduce) {
      .code-copy-button {
        transition: none;
      }

      .code-copy-button:hover {
        transform: none;
      }

      .code-copy-button:active {
        transform: none;
      }
    }

    /* 打印样式 */
    @media print {
      .code-toolbar {
        display: none;
      }
    }

    /* 暗色主题下的特殊调整 */
    ${
      theme === "dark"
        ? `
      .code-copy-button:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      .enhanced-code-block .code-toolbar {
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
    `
        : `
      .code-copy-button:hover {
        background-color: rgba(0, 0, 0, 0.2);
      }
      
      .enhanced-code-block .code-toolbar {
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
    `
    }
  `;
};
