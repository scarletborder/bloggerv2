import React from 'react';
import { isMobile } from 'react-device-detect';
import './toc.css';

/** 锚点滚动时距离视口顶部保留的高度（顶部导航 60px + 呼吸留白） */
const SCROLL_OFFSET_DESKTOP = 84;
const SCROLL_OFFSET_MOBILE = 68;
/** 桌面端目录折叠状态的持久化 key */
const COLLAPSE_STORAGE_KEY = 'blog.toc.collapsed';

interface TocItem {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

/**
 * 由标题文本生成稳定、可分享的锚点 id，并去重
 */
const createSlug = (raw: string, used: Set<string>): string => {
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, '-')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = normalized || 'section';
  if (used.has(slug)) {
    let suffix = 2;
    while (used.has(`${slug}-${suffix}`)) suffix += 1;
    slug = `${slug}-${suffix}`;
  }
  used.add(slug);
  return slug;
};

const readCollapsed = (): boolean => {
  try {
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M2 3.5h1.6M2 8h1.6M2 12.5h1.6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M6.6 3.5H14M6.6 8H14M6.6 12.5H14"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M6 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TableOfContents: React.FC<{ content: string }> = ({ content }) => {
  const [tocItems, setTocItems] = React.useState<TocItem[]>([]);
  const [activeId, setActiveId] = React.useState('');
  const [progress, setProgress] = React.useState(0);
  const [collapsed, setCollapsed] = React.useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [indicator, setIndicator] = React.useState({ top: 0, height: 0, visible: false });

  const bodyRef = React.useRef<HTMLDivElement | null>(null);
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const linkRefs = React.useRef(new Map<string, HTMLAnchorElement>());
  const linkedHashRef = React.useRef<string | null>(null);

  /* ---------- 1. 提取正文标题并回填锚点 id ---------- */
  React.useEffect(() => {
    setTocItems([]);
    setActiveId('');

    const collect = (): boolean => {
      const root = document.querySelector('.blog-content');
      if (!root) return false;

      const headings = Array.from(root.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6'));
      if (headings.length === 0) return false;

      const used = new Set<string>();
      const items: TocItem[] = [];
      headings.forEach((heading) => {
        const text = (heading.textContent || '').trim();
        if (!text) return;
        if (!heading.id || heading.dataset.tocGenerated === '1') {
          heading.id = createSlug(text, used);
          heading.dataset.tocGenerated = '1';
        } else {
          used.add(heading.id);
        }
        items.push({ id: heading.id, text, level: Number(heading.tagName.slice(1)), element: heading });
      });

      if (items.length === 0) return false;
      setTocItems(items);
      return true;
    };

    // 正文由 ContentView 同步渲染，effect 在 DOM 提交后执行，通常首次即可收集到
    if (collect()) return;

    // 兜底：用 MutationObserver 监听正文出现，替代定时轮询
    let observer: MutationObserver | null = null;
    const watchTarget = document.querySelector('main') || document.body;
    observer = new MutationObserver(() => {
      if (collect()) observer?.disconnect();
    });
    observer.observe(watchTarget, { childList: true, subtree: true });

    return () => observer?.disconnect();
  }, [content]);

  /* ---------- 2. 滚动监听：高亮当前章节 + 阅读进度 ---------- */
  React.useEffect(() => {
    if (tocItems.length === 0) return;

    const offset = isMobile ? SCROLL_OFFSET_MOBILE : SCROLL_OFFSET_DESKTOP;
    let frame = 0;

    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0;
      const percent = Math.round(ratio * 100);
      setProgress(prev => (prev === percent ? prev : percent));

      // 触底时直接高亮最后一节，避免短小节永远无法激活
      if (scrollable > 0 && scrollTop >= scrollable - 2) {
        const lastId = tocItems[tocItems.length - 1].id;
        setActiveId(prev => (prev === lastId ? prev : lastId));
        return;
      }

      let current = '';
      for (let i = 0; i < tocItems.length; i += 1) {
        const { id, element } = tocItems[i];
        // 正文可能被代码高亮等副作用重排，这里按 id 回源一次真实节点
        const live = element.isConnected ? element : document.getElementById(id);
        if (!live) continue;
        if (live.getBoundingClientRect().top - offset <= 1) current = id;
        else break;
      }
      setActiveId(prev => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // 图片 / 代码块异步撑开高度时同步修正
    const resizeObserver =      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onScroll) : null;
    resizeObserver?.observe(document.body);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      resizeObserver?.disconnect();
    };
  }, [tocItems]);

  /* ---------- 3. 指示条位置测量 ---------- */
  const measureIndicator = React.useCallback(() => {
    if (!activeId) {
      setIndicator(prev => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }
    const link = linkRefs.current.get(activeId);
    // offsetParent 为空说明列表处于折叠 / 隐藏状态
    if (!link?.offsetParent) {
      setIndicator(prev => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }
    const top = link.offsetTop;
    const height = link.offsetHeight;
    setIndicator(prev => (prev.visible && prev.top === top && prev.height === height
      ? prev
      : { top, height, visible: true }));
  }, [activeId]);

  React.useEffect(() => {
    measureIndicator();
  }, [measureIndicator, tocItems, collapsed, mobileOpen]);

  React.useEffect(() => {
    const inner = innerRef.current;
    if (!inner || typeof ResizeObserver === 'undefined') return;
    const resizeObserver = new ResizeObserver(() => measureIndicator());
    resizeObserver.observe(inner);
    return () => resizeObserver.disconnect();
  }, [measureIndicator]);

  /* ---------- 4. 让当前章节始终留在目录可视区内 ---------- */
  React.useEffect(() => {
    if (!activeId) return;
    const body = bodyRef.current;
    const link = linkRefs.current.get(activeId);
    if (!body || !link?.offsetParent) return;

    const top = link.offsetTop;
    const bottom = top + link.offsetHeight;
    const viewTop = body.scrollTop;
    const viewBottom = viewTop + body.clientHeight;
    if (top >= viewTop + 4 && bottom <= viewBottom - 4) return;

    body.scrollTo({
      top: Math.max(0, top - body.clientHeight / 3),
      behavior: 'smooth',
    });
  }, [activeId, tocItems, mobileOpen, collapsed]);

  /* ---------- 5. 支持带 hash 进入文章时直达对应章节 ---------- */
  React.useEffect(() => {
    if (tocItems.length === 0) return;
    const hash = decodeURIComponent(window.location.hash.replace('#', ''));
    if (!hash || linkedHashRef.current === hash) return;

    const target = tocItems.find(item => item.id === hash);
    if (!target) return;
    linkedHashRef.current = hash;

    const offset = isMobile ? SCROLL_OFFSET_MOBILE : SCROLL_OFFSET_DESKTOP;
    const top = target.element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, [tocItems]);

  /* ---------- 交互 ---------- */
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const offset = isMobile ? SCROLL_OFFSET_MOBILE : SCROLL_OFFSET_DESKTOP;
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    try {
      window.history.replaceState(null, '', `#${encodeURIComponent(id)}`);
    } catch {
      /* 忽略不支持 history API 的环境 */
    }
    setActiveId(id);
  };

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // 保留新标签页打开等浏览器原生行为
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    scrollToHeading(id);
    if (isMobile) setMobileOpen(false);
  };

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? '1' : '0');
    } catch {
      /* 忽略隐私模式下的写入失败 */
    }
  };

  if (tocItems.length === 0) return null;

  const list = (
    <div className="toc-body" ref={bodyRef}>
      <div className="toc-inner" ref={innerRef}>
        <span className="toc-rail" aria-hidden="true" />
        <span
          className={`toc-indicator${indicator.visible ? ' is-visible' : ''}`}
          style={{
            transform: `translateY(${indicator.top}px)`,
            height: `${indicator.height}px`,
          }}
          aria-hidden="true"
        />
        <ul className="toc-list">
          {tocItems.map(item => (
            <li key={item.id} className="toc-item" data-level={item.level}>
              <a
                className={`toc-link${item.id === activeId ? ' is-active' : ''}`}
                href={`#${encodeURIComponent(item.id)}`}
                title={item.text}
                aria-current={item.id === activeId ? 'true' : undefined}
                ref={(node) => {
                  if (node) linkRefs.current.set(item.id, node);
                  else linkRefs.current.delete(item.id);
                }}
                onClick={event => handleLinkClick(event, item.id)}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const progressBar = (
    <div className="toc-progress" role="presentation">
      <i style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  );

  /* ---------- 移动端：文章顶部的折叠卡片 ---------- */
  if (isMobile) {
    return (
      <nav className={`toc-mobile${mobileOpen ? ' is-open' : ''}`} aria-label="文章目录">
        <button
          type="button"
          className="toc-mobile-head"
          onClick={() => setMobileOpen(open => !open)}
          aria-expanded={mobileOpen}
        >
          <ListIcon />
          <span className="toc-title">目录</span>
          <span className="toc-count">{tocItems.length}</span>
          <span className="toc-percent">{progress}%</span>
          <ChevronIcon className="toc-chevron" />
        </button>
        {progressBar}
        {list}
      </nav>
    );
  }

  /* ---------- 桌面端：左侧常驻面板 ---------- */
  return (
    <>
      <nav
        className={`toc-panel${collapsed ? ' is-collapsed' : ''}`}
        aria-label="文章目录"
        aria-hidden={collapsed}
      >
        <div className="toc-head">
          <span className="toc-title">
            <ListIcon />
            目录
          </span>
          <span className="toc-count">{tocItems.length}</span>
          <span className="toc-percent">{progress}%</span>
          <button
            type="button"
            className="toc-icon-btn"
            onClick={toggleCollapsed}
            aria-label={collapsed ? '展开目录' : '收起目录'}
            aria-expanded={!collapsed}
          >
            <ChevronIcon />
          </button>
        </div>
        {progressBar}
        {list}
      </nav>

      {collapsed && (
        <button type="button" className="toc-fab" onClick={toggleCollapsed} aria-label="展开目录">
          <ListIcon />
          目录
        </button>
      )}
    </>
  );
};

export default TableOfContents;
