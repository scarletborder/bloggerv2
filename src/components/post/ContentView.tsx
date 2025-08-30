import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import useTheme from "../../hooks/useTheme";

// 导入拆分后的模块
import { loadThemeStyles } from "./codeBlocks/cssLoader";
import { generateContentStyles, generateInlineStyles } from "./contentStyles";
import { cleanCodeMirrorContent } from "./codeBlocks/codeMirrorCleaner";
import {
  performCompleteHighlight,
  highlightAfterCSSLoad,
  highlightOnMount,
} from "./codeBlocks/prismHighlighter";
import {
  removeCodeBlockEnhancements,
  createCodeBlockObserver,
} from "./codeBlocks/codeBlockEnhancer";

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

  // 主题样式加载 Effect
  useEffect(() => {
    const loadStyles = async () => {
      try {
        setCssLoaded(false);

        // 加载主题相关的 CSS 文件
        await loadThemeStyles(theme);

        // 标记 CSS 已加载完成
        setCssLoaded(true);

        // CSS 加载完成后，重新高亮所有代码块
        setTimeout(async () => {
          const cleanedContent = cleanCodeMirrorContent(content);
          const sanitizedContent = DOMPurify.sanitize(cleanedContent);
          await highlightAfterCSSLoad(sanitizedContent);
        }, 50);
      } catch (error) {
        console.warn("Failed to load some CSS files:", error);
        setCssLoaded(true); // 即使失败也标记为已完成，避免卡住
      }
    };

    loadStyles();
  }, [theme, content]);

  // 内容变化时的高亮 Effect
  useEffect(() => {
    // 只有在 CSS 加载完成后才执行高亮
    if (!cssLoaded) return;

    // 清除之前的代码块增强
    removeCodeBlockEnhancements();

    // 动态加载所需语言包并高亮代码
    const highlightCode = async () => {
      // 使用处理后的内容进行语言提取，而不是原始内容
      const cleanedContent = cleanCodeMirrorContent(content);
      const sanitizedContent = DOMPurify.sanitize(cleanedContent);
      await performCompleteHighlight(sanitizedContent);
    };

    highlightCode();
  }, [content, cssLoaded]);

  // 组件挂载时的高亮 Effect
  useEffect(() => {
    if (!cssLoaded) return;

    const setupHighlightOnMount = async () => {
      const cleanedContent = cleanCodeMirrorContent(content);
      const sanitizedContent = DOMPurify.sanitize(cleanedContent);
      const cleanup = await highlightOnMount(sanitizedContent);
      return cleanup;
    };

    let cleanup: (() => void) | undefined;

    setupHighlightOnMount().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [cssLoaded, content]);

  // 代码块观察器 Effect
  useEffect(() => {
    if (!cssLoaded) return;

    // 创建观察器来监听动态添加的代码块
    const observer = createCodeBlockObserver();

    // 开始观察 DOM 变化
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [cssLoaded]);

  // 清理和简化 CodeMirror 生成的复杂 HTML 结构
  const cleanedContent = cleanCodeMirrorContent(content);

  // 使用 DOMPurify 清理传入的 HTML 字符串，防止 XSS 攻击
  const sanitizedContent = DOMPurify.sanitize(cleanedContent);

  // 生成样式
  const contentStyles = generateContentStyles(theme);
  const inlineStyles = generateInlineStyles();

  return (
    <>
      <style>{contentStyles}</style>
      <div
        className={`blog-content ${theme === "dark" ? "cm-s-yonce" : "cm-s-duotone-light"
          }`}
        style={inlineStyles}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </>
  );
};

export default ContentView;
