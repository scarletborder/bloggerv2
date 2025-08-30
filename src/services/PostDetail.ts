import { BloggerFeed } from "@deox/blogger-feed";
import { getPostContent, type GetContentByPathParams } from "../actions/blogger.service";
import { BLOG_BASE, BLOG_URL } from "../constants/feedapi";

// 文章详情页面所需的数据结构
export type PostDetail = {
  // blogger post唯一url， 可以获取Legacy Comment， 未来也会去做disqus评论的key
  _id: string;

  title: string;
  content: string;
  published: string;
  updated?: string;
  tags: string[];
  path: string;
  url: string;
};

/**
 * 获取文章详情内容
 * @param path 文章路径
 * @returns 处理后的文章详情数据
 */
export async function getPostDetail(path: string): Promise<PostDetail> {
  const params: GetContentByPathParams = { path };

  try {
    const response = await getPostContent(params);

    // 从响应中提取所需的数据
    const entry = response.feed.entry[0];

    if (!entry) {
      throw new Error('Post not found');
    }

    // 提取标签
    const tags = entry.category?.map(cat => cat.term) || [];

    // 提取内容
    const content = entry.content.$t;

    return {
      _id: getStringAfterPost(entry.id.$t, ''),
      title: entry.title.$t,
      content,
      published: entry.published.toISOString(),
      updated: entry.updated.toISOString(),
      tags,
      path,
      url: entry.link.find(link => link.rel === 'alternate')?.href || '',
    };
  } catch (error) {
    console.error('Failed to fetch post detail:', error);
    throw new Error('Failed to load post content');
  }
}

function getStringAfterPost(inputString: string, defaultValue: string): string {
  const keyword = 'post-';
  const keywordIndex = inputString.indexOf(keyword);

  if (keywordIndex !== -1) {
    // Return the substring after the keyword
    return inputString.substring(keywordIndex + keyword.length);
  } else {
    // Return the default value if the keyword is not found
    return defaultValue;
  }
}