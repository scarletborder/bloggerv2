import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
// @ts-ignore - prismjs doesn't have built-in types
import Prism from 'prismjs';
// 导入常用语言支持
// @ts-ignore
import 'prismjs/components/prism-javascript';
// @ts-ignore
import 'prismjs/components/prism-typescript';
// @ts-ignore
import 'prismjs/components/prism-jsx';
// @ts-ignore
import 'prismjs/components/prism-tsx';
// @ts-ignore
import 'prismjs/components/prism-json';
// @ts-ignore
import 'prismjs/components/prism-css';
// @ts-ignore
import 'prismjs/components/prism-python';
// @ts-ignore
import 'prismjs/components/prism-bash';
// @ts-ignore
import 'prismjs/components/prism-sql';
import useTheme from '../../hooks/useTheme';

interface ContentViewProps {
  content: string;
}

/**
 * 内容渲染组件 - 安全地渲染包含各种格式的 HTML 字符串
 * 支持 Prism.js 语法高亮、KaTeX 数学公式、CodeMirror 代码块
 */
const ContentView: React.FC<ContentViewProps> = ({ content }) => {
  const { theme } = useTheme();
  const [cssLoaded, setCssLoaded] = useState(false);

  // 动态加载 CSS 的函数，返回 Promise
  const loadCSS = (href: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // 如果已存在相同 id 的样式表，先移除
      const existing = document.getElementById(id);
      if (existing) {
        existing.remove();
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.id = id;

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));

      document.head.appendChild(link);
    });
  };

  useEffect(() => {
    // 异步加载 CSS 文件
    const loadStyles = async () => {
      try {
        setCssLoaded(false);

        // 加载基础 CSS（始终需要）
        await Promise.all([
          loadCSS('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.10.0/katex.min.css', 'katex-css'),
          loadCSS('https://cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.css', 'codemirror-base-css')
        ]);

        // 根据主题加载不同的样式
        if (theme === 'dark') {
          await Promise.all([
            loadCSS('https://cdn.jsdelivr.net/gh/PrismJS/prism-themes@master/themes/prism-atom-dark.css', 'prism-theme-css'),
            loadCSS('https://cdn.jsdelivr.net/npm/codemirror@5/theme/yonce.css', 'codemirror-theme-css')
          ]);
        } else {
          await Promise.all([
            loadCSS('https://cdn.jsdelivr.net/gh/PrismJS/prism-themes@master/themes/prism-one-light.css', 'prism-theme-css'),
            loadCSS('https://cdn.jsdelivr.net/npm/codemirror@5/theme/duotone-light.css', 'codemirror-theme-css')
          ]);
        }

        // 标记 CSS 已加载完成
        setCssLoaded(true);

        // CSS 加载完成后，重新高亮所有代码块
        setTimeout(() => {
          const codeBlocks = document.querySelectorAll('pre code[class*="language-"]');
          codeBlocks.forEach((block) => {
            try {
              Prism.highlightElement(block as HTMLElement);
            } catch (error) {
              console.warn('Failed to highlight code block:', error);
            }
          });
        }, 50);

      } catch (error) {
        console.warn('Failed to load some CSS files:', error);
        setCssLoaded(true); // 即使失败也标记为已完成，避免卡住
      }
    };

    loadStyles();
  }, [theme]);

  useEffect(() => {
    // 只有在 CSS 加载完成后才执行高亮
    if (!cssLoaded) return;

    // 等待 DOM 渲染完成后执行高亮
    const highlightCode = () => {
      setTimeout(() => {
        try {
          // 使用 Prism.highlightAll() 重新高亮所有代码块
          Prism.highlightAll();
        } catch (error) {
          console.warn('Failed to highlight code blocks:', error);
        }
      }, 100);
    };

    highlightCode();
  }, [content, cssLoaded]);

  // 组件挂载后确保高亮，但要等待 CSS 加载完成
  useEffect(() => {
    if (!cssLoaded) return;

    const timer = setTimeout(() => {
      try {
        Prism.highlightAll();
      } catch (error) {
        console.warn('Failed to highlight code blocks on mount:', error);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [cssLoaded]);

  // 清理和简化 CodeMirror 生成的复杂 HTML 结构
  const cleanCodeMirrorContent = (htmlContent: string): string => {
    // 创建一个临时的 DOM 元素来解析 HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // 处理新的 HTML 结构：<pre class="md-fences ..."><pre class="cleaned-codemirror-block"><code class="language-js">
    const mdFencesBlocks = tempDiv.querySelectorAll('pre.md-fences');

    mdFencesBlocks.forEach((outerPre) => {
      // 检查是否包含 cleaned-codemirror-block
      const innerPre = outerPre.querySelector('pre.cleaned-codemirror-block');
      const codeElement = innerPre?.querySelector('code');

      if (innerPre && codeElement) {
        // 获取语言信息，优先从外层 pre 获取 lang 属性
        const langAttr = outerPre.getAttribute('lang') || '';

        // 清理代码内容 - 替换 &nbsp; 为普通空格
        let codeContent = codeElement.textContent || '';
        codeContent = codeContent.replace(/\u00A0/g, ' '); // 替换 &nbsp; (非断行空格)

        // 创建新的简化代码块
        const newPre = document.createElement('pre');
        const newCode = document.createElement('code');

        // 设置语言类名用于 Prism 高亮
        if (langAttr) {
          newCode.className = `language-${langAttr}`;
        }

        newCode.textContent = codeContent;
        newPre.appendChild(newCode);
        newPre.className = 'cleaned-codemirror-block';

        // 替换整个外层 pre
        outerPre.parentNode?.replaceChild(newPre, outerPre);
      }
    });

    // 查找所有 CodeMirror 代码块（处理其他可能的结构）
    const codeMirrorBlocks = tempDiv.querySelectorAll('.CodeMirror');

    codeMirrorBlocks.forEach((block) => {
      // 提取所有代码行的文本内容
      const codeLines = block.querySelectorAll('.CodeMirror-line');
      const codeContent: string[] = [];

      codeLines.forEach((line) => {
        // 获取每行的纯文本内容，忽略所有的样式和结构
        const lineText = line.textContent || '';
        // 过滤掉那些无意义的 "xxxxxxxxxx" 内容
        if (lineText.trim() && !lineText.match(/^x+$/)) {
          codeContent.push(lineText);
        }
      });

      // 如果提取到了有效的代码内容
      if (codeContent.length > 0) {
        // 创建一个简单的 pre 元素来替换复杂的 CodeMirror 结构
        const simpleCodeBlock = document.createElement('pre');
        const codeElement = document.createElement('code');

        // 保留原始的语言信息（如果有的话）
        const langAttr = block.getAttribute('lang') || '';
        if (langAttr) {
          codeElement.className = `language-${langAttr}`;
        }

        // 设置代码内容，替换 &nbsp; 为普通空格
        let joinedContent = codeContent.join('\n');
        joinedContent = joinedContent.replace(/\u00A0/g, ' ');
        codeElement.textContent = joinedContent;
        simpleCodeBlock.appendChild(codeElement);

        // 添加自定义类名用于样式控制
        simpleCodeBlock.className = 'cleaned-codemirror-block';

        // 替换原始的 CodeMirror 块
        block.parentNode?.replaceChild(simpleCodeBlock, block);
      } else {
        // 如果没有有效内容，直接移除这个块
        block.parentNode?.removeChild(block);
      }
    });

    // 同时处理包含 CodeMirror 的 pre 标签（保留原有逻辑作为后备）
    const preTags = tempDiv.querySelectorAll('pre.md-fences');
    preTags.forEach((preTag) => {
      const codeMirrorDiv = preTag.querySelector('.CodeMirror');
      if (codeMirrorDiv) {
        // 提取代码内容
        const codeLines = codeMirrorDiv.querySelectorAll('.CodeMirror-line');
        const codeContent: string[] = [];

        codeLines.forEach((line) => {
          const lineText = line.textContent || '';
          if (lineText.trim() && !lineText.match(/^x+$/)) {
            codeContent.push(lineText);
          }
        });

        if (codeContent.length > 0) {
          // 获取语言信息
          const langAttr = preTag.getAttribute('lang') || codeMirrorDiv.getAttribute('lang') || '';

          // 创建简化的代码块
          const simpleCodeBlock = document.createElement('pre');
          const codeElement = document.createElement('code');

          if (langAttr) {
            codeElement.className = `language-${langAttr}`;
          }

          let joinedContent = codeContent.join('\n');
          joinedContent = joinedContent.replace(/\u00A0/g, ' ');
          codeElement.textContent = joinedContent;
          simpleCodeBlock.appendChild(codeElement);
          simpleCodeBlock.className = 'cleaned-codemirror-block';

          // 替换整个 pre 标签
          preTag.parentNode?.replaceChild(simpleCodeBlock, preTag);
        }
      }
    });

    return tempDiv.innerHTML;
  };

  // 使用 DOMPurify 清理传入的 HTML 字符串，防止 XSS 攻击
  const cleanedContent = cleanCodeMirrorContent(content);
  const sanitizedContent = DOMPurify.sanitize(cleanedContent);
  // ====================================================================
  // 重构后的 React 内联样式
  // ====================================================================
  const styles: React.CSSProperties = {
    lineHeight: 1.7,
    color: 'var(--text-color)',
    // 提供 px 作为 rem 的后备
    fontSize: '18px',
    // @ts-ignore - 允许 rem 单位
    fontSize: '1.125rem', // 18px / 16px = 1.125rem
    maxWidth: '100%',
    wordBreak: 'break-word',
  };

  // ====================================================================
  // 重构后的 CSS 模板字符串
  // ====================================================================
  const contentStyles = `
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
    
    /* 修正：原代码中 h4, h5, h6 缺失，可以按需补充 */

    .blog-content p {
      margin-top: 16px;
      margin-top: 1rem;
      margin-bottom: 16px;
      margin-bottom: 1rem;
      line-height: 1.7;
    }

    .blog-content pre {
      background-color: ${theme === 'dark' ? '#282a36' : '#f8f9fa'};
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
      background-color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
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
      background-color: ${theme === 'dark' ? '#282a36' : '#f8f9fa'};
      padding: 16px;
      padding: 1rem;
      border-radius: 8px;
      border-radius: 0.5rem;
      color: ${theme === 'dark' ? '#f8f8f2' : '#333'};
      overflow-x: auto;
    }

    /* 清理后的 CodeMirror 块样式 */
    .blog-content .cleaned-codemirror-block {
      background-color: ${theme === 'dark' ? '#282a36' : '#f8f9fa'};
      color: ${theme === 'dark' ? '#f8f8f2' : '#333'};
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
      color: inherit !important;
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
  return (
    <>
      <style>{contentStyles}</style>
      <div
        className={`blog-content ${theme === 'dark' ? 'cm-s-yonce' : 'cm-s-duotone-light'}`}
        style={styles}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </>
  );
};

export default ContentView;
