import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { getCurrentTheme } from '../../constants/colors';
import type { BlogRollItem } from '../../constants/blogroll';
import type { JSX } from 'react/jsx-runtime';
interface BlogrollProps {
  isMobile?: boolean;
}

export default function Blogroll({ isMobile = false }: BlogrollProps): JSX.Element {
  const colors = getCurrentTheme();
  const [blogroll, setBlogroll] = React.useState<BlogRollItem[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    fetch(`${__CDN_BASE__}/static/blogroll.json`)
      .then(res => res.json())
      .then((data) => {
        if (!isMounted) return;
        setBlogroll((data ?? []) as BlogRollItem[]);
      })
      .catch(() => {
        if (!isMounted) return;
        setBlogroll([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // 如果友站数量超过显示限制，启用无限滚动
  const shouldScroll = !isMobile && blogroll.length > 8; // PC端一行两个，4行显示8个

  const [{ y }, api] = useSpring(() => ({ y: 0 }));

  // 无限滚动动画
  React.useEffect(() => {
    if (shouldScroll) {
      const itemHeight = 50; // 每个item高度 + margin
      const totalHeight = blogroll.length * itemHeight;
      const visibleHeight = 320; // 可视区域高度

      if (totalHeight > visibleHeight) {
        const scrollDistance = totalHeight - visibleHeight;

        const animate = () => {
          api.start({
            y: -scrollDistance,
            config: { duration: blogroll.length * 3000 }, // 根据数量调整速度
            onRest: () => {
              api.set({ y: 0 });
              setTimeout(animate, 1000); // 暂停1秒后重新开始
            },
          });
        };

        const timer = setTimeout(animate, 2000); // 2秒后开始滚动
        return () => clearTimeout(timer);
      }
    }
  }, [shouldScroll, api]);

  const containerStyles: React.CSSProperties = {
    width: '100%',
    height: isMobile ? 'auto' : '320px',
    overflow: 'hidden',
    padding: isMobile ? '0' : '3px',
    marginTop: isMobile ? '20px' : '10px',
    backgroundColor: colors.surface,
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadow,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: isMobile ? '18px' : '16px',
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: isMobile ? '10px' : '5px', // 进一步减少margin
    textAlign: 'center',
  };

  const listContainerStyles: React.CSSProperties = {
    height: isMobile ? 'auto' : '305px', // 进一步增加高度来补偿padding减少
    overflow: 'hidden',
    position: 'relative',
  };

  const listStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
    gap: isMobile ? '15px' : '10px',
    padding: '0',
    margin: '0',
  };

  const itemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '40px',
    backgroundColor: colors.background,
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    textDecoration: 'none',
    color: colors.text,
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    padding: '0 10px',
  };

  const handleItemClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderBlogrollItem = (item: (typeof blogroll)[0], index: number) => (
    <div
      key={index}
      style={itemStyles}
      onClick={() => handleItemClick(item.url)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.surface;
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.background;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {item.pic ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={item.pic}
            alt={item.alt}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              // 图片加载失败时显示文字
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.textContent = item.alt;
              }
            }}
          />
          <span>{item.alt}</span>
        </div>
      ) : (
        <span>{item.alt}</span>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div style={containerStyles}>
        <h3 style={titleStyles}>友站链接</h3>
        <div style={listStyles}>{blogroll.map(renderBlogrollItem)}</div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <h3 style={titleStyles}>友站链接</h3>
      <div style={listContainerStyles}>
        {shouldScroll ? (
          <animated.div
            style={{
              ...listStyles,
              transform: y.to(val => `translateY(${val}px)`),
            }}
          >
            {[...blogroll, ...blogroll].map((item, index) => renderBlogrollItem(item, index))}
          </animated.div>
        ) : (
          <div style={listStyles}>{blogroll.map(renderBlogrollItem)}</div>
        )}
      </div>
    </div>
  );
}
