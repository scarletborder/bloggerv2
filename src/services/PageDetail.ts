import { BloggerFeed } from "@deox/blogger-feed";
import type { PostItem } from "../models/PostItem";
import { BLOG_BASE } from "../constants/feedapi";
import { getPageContent } from "../actions/blogger.service";

// 文章详情页面所需的数据结构
export type PageDetail = {
  blogId: string;
  // blogger post唯一url， 可以获取Legacy Comment， 未来也会去做disqus评论的key
  pageId: string;

  title: string;
  content: string;
  published: string;
  updated?: string;
  path: string;
  url: string;
};

/**
 * 获取文章详情内容
 * @param path 文章路径
 * @returns 处理后的文章详情数据
 */
export async function getPageDetail(path: string): Promise<PageDetail> {
  const resp = await getPageContent({ path });
  const entry = resp.feed.entry[0];

  const { blogId, pageId } = getStringAfterPage(entry.id.$t, '');

  return {
    blogId,
    pageId,
    title: entry.title.$t,
    content: entry.content.$t,
    published: entry.published.toISOString(),
    updated: entry.updated.toISOString(),
    path,
    url: entry.link.find(link => link.rel === 'alternate')?.href || '',
  };
}




function getStringAfterPage(inputString: string, defaultValue: string): {
  pageId: string;
  blogId: string;
} {
  const blogIdKeyword = 'blog-';
  const pageKeyword = 'page-';

  const blogIdIndex = inputString.indexOf(blogIdKeyword);
  const pageIndex = inputString.indexOf(pageKeyword);

  let blogId = '';
  let pageId = '';

  if (blogIdIndex !== -1) {
    const blogIdStart = blogIdIndex + blogIdKeyword.length;
    const blogIdEnd = inputString.indexOf('.', blogIdStart);
    blogId = (blogIdEnd !== -1 ? inputString.substring(blogIdStart, blogIdEnd) : inputString.substring(blogIdStart)).trim();
  }

  if (pageIndex !== -1) {
    const pageStart = pageIndex + pageKeyword.length;
    const pageEnd = inputString.indexOf('.', pageStart);
    pageId = (pageEnd !== -1 ? inputString.substring(pageStart, pageEnd) : inputString.substring(pageStart)).trim();
  }

  if (blogId || pageId) {
    return { blogId, pageId: pageId };
  } else {
    return { blogId: defaultValue, pageId: defaultValue };
  }
}