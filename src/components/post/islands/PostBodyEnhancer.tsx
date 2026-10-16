import React, { useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import useTheme from '../../../hooks/useTheme';
import { loadThemeStyles } from '../codeBlocks/cssLoader';
import { generateContentStyles } from '../contentStyles';
import {
  cleanCodeMirrorContentInContainer,
} from '../codeBlocks/codeMirrorCleaner';
import {
  performCompleteHighlightOnContainer,
} from '../codeBlocks/prismHighlighter';
import {
  createCodeBlockObserver,
  removeCodeBlockEnhancements,
} from '../codeBlocks/codeBlockEnhancer';
import { parseExternalRes, renderExternalEmbed } from '../externalRes/embeds';
import ImageLightbox from './ImageLightbox';

/**
 * 正文增强岛屿（Blogger 原生渲染管线专用）
 *
 * 原生模板中文章正文由 <data:post.body/> 直接服务端渲染，
 * 本组件不重新渲染正文，而是在既有 DOM 上做增强：
 * 1. 清理 CodeMirror 编辑器残留结构，转换为 Prism 可识别的代码块
 * 2. 按需加载 KaTeX / Prism / CodeMirror 主题 CSS，并注入正文排版样式
 * 3. 代码高亮 + 语言标签 / 复制按钮增强 + 新增代码块自动观察
 * 4. 将 external-res-* 占位符替换为独立的 React 嵌入组件（Tweet / YouTube / Bilibili）
 * 5. 图片点击灯箱
 */

interface PostBodyEnhancerProps {
  /** 正文容器选择器，默认为 Blogger 原生的 .post-body */
  containerSelector?: string;
}

/** 注入正文样式使用的 style 标签 id，便于主题切换时替换 */
const CONTENT_STYLE_ID = 'blogger-native-content-styles';

const injectContentStyles = (css: string): void => {
  let styleEl = document.getElementById(CONTENT_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = CONTENT_STYLE_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
};

const PostBodyEnhancer: React.FC<PostBodyEnhancerProps> = ({
  containerSelector = '.post-body',
}) => {
  const { theme } = useTheme();
  const [cssLoaded, setCssLoaded] = useState(false);

  /* 1. 加载 KaTeX / Prism / CodeMirror 主题 CSS（随主题切换） */
  useEffect(() => {
    let isMounted = true;
    loadThemeStyles(theme)
      .then(() => {
        if (isMounted) setCssLoaded(true);
      })
      .catch(() => {
        if (isMounted) setCssLoaded(true);
      });
    return () => {
      isMounted = false;
    };
  }, [theme]);

  /* 2. 注入正文排版样式（随主题切换） */
  useEffect(() => {
    injectContentStyles(generateContentStyles(theme));
  }, [theme]);

  /* 3. 正文 DOM 增强：清理 + 高亮 + 外链嵌入 */
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(containerSelector);
    if (!container) return;

    // 3.1 清理 CodeMirror 残留（原地修改，幂等）
    cleanCodeMirrorContentInContainer(container);

    // 3.2 外链占位符替换为独立 React Root
    const embedRoots: Root[] = [];
    container.querySelectorAll<HTMLElement>('[class*="external-res-"]').forEach((placeholder) => {
      const parsed = parseExternalRes(placeholder.className);
      if (!parsed) return;

      const host = document.createElement('div');
      placeholder.replaceWith(host);
      const root = createRoot(host);
      root.render(renderExternalEmbed(parsed.type, parsed.id));
      embedRoots.push(root);
    });

    // 主题 CSS 未就绪前不进行高亮（避免样式闪烁）
    if (!cssLoaded) {
      return () => {
        embedRoots.forEach(root => root.unmount());
      };
    }

    let cancelled = false;
    let observer: MutationObserver | null = null;

    const initHighlight = async () => {
      // 清理上一轮增强效果，保证主题切换后可重新高亮
      removeCodeBlockEnhancements();
      await performCompleteHighlightOnContainer(container);
      if (cancelled) return;

      // 观察器收敛到正文容器，自动增强新增代码块
      observer = createCodeBlockObserver();
      observer.observe(container, { childList: true, subtree: true });
    };

    void initHighlight();

    return () => {
      cancelled = true;
      observer?.disconnect();
      embedRoots.forEach(root => root.unmount());
    };
  }, [cssLoaded, theme, containerSelector]);

  // 本组件无可视化输出，仅渲染灯箱（覆盖层经 Portal 挂到 body）
  return <ImageLightbox containerSelector={containerSelector} />;
};

export default PostBodyEnhancer;
