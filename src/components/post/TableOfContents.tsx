import React, { useState, useEffect } from 'react';
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
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(!isMobile); // 桌面端默认展开，移动端默认收起

  useEffect(() => {
    // 从内容中提取标题元素生成目录
    const generateToc = () => {
      const headings = document.querySelectorAll('.blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4, .blog-content h5, .blog-content h6');
      const items: TocItem[] = [];

      headings.forEach((heading, index) => {
        const element = heading as HTMLElement;
        const level = parseInt(element.tagName.substring(1)); // H1 -> 1, H2 -> 2, etc.
        const text = element.textContent || '';

        // 为标题添加 ID（如果没有的话）
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

    // 延迟执行，确保内容已经渲染
    const timer = setTimeout(generateToc, 100);
    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    // 监听滚动，高亮当前章节
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // 添加偏移量

      for (let i = tocItems.length - 1; i >= 0; i--) {
        const item = tocItems[i];
        if (item.element.offsetTop <= scrollPosition) {
          setActiveId(item.id);
          break;
        }
      }
    };

    if (tocItems.length > 0) {
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // 初始化
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
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

  const containerStyles: React.CSSProperties = {
    position: isMobile ? 'relative' : 'fixed',
    left: isMobile ? 'auto' : '20px',
    top: isMobile ? 'auto' : '50%',
    transform: isMobile ? 'none' : 'translateY(-50%)',
    width: isMobile ? '100%' : '250px',
    maxHeight: isMobile ? 'auto' : '60vh',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: isMobile ? '12px' : '16px',
    fontSize: isMobile ? '13px' : '14px',
    zIndex: 100,
    boxShadow: 'var(--shadow-color) 0px 4px 12px',
    marginBottom: isMobile ? '20px' : '0',
    overflow: isMobile ? 'visible' : 'auto',
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
    display: isOpen ? 'block' : 'none',
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

  const hoverStyles = `
    .toc-link:hover {
      background-color: var(--primary-color) !important;
      color: var(--surface-color) !important;
    }
  `;

  return (
    <>
      <style>{hoverStyles}</style>
      <nav style={containerStyles}>
        <div style={headerStyles} onClick={() => isMobile && setIsOpen(!isOpen)}>
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
    </>
  );
};

export default TableOfContents;
