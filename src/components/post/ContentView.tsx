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

  // 2. 内容预处理（清理 + 净化），仅在 content 变化时执行
  const processedContent = useMemo(() => {
    const cleaned = cleanCodeMirrorContent(content);
    return DOMPurify.sanitize(cleaned);
  }, [content]);

  // 3. 抽离的复杂高亮逻辑副作用（直接复用预处理结果，避免重复清理）
  useBlogHighlighter(processedContent, cssLoaded, theme);

  // 4. 解析配置 (识别 twitter/youtube)
  const parseOptions = useMemo(() => getProcessorOptions(), []);

  // 5. 样式字符串与解析树 memo 化，避免每次渲染重复生成/解析
  const contentCss = useMemo(() => generateContentStyles(theme), [theme]);
  const inlineStyles = useMemo(() => generateInlineStyles(), []);
  const parsedContent = useMemo(
    () => parse(processedContent, parseOptions),
    [processedContent, parseOptions],
  );

  return (
    <>
      <style>{contentCss}</style>
      <div
        className={`blog-content ${theme === 'dark' ? 'cm-s-yonce' : 'cm-s-duotone-light'}`}
        style={inlineStyles}
      >
        {/* 不再使用 dangerouslySetInnerHTML，而是解析后的 React 组件树 */}
        {parsedContent}
      </div>
    </>
  );
};

export default ContentView;
