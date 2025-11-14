/**
 * Prism.js 高亮管理器
 * 负责管理代码块的语法高亮，包括语言包加载和高亮重试机制
 */

// @ts-ignore - prismjs doesn't have built-in types
import Prism from 'prismjs';
import {
  extractLanguagesFromHTML,
  loadMultiplePrismLanguages,
} from './prismLanguageLoader';
import { enhanceCodeBlocks } from './codeBlockEnhancer';

/**
 * 清除代码块的高亮标记
 */
export const clearHighlightMarks = (): void => {
  document
    .querySelectorAll('pre code[class*="language-"].highlighted')
    .forEach((block) => {
      block.classList.remove('highlighted');
    });
};

/**
 * 标记代码块为已高亮
 */
export const markBlocksAsHighlighted = (): void => {
  document.querySelectorAll('pre code[class*="language-"]').forEach((block) => {
    block.classList.add('highlighted');
  });
};

/**
 * 带重试机制的高亮函数
 * @param maxAttempts 最大重试次数
 * @param baseDelay 基础延迟时间（毫秒）
 * @returns Promise<void>
 */
export const highlightWithRetry = (
  maxAttempts = 3,
  baseDelay = 100,
): Promise<void> => new Promise((resolve) => {
  const retryHighlight = (attempts = 0) => {
    setTimeout(
      () => {
        try {
          // 使用 Prism.highlightAll() 重新高亮所有代码块
          Prism.highlightAll();

          // 检查是否还有未高亮的代码块，如果有且重试次数未达到上限，则继续重试
          const unhighlightedBlocks = document.querySelectorAll('pre code[class*="language-"]:not(.highlighted)');
          if (unhighlightedBlocks.length > 0 && attempts < maxAttempts) {
            console.log(`Retrying highlight, attempt ${attempts + 1}, remaining blocks: ${
              unhighlightedBlocks.length
            }`);
            retryHighlight(attempts + 1);
          } else {
            // 标记所有代码块为已高亮，避免重复处理
            markBlocksAsHighlighted();
            // 增强代码块（添加语言标签和复制按钮）
            enhanceCodeBlocks();
            resolve();
          }
        } catch (error) {
          console.warn('Failed to highlight code blocks:', error);
          resolve();
        }
      },
      baseDelay + attempts * baseDelay,
    ); // 递增延迟时间
  };

  retryHighlight();
});

/**
 * 高亮特定的代码块元素
 * @param codeBlocks 代码块元素列表
 */
export const highlightSpecificBlocks = (codeBlocks: NodeListOf<Element>): void => {
  codeBlocks.forEach((block) => {
    try {
      Prism.highlightElement(block as HTMLElement);
    } catch (error) {
      console.warn('Failed to highlight code block:', error);
    }
  });
};

/**
 * 完整的高亮流程：加载语言包 + 高亮代码
 * @param content HTML 内容字符串
 * @returns Promise<void>
 */
export const performCompleteHighlight = async (content: string): Promise<void> => {
  try {
    // 清除之前的高亮标记，确保可以重新高亮
    clearHighlightMarks();

    // 从内容中提取需要的语言包
    const requiredLanguages = extractLanguagesFromHTML(content);

    if (requiredLanguages.length > 0) {
      console.log('Loading languages:', requiredLanguages);
      // 加载所需的语言包
      await loadMultiplePrismLanguages(requiredLanguages);
    }

    // 执行带重试机制的高亮
    await highlightWithRetry();
  } catch (error) {
    console.warn('Failed to perform complete highlight:', error);
  }
};

/**
 * CSS 加载完成后的高亮处理
 * @param content HTML 内容字符串
 * @returns Promise<void>
 */
export const highlightAfterCSSLoad = async (content: string): Promise<void> => {
  try {
    // 清除之前的高亮标记，确保可以重新高亮
    clearHighlightMarks();

    // 从内容中提取需要的语言包
    const requiredLanguages = extractLanguagesFromHTML(content);

    if (requiredLanguages.length > 0) {
      // 加载所需的语言包
      await loadMultiplePrismLanguages(requiredLanguages);
    }

    const codeBlocks = document.querySelectorAll('pre code[class*="language-"]');
    highlightSpecificBlocks(codeBlocks);

    // 增强代码块
    setTimeout(() => {
      enhanceCodeBlocks();
    }, 100);
  } catch (error) {
    console.warn('Failed to highlight after CSS load:', error);
  }
};

/**
 * 组件挂载时的高亮处理
 * @param content HTML 内容字符串
 * @returns 清理函数
 */
export const highlightOnMount = async (content: string): Promise<() => void> => {
  try {
    // 清除之前的高亮标记，确保可以重新高亮
    clearHighlightMarks();

    // 从内容中提取需要的语言包
    const requiredLanguages = extractLanguagesFromHTML(content);

    if (requiredLanguages.length > 0) {
      // 加载所需的语言包
      await loadMultiplePrismLanguages(requiredLanguages);
    }

    // 延迟执行高亮，带重试机制
    const retryHighlightOnMount = (attempts = 0): ReturnType<typeof setTimeout> => setTimeout(
      () => {
        try {
          Prism.highlightAll();

          // 检查是否还有未高亮的代码块，如果有且重试次数未达到上限，则继续重试
          const unhighlightedBlocks = document.querySelectorAll('pre code[class*="language-"]:not(.highlighted)');
          if (unhighlightedBlocks.length > 0 && attempts < 2) {
            console.log(`Retrying highlight on mount, attempt ${attempts + 1}`);
            retryHighlightOnMount(attempts + 1);
          } else {
            // 标记所有代码块为已高亮
            markBlocksAsHighlighted();
            // 增强代码块
            enhanceCodeBlocks();
          }
        } catch (error) {
          console.warn('Failed to highlight code blocks on mount:', error);
        }
      },
      200 + attempts * 150,
    );

    const timer = retryHighlightOnMount();
    return () => clearTimeout(timer);
  } catch (error) {
    console.warn('Failed to highlight on mount:', error);
    return () => {};
  }
};
