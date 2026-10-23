import { createBloggerRenderer } from './markup';
import { generateContentStyles } from '../components/post/contentStyles';

export function renderBloggerBody() {
  const { Blogger: B, render } = createBloggerRenderer();
  const value = (name: string) => <B xml={`<data:${name}/>`} />;
  function Labels() {
    return <div className="native-tags"><B xml="<b:loop values='data:post.labels' var='label'><!-- children --></b:loop>">
      <a className="post-tag" {...{ 'expr:href': 'data:label.url' }}>{value('label.name')}</a>
    </B></div>;
  }
  function Pagination() {
    return <nav className="native-pagination" aria-label="文章分页">
      <B xml="<b:if cond='data:newerPageUrl'><!-- children --></b:if>"><a {...{ 'expr:href': 'data:newerPageUrl' }} rel="prev">较新的文章</a></B>
      <a href="/">首页</a>
      <B xml="<b:if cond='data:olderPageUrl'><!-- children --></b:if>"><a {...{ 'expr:href': 'data:olderPageUrl' }} rel="next">更早的文章</a></B>
    </nav>;
  }
  function PostList() {
    return <section className="native-post-list"><h2>最新文章</h2>
      <B xml="<b:loop values='data:posts' var='post'><!-- children --></b:loop>">
        <article className="native-post-card">
          <a className="native-post-link" {...{ 'expr:href': 'data:post.url' }}><h3>{value('post.title')}</h3></a>
          <Labels />
          <p className="native-summary"><B xml="<b:eval expr='snippet(data:post.body, {length: 240, links: false, linebreaks: false})'/>" /></p>
          <div className="native-date">发布于 {value('post.timestamp')}</div>
        </article>
      </B>
      <B xml="<b:if cond='data:posts.empty'><!-- children --></b:if>"><p>暂无文章</p></B>
      <Pagination />
    </section>;
  }
  function CommentPaging() {
    return <B xml="<b:if cond='data:post.commentPagingRequired'><!-- children --></b:if>">
      <nav className="native-pagination" aria-label="评论分页">
        <B xml="<b:if cond='data:post.hasOlderLinks'><!-- children --></b:if>"><a {...{ 'expr:href': 'data:post.oldestLinkUrl' }}>最早</a><a {...{ 'expr:href': 'data:post.olderLinkUrl' }}>较早</a></B>
        <span>{value('post.commentRangeText')}</span>
        <B xml="<b:if cond='data:post.hasNewerLinks'><!-- children --></b:if>"><a {...{ 'expr:href': 'data:post.newerLinkUrl' }}>较新</a><a {...{ 'expr:href': 'data:post.newestLinkUrl' }}>最新</a></B>
      </nav>
    </B>;
  }
  function Comments() {
    return <section id="comments" className="native-comments">
      <h3>评论区 <span>({value('post.numberOfComments')})</span></h3>
      <B xml="<b:loop values='data:post.comments' var='comment'><!-- children --></b:loop>">
        <article className="native-comment" {...{ 'expr:id': '"c" + data:comment.id' }}>
          <header><B xml="<b:if cond='data:comment.authorUrl'><!-- children --><b:else/><data:comment.author/></b:if>">
            <a {...{ 'expr:href': 'data:comment.authorUrl' }} rel="nofollow noopener" target="_blank">{value('comment.author')}</a>
          </B><a className="native-date" {...{ 'expr:href': 'data:comment.url' }}>{value('comment.timestamp')}</a></header>
          <div className="native-comment-body">{value('comment.body')}</div>
          <B xml="<b:if cond='data:post.allowNewComments'><!-- children --></b:if>">
            <a className="native-reply" {...{ 'expr:data-reply-id': 'data:comment.id', 'expr:href': 'data:post.addCommentUrl' }}>回复</a>
          </B>
        </article>
      </B>
      <CommentPaging />
      <B xml="<b:if cond='data:post.allowNewComments'><!-- children --><b:else/><p><data:post.noNewCommentsText/></p></b:if>">
        <div data-blogger-island="comment-form" {...{ 'expr:data-editor-url': 'data:post.commentFormIframeSrc', 'expr:data-comment-url': 'data:post.addCommentUrl' }} />
        <noscript><a {...{ 'expr:href': 'data:post.addCommentUrl' }}>发表评论</a></noscript>
      </B>
    </section>;
  }
  function Post() {
    return <div className="native-post-layout">
      <div data-blogger-island="toc" />
      <article className="native-post" itemScope itemType="https://schema.org/BlogPosting">
        <header className="native-post-header">
          <h1 itemProp="headline">{value('post.title')}</h1>
          <div className="native-date">发布于 <time itemProp="datePublished" {...{ 'expr:datetime': 'data:post.timestampISO8601' }}>{value('post.timestamp')}</time></div>
          <Labels />
        </header>
        <div className="post-body entry-content blog-content" itemProp="articleBody" {...{ 'expr:id': '"post-body-" + data:post.id' }}>{value('post.body')}</div>
        <B xml="<b:if cond='data:post.allowComments or data:post.numberOfComments &gt; 0'><!-- children --></b:if>"><Comments /></B>
      </article>
    </div>;
  }
  function Home() {
    return <div className="native-home">
      <div className="native-home-main"><div data-blogger-island="site-title"><h1>{value('blog.title')}</h1><p>Outside of Scarlet</p></div><PostList /></div>
      <aside className="native-home-sidebar">
        <div data-blogger-island="slider" />
        <section className="native-welcome"><h2>{value('blog.title')}</h2><p>{value('blog.description')}</p></section>
        <img className="native-banner" src="https://s2.loli.net/2025/05/16/ke3yL5RDTOsU4vg.png" alt="绯境之外" />
        <div data-blogger-island="blogroll" />
      </aside>
    </div>;
  }
  return render(<>
    <nav className="native-nav" aria-label="主导航">
      <div><a href="/">HOME</a><a href="/archives">ARCHIVES</a><a href="/pages">PAGES</a></div>
      <div><form action="/search" method="get"><input name="q" aria-label="搜索文章" placeholder="搜索文章" /></form><div data-blogger-island="theme" /></div>
    </nav>
    <main id="blogger-native">
      <B xml="<b:section id='main' showaddelement='no' maxwidgets='1'><b:widget id='Blog1' type='Blog' locked='true' version='2' title='Blog Posts'><b:includable id='main' var='top'><!-- children --></b:includable></b:widget></b:section>">
        <B xml="<b:if cond='data:view.isSingleItem'><!-- children --><b:else/>BLOGGER_HOME</b:if>">
          <B xml="<b:loop values='data:posts' var='post'><!-- children --></b:loop>"><Post /></B>
        </B>
      </B>
    </main>
    <footer className="native-footer"><div><strong>{value('blog.title')}</strong><div>© 2022 - {new Date().getFullYear()} Copyright 绯境之外</div><div>Theme by scarletborder</div><div>Powered by Blogger and React</div></div><div><strong>联系方式</strong><div>邮箱: baishuibeef@gmail.com</div><div>scarletborder / 黯界绯</div></div></footer>
  </>).replace('BLOGGER_HOME', render(<Home />));
}

export const contentStyles = generateContentStyles('light');
