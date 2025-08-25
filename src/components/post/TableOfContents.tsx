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

/**
 * 文章目录组件 - 自动生成并显示文章目录
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [tocItems, setTocItems] = React.useState<TocItem[]>([]);
  const [activeId, setActiveId] = React.useState<string>('');
  const [isOpen, setIsOpen] = React.useState(() => {
    if (isMobile) return false;
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1200;
    }
    return true;
  });

  const tocWidth = 250;

  React.useEffect(() => {
    const generateToc = () => {
      const headings = document.querySelectorAll('.blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4, .blog-content h5, .blog-content h6');
      const items: TocItem[] = [];

      headings.forEach((heading, index) => {
        const element = heading as HTMLElement;
        const level = parseInt(element.tagName.substring(1));
        const text = element.textContent || '';

        if (!element.id) {
          element.id = `heading-${index}`;
        }

        items.push({
          id: element.id,
          text,
          level,
          element,
        });
      });

      setTocItems(items);
    };

    const timer = setTimeout(generateToc, 100);
    return () => clearTimeout(timer);
  }, [content]);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (let i = tocItems.length - 1; i >= 0; i--) {
        const item = tocItems[i];
        if (item.element.offsetTop <= scrollPosition) {
          setActiveId(item.id);
          break;
        }
      }
    };

    const handleResize = () => {
      if (!isMobile) {
        const shouldOpen = window.innerWidth >= 1200;
        setIsOpen(shouldOpen);
      }
    };

    if (tocItems.length > 0) {
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    if (!isMobile) {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (!isMobile) {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  // PC端容器样式
  const pcContainerStyles: React.CSSProperties = {
    position: 'fixed',
    left: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    width: `${tocWidth}px`,
    maxHeight: '80vh',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '14px',
    zIndex: 100,
    boxShadow: 'var(--shadow-color) 0px 4px 12px',
    overflow: 'auto',
    transition: 'opacity 0.3s ease, visibility 0.3s ease',
    visibility: isOpen ? 'visible' : 'hidden',
    opacity: isOpen ? 1 : 0,
  };

  // 移动端容器样式
  const mobileContainerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '13px',
    zIndex: 100,
    boxShadow: 'var(--shadow-color) 0px 4px 12px',
    marginBottom: '20px',
    overflow: 'auto',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isOpen ? '12px' : '0',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: 'bold',
    color: 'var(--text-color)',
    cursor: isMobile ? 'pointer' : 'default',
  };

  const listStyles: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const itemStyles = (level: number): React.CSSProperties => ({
    paddingLeft: `${(level - 1) * 12}px`,
    marginBottom: '6px',
  });

  const linkStyles = (isActive: boolean): React.CSSProperties => ({
    display: 'block',
    textDecoration: 'none',
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
    color: isActive ? 'var(--surface-color)' : 'var(--text-secondary-color)',
    fontSize: 'inherit',
    lineHeight: 1.4,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    wordBreak: 'break-word',
  });

  const toggleButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary-color)',
    cursor: 'pointer',
    fontSize: '16px',
    padding: 0,
    display: isMobile ? 'block' : 'none',
  };

  // --- 变更点: 调整梯形书签的宽高和形状 ---
  const floatingToggleStyles: React.CSSProperties = {
    position: 'fixed',
    left: isOpen ? `${tocWidth}px` : '0px',
    top: '50%',
    transform: isOpen ? 'translateY(-50%) translateX(-100%)' : 'translateY(-50%)',
    width: '1%',  // 变更: 宽度变窄
    height: '100px', // 变更: 高度变高
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderLeft: isOpen ? 'none' : '1px solid var(--border-color)',
    borderRight: isOpen ? '1px solid var(--border-color)' : 'none',
    boxShadow: 'var(--shadow-color) 0px 4px 12px',
    cursor: 'pointer',
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: 'var(--primary-color)',
    zIndex: 101,
    transition: 'all 0.3s ease-in-out',
    // 变更: 调整 clip-path 使斜边更陡峭
    clipPath: isOpen 
      ? 'polygon(100% 0, 0 10%, 0 90%, 100% 100%)' 
      : 'polygon(0 0, 100% 10%, 100% 90%, 0 100%)',
  };

  const hoverStyles = `
    .toc-link:hover {
      background-color: var(--primary-color) !important;
      color: var(--surface-color) !important;
    }
    .floating-toggle:hover {
      background-color: var(--primary-color) !important;
      color: var(--surface-color) !important;
    }
  `;
  
  return (
    <>
      <style>{hoverStyles}</style>
      
      {!isMobile && (
        <>
          <nav style={pcContainerStyles}>
            <div style={headerStyles}>
              <span>📋 目录</span>
            </div>
            <ul style={listStyles}>
              {tocItems.map((item) => (
                <li key={item.id} style={itemStyles(item.level)}>
                  <a
                    className="toc-link"
                    style={linkStyles(item.id === activeId)}
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
          </nav>
          
          <button
            className="floating-toggle"
            style={floatingToggleStyles}
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? '收起目录' : '展开目录'}
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </>
      )}

      {isMobile && (
        <nav style={mobileContainerStyles}>
          <div style={headerStyles} onClick={() => setIsOpen(!isOpen)}>
            <span>📋 目录</span>
            <button
              style={toggleButtonStyles}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              {isOpen ? '▲' : '▼'}
            </button>
          </div>

          {isOpen && (
            <ul style={listStyles}>
              {tocItems.map((item) => (
                <li key={item.id} style={itemStyles(item.level)}>
                  <a
                    className="toc-link"
                    style={linkStyles(item.id === activeId)}
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
          )}
        </nav>
      )}
    </>
  );
};

export default TableOfContents;