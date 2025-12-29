import React, { useEffect, useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import useTheme from '../../hooks/useTheme';

// 导入原有工具
import { loadThemeStyles } from './codeBlocks/cssLoader';
import { generateContentStyles, generateInlineStyles } from './contentStyles';
import { cleanCodeMirrorContent } from './codeBlocks/codeMirrorCleaner';
import { getProcessorOptions } from './externalRes/processor';
import { useBlogHighlighter } from './useBlogHighlighter';

interface ContentViewProps {
  content: string;
}

const ContentView: React.FC<ContentViewProps> = ({ content }) => {
  const { theme } = useTheme();
  const [cssLoaded, setCssLoaded] = useState(false);

  // 1. 处理主题 CSS 加载
  useEffect(() => {
    let isMounted = true;
    loadThemeStyles(theme).then(() => {
      if (isMounted) setCssLoaded(true);
    });
    return () => {
      isMounted = false;
    };
  }, [theme]);

  // 2. 抽离的复杂高亮逻辑副作用
  useBlogHighlighter(content, cssLoaded, theme);

  // 3. 内容预处理（Memo化防止重复计算）
  const processedContent = useMemo(() => {
    const cleaned = cleanCodeMirrorContent(content);
    return DOMPurify.sanitize(cleaned);
  }, [content]);

  // 4. 解析配置 (识别 twitter/youtube)
  const parseOptions = useMemo(() => getProcessorOptions(), []);

  return (
    <>
      <style>{generateContentStyles(theme)}</style>
      <div
        className={`blog-content ${theme === 'dark' ? 'cm-s-yonce' : 'cm-s-duotone-light'}`}
        style={generateInlineStyles()}
      >
        {/* 不再使用 dangerouslySetInnerHTML，而是解析后的 React 组件树 */}
        {parse(processedContent, parseOptions)}
      </div>
    </>
  );
};

export default ContentView;
