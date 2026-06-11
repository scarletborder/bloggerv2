import { Tweet } from 'react-tweet';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

// 定义全局注入的 CSS
const tweetFixStyle = `
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

const getProcessorOptions = () => ({
  replace: (domNode: any) => {
    if (!domNode.attribs) return;

    const className = domNode.attribs.class || '';

    if (className.includes('external-res-')) {
      const parts = className.split('-');
      const type = parts[2];
      const id = parts[3];

      if (type === 'twitter' && id) {
        return (
          // 给外层加一个特定 class: tweet-container-fix，用于 CSS 作用域限定
          <div className="tweet-container-fix" style={{ margin: '20px 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {/* 注入 Style */}
            <style>{tweetFixStyle}</style>

            {/* 限制最大宽度，模拟官方推特卡片感 */}
            <div style={{ width: '100%', maxWidth: '550px' }}>
              <Tweet id={id} />
            </div>
          </div>
        );
      }

      if (type === 'youtube' && id) {
        return (
          <div style={{
            margin: '20px 0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}>
            <LiteYouTubeEmbed id={id} title="YouTube Video" lazyLoad={true} />
          </div>
        );
      }

      // 3. 新增：Bilibili 逻辑
      if (type === 'bilibili' && id) {
        return (
          <div style={{
            margin: '20px 0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#000', // 防止加载前白屏
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9', // 保持 16:9 比例
          }}>
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
    }
  },
});

export { getProcessorOptions };
