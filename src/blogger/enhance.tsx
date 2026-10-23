import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import ThemeToggle from '../components/ThemeToggle';
import Slider from '../components/home/slider';
import SiteTitle from '../components/home/SiteTitle';
import Blogroll from '../components/home/Blogroll';
import TableOfContents from '../components/post/TableOfContents';
import { NativeCommentForm } from './NativeCommentForm';
import { NativePagination } from './NativePagination';
import { type ReactNode } from 'react';

export function enhanceBlogger() {
  const content = document.querySelector<HTMLElement>('.blog-content');
  for (const element of document.querySelectorAll<HTMLElement>('[data-blogger-island]')) {
    let component: ReactNode;
    switch (element.dataset.bloggerIsland) {
      case 'theme': component = <ThemeToggle />; break;
      case 'slider': component = <Slider isMobile={isMobile} />; break;
      case 'site-title':
        if (isMobile) continue;
        component = <SiteTitle />; break;
      case 'blogroll': component = <Blogroll isMobile={isMobile} />; break;
      case 'toc': component = <TableOfContents content={content?.innerHTML ?? ''} />; break;
      case 'comment-form': component = <NativeCommentForm editorUrl={element.dataset.editorUrl ?? ''} commentUrl={element.dataset.commentUrl ?? ''} />; break;
      case 'pagination': component = <NativePagination />; break;
      default: continue;
    }
    createRoot(element).render(<BrowserRouter>{component}</BrowserRouter>);
  }
  // Only enhance code blocks; Blogger retains ownership of the article DOM.
  if (content) {
    void Promise.all([
      import('../components/post/codeBlocks/prismHighlighter'),
      import('../components/post/codeBlocks/cssLoader'),
    ]).then(async ([highlighter, styles]) => {
      const theme = document.documentElement.getAttribute('theme-mode') === 'dark' ? 'dark' : 'light';
      await styles.loadThemeStyles(theme);
      await highlighter.performCompleteHighlight(content.innerHTML);
    })
      .catch(error => console.error('Code highlighting unavailable', error));
  }
}
