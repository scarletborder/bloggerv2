import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { getPostDetail, type PostDetail } from '../services/PostDetail';
import HeaderView from '../components/post/HeaderView';
import ContentView from '../components/post/ContentView';
import TableOfContents from '../components/post/TableOfContents';
import { Seperator } from '../components/post/common';
import CommentArea from '../components/post/comments';
import { useTitle } from 'ahooks';

/**
 * 文章详情页面
 */
const PostPage: React.FC = () => {
  const { '*': pathParam } = useParams(); // 获取路径参数
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useTitle(`${post?.title ?? 'Loading'} - 绯境之外`);

  useEffect(() => {
    const loadPost = async () => {
      if (!pathParam) {
        setError('文章路径不存在');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // TODO: 处理path参数，将路径转换为API所需的格式
        // 这里先使用原始路径，稍后您可以根据需要进行处理
        const processedPath = pathParam.startsWith('/')
          ? pathParam
          : `/${pathParam}`;

        const postDetail = await getPostDetail(processedPath);
        setPost(postDetail);
      } catch (err) {
        console.error('Failed to load post:', err);
        setError(err instanceof Error ? err.message : '加载文章失败');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [pathParam]);

  // 监听滚动，显示/隐藏回到顶部按钮（仅移动端）
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const scrollTop =        window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300); // 滚动超过300px时显示按钮
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 回到顶部功能
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // 页面容器样式
  const pageStyles: React.CSSProperties = {
    backgroundColor: 'var(--background-color)',
    minHeight: '100vh',
    color: 'var(--text-color)',
  };

  // 主内容区域样式
  const mainStyles: React.CSSProperties = {
    width: isMobile ? '100%' : '80%',
    maxWidth: isMobile ? '100%' : '1650px',
    minWidth: isMobile ? '100%' : '1080px',
    margin: '0 auto',
    paddingTop: isMobile ? '16px' : '32px',
    // 桌面端为常驻目录预留空间（窄视口下目录会隐藏，变量自动归零）
    paddingLeft: isMobile
      ? '4px'
      : 'calc(var(--toc-panel-left, 24px) + var(--toc-panel-width, 248px) + 32px)',
    paddingRight: isMobile ? '4px' : '32px',
    position: 'relative',
  };

  // 加载状态样式
  const loadingStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    fontSize: isMobile ? '16px' : '18px',
    color: 'var(--text-secondary-color)',
  };

  // 错误状态样式
  const errorStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    textAlign: 'center',
    color: 'var(--text-color)',
  };

  const errorTitleStyles: React.CSSProperties = {
    fontSize: isMobile ? '1.5rem' : '2rem',
    marginBottom: '16px',
    color: 'var(--primary-color)',
  };

  const errorMessageStyles: React.CSSProperties = {
    fontSize: isMobile ? '14px' : '16px',
    color: 'var(--text-secondary-color)',
    marginBottom: '24px',
  };

  const backButtonStyles: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: 'var(--primary-color)',
    color: 'var(--surface-color)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.2s ease',
  };

  // 悬浮的回到顶部按钮样式（仅移动端）
  const scrollTopButtonStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color)',
    color: 'var(--surface-color)',
    border: 'none',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: showScrollTop && isMobile ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
    zIndex: 1000,
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div style={pageStyles}>
        <div style={loadingStyles}>
          <div>正在加载文章...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={pageStyles}>
        <div style={errorStyles}>
          <h1 style={errorTitleStyles}>😔 页面加载失败</h1>
          <p style={errorMessageStyles}>{error || '找不到指定的文章'}</p>
          <a
            href="/"
            style={backButtonStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =                'var(--primary-hover-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-color)';
            }}
          >
            返回首页
          </a>
        </div>
      </div>
    );
  }

  // 渲染文章内容
  return (
    <div style={pageStyles}>
      {/* 目录组件 - 桌面端固定在左侧，移动端显示在内容顶部 */}
      {!isMobile && <TableOfContents content={post.content} />}

      <main style={mainStyles}>
        {/* 移动端目录 */}
        {isMobile && <TableOfContents content={post.content} />}

        {/* 文章头部 */}
        <HeaderView
          title={post.title}
          published={post.published}
          updated={post.updated}
          tags={post.tags}
        />

        {/* 文章内容 */}
        <ContentView content={post.content} />

        {isMobile && <Seperator />}

        {/* 评论区 */}
        <CommentArea postId={post.postId} blogId={post.blogId} />
      </main>

      {/* 悬浮的回到顶部按钮（仅移动端） */}
      <button
        style={scrollTopButtonStyles}
        onClick={scrollToTop}
        onMouseEnter={(e) => {
          if (isMobile) return;
          e.currentTarget.style.backgroundColor = 'var(--primary-hover-color)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          if (isMobile) return;
          e.currentTarget.style.backgroundColor = 'var(--primary-color)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary-hover-color)';
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary-color)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="回到顶部"
      >
        ↑
      </button>
    </div>
  );
};

export default PostPage;
