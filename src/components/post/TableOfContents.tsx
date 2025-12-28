import React from 'react';
import { isMobile } from 'react-device-detect';

interface TocItem {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [tocItems, setTocItems] = React.useState<TocItem[]>([]);
  const [activeId, setActiveId] = React.useState<string>('');
  const [isOpen, setIsOpen] = React.useState(false);

  // PC 端固定尺寸配置
  const sidebarWidth = 280;
  const buttonWidth = 48;
  const offset = sidebarWidth - buttonWidth;

  React.useEffect(() => {
    const generateToc = () => {
      const headings = document.querySelectorAll('.blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4, .blog-content h5, .blog-content h6');
      const items: TocItem[] = [];
      headings.forEach((heading, index) => {
        const element = heading as HTMLElement;
        const level = parseInt(element.tagName.substring(1));
        const text = element.textContent || '';
        if (!element.id) element.id = `heading-${index}`;
        items.push({ id: element.id, text, level, element });
      });
      setTocItems(items);
    };
    const timer = setTimeout(generateToc, 100);
    return () => clearTimeout(timer);
  }, [content]);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = tocItems.length - 1; i >= 0; i--) {
        if (tocItems[i].element.offsetTop <= scrollPosition) {
          setActiveId(tocItems[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (tocItems.length === 0) return null;

  // --- PC 端样式 (上下结构 + 位移逻辑) ---

  const pcWrapperStyles: React.CSSProperties = {
    position: 'fixed',
    left: '24px',
    top: '20vh',
    zIndex: 1000,
    width: `${sidebarWidth}px`,
    height: '60vh',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    boxShadow: isOpen ? '0 12px 40px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.1)',
    // 核心位移动画
    transform: isOpen ? 'translateX(0)' : `translateX(-${offset}px)`,
    transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column', // 改为纵向布局，取消左右分列
  };

  // 顶部 Header 区域：包含标题和按钮
  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: `${buttonWidth}px`, // 头部高度与按钮宽度一致，保持比例
    padding: '0 0 0 16px', // 左侧给标题留 padding，右侧不需要（按钮自带）
    borderBottom: isOpen ? '1px solid var(--border-color)' : '1px solid transparent',
    flexShrink: 0, // 防止头部被压缩
    transition: 'border-bottom 0.3s ease',
  };

  // 按钮样式
  const toggleBtnStyles: React.CSSProperties = {
    width: `${buttonWidth}px`,
    height: '100%', // 占满 Header 高度
    border: 'none',
    backgroundColor: isOpen ? 'transparent' : 'var(--primary-color)',
    color: isOpen ? 'var(--text-secondary-color)' : '#fff',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  };

  // 列表滚动区域样式
  const scrollAreaStyles: React.CSSProperties = {
    flex: 1, // 占满剩余高度
    width: '100%', // 宽度占满 100%，不再受右侧挤压
    overflowY: 'auto',
    padding: '12px 0',
    scrollbarWidth: 'thin',
    // 关键：收起时隐藏列表内容，避免在右侧残留条中看到文字
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'opacity 0.2s ease, visibility 0.2s ease', // 快速隐藏
  };

  const linkStyles = (isActive: boolean, level: number): React.CSSProperties => ({
    display: 'block',
    textDecoration: 'none',
    padding: '6px 12px',
    paddingRight: '12px', // 右侧留白，不再担心被按钮遮挡
    fontSize: '18px',
    lineHeight: '1.3',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    wordBreak: 'break-word',
    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary-color)',
    backgroundColor: isActive ? 'var(--primary-color-light, rgba(0,0,0,0.05))' : 'transparent',
    borderRadius: '6px',
    marginLeft: `${(level - 1) * 12 + 12}px`, // 增加左边距适配全宽
    marginRight: '12px',
    marginBottom: '2px',
    fontWeight: isActive ? '600' : '400',
  });

  const cssInjection = `
    .toc-scroll-area::-webkit-scrollbar { width: 4px; }
    .toc-scroll-area::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
    .toc-link:hover { 
      background-color: var(--border-color); 
      color: var(--primary-color);
    }
  `;

  return (
    <>
      <style>{cssInjection}</style>

      {!isMobile ? (
        <nav style={pcWrapperStyles}>
          {/* 顶部：标题 + 按钮 */}
          <div style={headerStyles}>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: isOpen ? 0.6 : 0, // 收起时隐藏标题
              transition: 'opacity 0.3s ease',
              whiteSpace: 'nowrap',
            }}>
              目录 CONTENTS
            </div>
            <button
              style={toggleBtnStyles}
              onClick={() => setIsOpen(!isOpen)}
              title={isOpen ? '收起' : '展开目录'}
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* 底部：全宽列表内容 */}
          <div className="toc-scroll-area" style={scrollAreaStyles}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {tocItems.map(item => (
                <li key={item.id}>
                  <a
                    className="toc-link"
                    style={linkStyles(item.id === activeId, item.level)}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToHeading(item.id);
                    }}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      ) : (
        /* 移动端保持不变 */
        <nav style={{ margin: '20px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--surface-color)' }}>
          <div onClick={() => setIsOpen(!isOpen)} style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>📋 目录</span>
            <span>{isOpen ? '▲' : '▼'}</span>
          </div>
          {isOpen && (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
              {tocItems.map(item => (
                <li key={item.id} style={{ marginBottom: '8px', paddingLeft: (item.level - 1) * 10 }}>
                  <a onClick={() => scrollToHeading(item.id)} style={{ fontSize: '16px', color: 'var(--text-secondary-color)' }}>
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </nav>
      )}
    </>
  );
};

export default TableOfContents;
