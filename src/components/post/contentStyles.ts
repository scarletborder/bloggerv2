/**
 * 内容样式生成器
 * 根据主题生成博客内容的 CSS 样式
 */

/**
 * 生成内容样式的 CSS 字符串
 * @param theme 当前主题 ('dark' | 'light')
 * @returns CSS 样式字符串
 */
export const generateContentStyles = (theme: string): string => {
  return `
    .blog-content {
      line-height: 1.7;
      color: var(--text-color);
      /* 桌面端基础字号 (18px) */
      font-size: 18px;
      font-size: 1.125rem; /* 18 / 16 */
      max-width: 100%;
      word-break: break-word;
    }

    .blog-content h1,
    .blog-content h2,
    .blog-content h3,
    .blog-content h4,
    .blog-content h5,
    .blog-content h6 {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.3em;
      margin-top: 24px;
      margin-top: 1.5rem; /* 24 / 16 */
      margin-bottom: 16px;
      margin-bottom: 1rem; /* 16 / 16 */
      color: var(--text-color);
    }

    /* 标题层级 */
    .blog-content h1 {
      font-size: 40px;
      font-size: 2.5rem; /* 40 / 16 */
    }

    .blog-content h2 {
      font-size: 28px;
      font-size: 1.75rem; /* 28 / 16 */
    }

    .blog-content h3 {
      font-size: 25px;
      font-size: 1.5625rem; /* 25 / 16 */
    }

    .blog-content p {
      margin-top: 16px;
      margin-top: 1rem;
      margin-bottom: 16px;
      margin-bottom: 1rem;
      line-height: 1.7;
    }

    .blog-content pre {
      background-color: ${theme === "dark" ? "#282a36" : "#f8f9fa"};
      padding: 16px;
      padding: 1rem;
      border-radius: 8px;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 16px 0;
      margin: 1rem 0;
      font-size: 14px;
      font-size: 0.875rem; /* 14 / 16 */
    }

    .blog-content code {
      background-color: ${
        theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
      };
      padding: 2px 6px;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      border-radius: 0.25rem;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      /* 使用 em 单位使行内代码块大小相对于周围文本，这是推荐做法 */
      font-size: 0.9em;
    }

    .blog-content pre code {
      background-color: transparent;
      padding: 0;
    }

    .blog-content blockquote {
      border-left: 4px solid var(--primary-color);
      border-left: 0.25rem solid var(--primary-color);
      margin: 16px 0;
      margin: 1rem 0;
      color: var(--text-secondary-color);
      font-style: italic;
      background-color: var(--surface-color);
      padding: 12px 16px;
      padding: 0.75rem 1rem;
      border-radius: 4px;
      border-radius: 0.25rem;
    }

    .blog-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      border-radius: 0.5rem;
      margin: 16px 0;
      margin: 1rem 0;
      box-shadow: var(--shadow-color) 0px 2px 8px;
    }

    .blog-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      margin: 1rem 0;
      font-size: 16px;
      font-size: 1rem;
    }

    .blog-content th,
    .blog-content td {
      border: 1px solid var(--border-color);
      padding: 8px 12px;
      padding: 0.5rem 0.75rem;
      text-align: left;
    }

    .blog-content th {
      background-color: var(--surface-color);
      font-weight: bold;
    }

    .blog-content ul,
    .blog-content ol {
      padding-left: 24px;
      padding-left: 1.5rem;
      margin: 16px 0;
      margin: 1rem 0;
    }

    .blog-content li {
      margin: 6px 0;
      margin: 0.375rem 0;
    }

    /* CodeMirror 样式 - 原始复杂结构的样式 */
    .blog-content .CodeMirror-scroll {
      background-color: ${theme === "dark" ? "#282a36" : "#f8f9fa"};
      padding: 16px;
      padding: 1rem;
      border-radius: 8px;
      border-radius: 0.5rem;
      color: ${theme === "dark" ? "#f8f8f2" : "#333"};
      overflow-x: auto;
    }

    /* 清理后的 CodeMirror 块样式 */
    .blog-content .cleaned-codemirror-block {
      background-color: ${theme === "dark" ? "#282a36" : "#f8f9fa"};
      color: ${theme === "dark" ? "#f8f8f2" : "#333"};
      padding: 16px;
      padding: 1rem;
      border-radius: 8px;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 16px 0;
      margin: 1rem 0;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      font-size: 0.875rem;
      line-height: 1.5;
      border: 1px solid var(--border-color);
    }

    .blog-content .cleaned-codemirror-block code {
      background-color: transparent !important;
      padding: 0 !important;
      border-radius: 0 !important;
      font-size: inherit !important;
      display: block;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* KaTeX 数学公式样式 */
    .blog-content .katex {
      font-size: 1.1em;
    }

    .blog-content .katex-display {
      margin: 20px 0;
      margin: 1.25rem 0;
      text-align: center;
    }

    /* ======================================================== */
    /* 移动端适配 (Mobile Overrides) 使用媒体查询                 */
    /* 768px 是一个常用的断点，您可以根据需要调整                 */
    /* ======================================================== */
    @media (max-width: 768px) {
      .blog-content {
        /* 移动端基础字号 (16px) */
        font-size: 16px;
        font-size: 1rem;
        padding: 0;
      }

      .blog-content h1,
      .blog-content h2,
      .blog-content h3,
      .blog-content h4,
      .blog-content h5,
      .blog-content h6 {
        margin-top: 20px;
        margin-top: 1.25rem; /* 20 / 16 */
        margin-bottom: 12px;
        margin-bottom: 0.75rem; /* 12 / 16 */
      }

      .blog-content h1 {
        /* 在移动端，h1字体大小通常会比桌面端小，这里设置为 32px */
        font-size: 32px;
        font-size: 2rem;
      }
      
      .blog-content h2 {
        /* 24px */
        font-size: 24px;
        font-size: 1.5rem;
      }
      
      .blog-content h3 {
        /* 20px */
        font-size: 20px;
        font-size: 1.25rem;
      }
      
      .blog-content p {
        margin: 12px 0;
        margin: 0.75rem 0;
      }

      .blog-content pre {
        padding: 12px;
        padding: 0.75rem;
        margin: 12px 0;
        margin: 0.75rem 0;
        font-size: 13px;
        font-size: 0.8125rem; /* 13 / 16 */
        white-space: pre;
      }
      
      .blog-content blockquote {
        margin: 12px 0;
        margin: 0.75rem 0;
        padding: 8px 12px;
        padding: 0.5rem 0.75rem;
      }
      
      .blog-content img,
      .blog-content table,
      .blog-content ul,
      .blog-content ol {
        margin: 12px 0;
        margin: 0.75rem 0;
      }
      
      .blog-content table {
        font-size: 13px;
        font-size: 0.8125rem;
        display: block;
        overflow-x: auto;
        white-space: nowrap;
      }
      
      .blog-content th,
      .blog-content td {
        padding: 6px 8px;
        padding: 0.375rem 0.5rem;
      }
      
      .blog-content ul,
      .blog-content ol {
        padding-left: 20px;
        padding-left: 1.25rem;
      }
      
      .blog-content li {
        margin: 4px 0;
        margin: 0.25rem 0;
      }

      .blog-content .CodeMirror-scroll {
        padding: 12px;
        padding: 0.75rem;
      }

      .blog-content .cleaned-codemirror-block {
        padding: 12px;
        padding: 0.75rem;
        margin: 12px 0;
        margin: 0.75rem 0;
        font-size: 13px;
        font-size: 0.8125rem;
      }

      .blog-content .cleaned-codemirror-block code {
        font-size: inherit !important;
      }
      
      .blog-content .katex {
        font-size: 1em;
      }
      
      .blog-content .katex-display {
        margin: 16px 0;
        margin: 1rem 0;
      }
    }
  `;
};

/**
 * 生成内联样式对象
 * @returns React.CSSProperties
 */
export const generateInlineStyles = (): React.CSSProperties => ({
  lineHeight: 1.7,
  color: "var(--text-color)",
  // 提供 px 作为 rem 的后备
  fontSize: "18px",
  // @ts-ignore - 允许 rem 单位
  fontSize: "1.125rem", // 18px / 16px = 1.125rem
  maxWidth: "100%",
  wordBreak: "break-word",
});
