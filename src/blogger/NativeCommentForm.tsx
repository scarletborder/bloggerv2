import { useEffect, useRef, useState } from 'react';

export function NativeCommentForm({ editorUrl, commentUrl }: { editorUrl: string; commentUrl: string }) {
  const [source, setSource] = useState('');
  const [replyId, setReplyId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'timeout'>('idle');
  const form = useRef<HTMLDivElement>(null);

  // Remove a stalled iframe; a cross-origin load event only confirms navigation.
  useEffect(() => {
    if (!source || status !== 'loading') return;
    const timer = window.setTimeout(() => {
      setSource('');
      setStatus('timeout');
    }, 12_000);
    return () => window.clearTimeout(timer);
  }, [source, status]);

  function open(parentId = '') {
    const url = new URL(editorUrl || commentUrl, window.location.href);
    if (url.protocol !== 'https:') return;
    if (parentId) url.searchParams.set('parentID', parentId);
    setReplyId(parentId);
    setSource(url.href);
    setStatus('loading');
  }

  useEffect(() => {
    function reply(event: MouseEvent) {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('[data-reply-id]') : null;
      if (!link) return;
      event.preventDefault();
      const url = new URL(editorUrl || commentUrl, window.location.href);
      if (url.protocol !== 'https:') return;
      url.searchParams.set('parentID', link.dataset.replyId ?? '');
      setReplyId(link.dataset.replyId ?? '');
      setSource(url.href);
      setStatus('loading');
      form.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    document.addEventListener('click', reply);
    return () => document.removeEventListener('click', reply);
  }, [editorUrl, commentUrl]);

  const externalUrl = new URL(editorUrl || commentUrl, window.location.href);
  if (replyId) externalUrl.searchParams.set('parentID', replyId);
  return <div className="native-comment-form" ref={form}>
    <div className="form-actions">
      <button type="button" onClick={() => open(replyId)}>{replyId ? '回复此评论' : status === 'timeout' ? '重试加载评论表单' : '发表评论'}</button>
      {source && <button type="button" onClick={() => {
        setSource(''); setStatus('idle');
      }}>关闭评论表单</button>}
      {replyId && <button type="button" onClick={() => {
        setReplyId(''); setSource(''); setStatus('idle');
      }}>取消回复</button>}
      <a href={externalUrl.href} target="_blank" rel="noopener noreferrer">在新窗口中评论</a>
    </div>
    <p role="status">{status === 'timeout' ? '评论表单连接超时，已有评论仍可正常阅读。' : source ? 'Google 评论服务在部分网络下可能无法连接，可以关闭表单或在新窗口中评论。' : '评论由 Blogger 提供，发表时需要能够连接 Google 服务。'}</p>
    {source && <iframe key={source} title="Blogger 评论表单" src={source} onLoad={() => setStatus('ready')} referrerPolicy="strict-origin-when-cross-origin" />}
  </div>;
}
