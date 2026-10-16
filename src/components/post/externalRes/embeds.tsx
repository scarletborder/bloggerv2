import { Tweet } from 'react-tweet';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import type { CSSProperties } from 'react';
import type { JSX } from 'react/jsx-runtime';

/**
 * 外链资源嵌入组件（推特 / YouTube / Bilibili）。
 * 这些 JSX 同时被两条渲染管线复用：
 * 1. React 渲染管线：html-react-parser 的 replace 钩子（见 processor.tsx）
 * 2. Blogger 原生渲染管线：PostBodyEnhancer 将占位节点替换为独立 React Root
 */

/** 推文卡片容器的修正样式（作用于 react-tweet 内部结构） */
export const tweetFixStyle = `
  .tweet-container-fix  .react-tweet-theme {
    background-color: transparent !important;
  }

  .tweet-container-fix div[class*="_avatarOverflow"] img {
    object-position: center top !important;
    transform: translateY(-16px) !important;
  }

  /* --- 2. 新增：自定义推文正文 (<p>标签) --- */
  /* 使用 article > p[lang] 来精准定位那段文字 */
  .tweet-container-fix article > p[lang] {
   margin: 0 0;
  }

  /* 可选：如果你想修改里面的链接颜色 */
  .tweet-container-fix article > p[lang] a {
    color: #1d9bf0 !important;
    text-decoration: none !important;
  }
`;

/** 视频容器的通用样式（YouTube / Bilibili 共用） */
const videoWrapperStyle: CSSProperties = {
  margin: '20px 0',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

/**
 * 从 class 属性中解析外链占位符，如 `external-res-youtube-a1b2c3`
 * @returns 解析出的类型与 ID，非外链占位符返回 null
 */
export const parseExternalRes = (className: string): { type: string; id: string } | null => {
  if (!className?.includes('external-res-')) return null;

  const parts = className.split('-');
  const type = parts[2];
  const id = parts[3];

  if (type && id) return { type, id };
  return null;
};

/**
 * 根据类型与 ID 渲染对应的外链嵌入组件
 * @returns React 元素；未知类型返回 null
 */
export const renderExternalEmbed = (type: string, id: string): JSX.Element | null => {
  if (type === 'twitter') {
    return (
      // 给外层加一个特定 class: tweet-container-fix，用于 CSS 作用域限定
      <div
        className="tweet-container-fix"
        style={{ margin: '20px 0', width: '100%', display: 'flex', justifyContent: 'center' }}
      >
        {/* 注入 Style */}
        <style>{tweetFixStyle}</style>

        {/* 限制最大宽度，模拟官方推特卡片感 */}
        <div style={{ width: '100%', maxWidth: '550px' }}>
          <Tweet id={id} />
        </div>
      </div>
    );
  }

  if (type === 'youtube') {
    return (
      <div style={videoWrapperStyle}>
        <LiteYouTubeEmbed id={id} title="YouTube Video" lazyLoad={true} />
      </div>
    );
  }

  // Bilibili 逻辑
  if (type === 'bilibili') {
    return (
      <div
        style={{
          ...videoWrapperStyle,
          backgroundColor: '#000', // 防止加载前白屏
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9', // 保持 16:9 比例
        }}
      >
        <iframe
          title="Bilibili Video"
          src={`//player.bilibili.com/player.html?bvid=${id}&page=1&high_quality=1&danmaku=0&autoplay=0`}
          allowFullScreen={true}
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            border: 'none',
          }}
          loading="lazy" // 性能优化：滚动到位置再加载
        />
      </div>
    );
  }

  return null;
};
