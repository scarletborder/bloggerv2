import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Pagination } from 'tdesign-react';
import GetPostList from '../services/PostList';

/** 与 Blogger「设置 → 主页文章数」保持一致；服务端列表页大小以实际渲染数量为准 */
const FALLBACK_PAGE_SIZE = 7;

interface FetchedPost {
  path: string;
  title: string;
  tags: string[];
  summary: string;
  published: number;
}

function formatDate(timestamp: number, cjk: boolean): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return cjk ? `${year}年${month}月${day}日` : `${year}/${month}/${day}`;
}

function PostCards({ posts, cjk }: { posts: FetchedPost[]; cjk: boolean }) {
  return <>
    {posts.map((post, index) => <article className="native-post-card" key={`${post.path}-${index}`}>
      <a className="native-post-link" href={`/${post.path}`}><h3>{post.title}</h3></a>
      {post.tags.length > 0 && <div className="native-tags">
        {post.tags.map(tag => <a className="post-tag" href={`/search/label/${encodeURIComponent(tag)}`} key={tag}>{tag}</a>)}
      </div>}
      <p className="native-summary">{post.summary}</p>
      <div className="native-date">发布于 {formatDate(post.published, cjk)}</div>
    </article>)}
  </>;
}

/**
 * 首页文章分页：保留 Blogger 服务端渲染的第一页，翻页时改用同源 JSON Feed
 * 拉取对应页并替换列表，避免整页重载。原生 <nav> 链接保留在 DOM 中，
 * 仅在 JS 可用且存在多页时隐藏，供禁用 JS 的访客与爬虫使用。
 */
export function NativePagination() {
  const host = useRef<HTMLDivElement | null>(null);
  const list = useRef<HTMLElement | null>(null);
  const nativeNav = useRef<HTMLElement | null>(null);
  const cardsRoot = useRef<Root | null>(null);
  const requestId = useRef(0);
  const ssrItems = useRef('');
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(FALLBACK_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  // 服务端输出的日期格式（年/月/日 或 2026/01/02），翻页后保持一致的显示
  const usesCjkDate = useCallback(() => /[年月]/.test(list.current?.querySelector('.native-date')?.textContent ?? ''), []);

  // 恢复服务端渲染的第一页，避免为返回首页额外请求
  const restoreServerPage = useCallback(() => {
    const items = list.current;
    if (!items) return;
    requestId.current += 1;
    cardsRoot.current?.unmount();
    cardsRoot.current = null;
    items.innerHTML = ssrItems.current;
  }, []);

  const load = useCallback(async (page: number, size: number, updateHistory = true) => {
    const items = list.current;
    if (!items) return;
    requestId.current += 1;
    const id = requestId.current;
    setLoading(true);
    setFailed(false);
    try {
      const response = await GetPostList({ current: page, pageSize: size, startIndex: (page - 1) * size });
      // 已有更新的翻页请求（连续点击或中途返回第一页），丢弃本次响应
      if (id !== requestId.current) return;
      if (!cardsRoot.current) {
        // 首次翻页：只移除服务端渲染的节点（纯 DOM）。此后卡片由 React 管理，
        // 再手动 remove 会让 React 提交更新时 removeChild 失败。
        items.querySelectorAll('.native-post-card, .native-empty').forEach(node => node.remove());
        const container = document.createElement('div');
        container.dataset.nativeCards = '';
        items.append(container);
        cardsRoot.current = createRoot(container);
      }
      cardsRoot.current.render(<PostCards posts={response.list} cjk={usesCjkDate()} />);
      setTotal(response.total);
      setCurrent(page);
      if (updateHistory) {
        const params = new URLSearchParams(window.location.search);
        if (page > 1) params.set('start-index', String((page - 1) * size + 1));
        else params.delete('start-index');
        const search = params.toString();
        window.history.pushState(null, '', search ? `?${search}` : window.location.pathname);
      }
      items.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      if (id !== requestId.current) return;
      // 拉取失败时恢复原生导航，仍可整页跳转
      setFailed(true);
      if (nativeNav.current) nativeNav.current.style.removeProperty('display');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [usesCjkDate]);

  // 首次挂载：记录服务端结构并获取文章总数，用于计算页数
  useEffect(() => {
    const island = host.current;
    if (!island) return;
    const section = island.closest('.native-post-list');
    const items = section?.querySelector<HTMLElement>('.native-post-items') ?? null;
    const nav = section?.querySelector<HTMLElement>('nav.native-pagination') ?? null;
    list.current = items;
    nativeNav.current = nav;
    ssrItems.current = items?.innerHTML ?? '';
    const rendered = items?.querySelectorAll('.native-post-card').length ?? 0;
    const size = rendered > 0 ? rendered : FALLBACK_PAGE_SIZE;
    setPageSize(size);

    const params = new URLSearchParams(window.location.search);
    const startIndex = Number.parseInt(params.get('start-index') ?? '', 10);
    const initialPage = Number.isFinite(startIndex) && startIndex > 1
      ? Math.floor((startIndex - 1) / size) + 1
      : 1;

    // 只有一页时无需请求总数，原生导航（仅“首页”）保持可见
    if (!nav?.querySelector('a[rel="next"]')) return;
    let active = true;
    void GetPostList({ current: 1, pageSize: size, startIndex: 0 })
      .then((response) => {
        if (!active) return;
        setTotal(response.total);
        setCurrent(initialPage);
        if (initialPage > 1) void load(initialPage, size, false);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [load]);

  // 浏览器前进/后退时同步页码
  useEffect(() => {
    function sync() {
      const params = new URLSearchParams(window.location.search);
      const startIndex = Number.parseInt(params.get('start-index') ?? '', 10);
      const page = Number.isFinite(startIndex) && startIndex > 1
        ? Math.floor((startIndex - 1) / pageSize) + 1
        : 1;
      if (page === 1) restoreServerPage();
      else void load(page, pageSize, false);
      setCurrent(page);
    }
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [load, pageSize, restoreServerPage]);

  const active = total > pageSize && !failed;
  // 总数未知或只有一页时保留原生导航，避免分页组件闪烁
  useEffect(() => {
    if (nativeNav.current) nativeNav.current.style.display = active ? 'none' : '';
  }, [active]);

  return <div className="native-pagination-island" ref={host}>
    {active && <Pagination
      current={current}
      total={total}
      pageSize={pageSize}
      totalContent
      foldedMaxPageBtn={5}
      pageEllipsisMode="mid"
      onChange={(info) => {
        const page = info.current ?? 1;
        if (page === 1) {
          restoreServerPage();
          setCurrent(1);
          const params = new URLSearchParams(window.location.search);
          params.delete('start-index');
          const search = params.toString();
          window.history.pushState(null, '', search ? `?${search}` : window.location.pathname);
          return;
        }
        void load(page, pageSize);
      }}
    />}
    {loading && <p className="native-pagination-status" role="status">正在加载文章…</p>}
    {failed && <p className="native-pagination-status" role="status">文章列表加载失败，可使用上方链接翻页。</p>}
  </div>;
}
