// hooks/useBlogHighlighter.ts
import { useEffect } from 'react';
import DOMPurify from 'dompurify';

// 导入拆分后的模块
import { cleanCodeMirrorContent } from './codeBlocks/codeMirrorCleaner';
import {
  performCompleteHighlight,
  highlightOnMount,
} from './codeBlocks/prismHighlighter';
import {
  removeCodeBlockEnhancements,
  createCodeBlockObserver,
} from './codeBlocks/codeBlockEnhancer';


export const useBlogHighlighter = (content: string, cssLoaded: boolean, theme: string) => {
  useEffect(() => {
    if (!cssLoaded) return;

    const initHighlight = async () => {
      // 1. 清理增强效果
      removeCodeBlockEnhancements();

      // 2. 执行高亮 (这里直接传入清理过后的内容或直接操作 DOM)
      const cleaned = cleanCodeMirrorContent(content);
      const sanitized = DOMPurify.sanitize(cleaned);

      await performCompleteHighlight(sanitized);
      await highlightOnMount(sanitized);

      // 3. 启动观察器
      const observer = createCodeBlockObserver();
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    };

    const cleanupPromise = initHighlight();
    return () => {
      cleanupPromise.then(cleanup => cleanup?.());
    };
  }, [content, cssLoaded, theme]);
};
