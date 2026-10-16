// hooks/useBlogHighlighter.ts
import { useEffect } from 'react';

// 导入拆分后的模块
import { performCompleteHighlight } from './codeBlocks/prismHighlighter';
import {
  removeCodeBlockEnhancements,
  createCodeBlockObserver,
} from './codeBlocks/codeBlockEnhancer';

/**
 * 博客代码高亮副作用
 * @param processedContent 已经过 cleanCodeMirrorContent + DOMPurify 处理的内容
 * @param cssLoaded 主题 CSS 是否加载完成
 * @param theme 当前主题
 */
export const useBlogHighlighter = (
  processedContent: string,
  cssLoaded: boolean,
  theme: string,
) => {
  useEffect(() => {
    if (!cssLoaded || !processedContent) return;

    let cancelled = false;
    let observer: MutationObserver | null = null;

    const initHighlight = async () => {
      // 1. 清理上一轮增强效果
      removeCodeBlockEnhancements();

      // 2. 单次完整高亮流程（语言包加载 + 高亮 + 增强）
      await performCompleteHighlight(processedContent);

      if (cancelled) return;

      // 3. 观察器收敛到正文容器，避免监听整个 document.body 造成巨大开销
      const root = document.querySelector('.blog-content');
      if (root) {
        observer = createCodeBlockObserver();
        observer.observe(root, { childList: true, subtree: true });
      }
    };

    void initHighlight();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [processedContent, cssLoaded, theme]);
};
