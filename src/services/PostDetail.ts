import { getPostContent, type GetContentByPathParams } from "../actions/blogger.service";

// 文章详情页面所需的数据结构
export type PostDetail = {
  blogId: string;
  // blogger post唯一url， 可以获取Legacy Comment， 未来也会去做disqus评论的key
  postId: string;

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
    const { postId, blogId } = getStringAfterPost(entry.id.$t, '');

    return {
      postId: postId,
      blogId: blogId,
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

function getStringAfterPost(inputString: string, defaultValue: string): {
  postId: string;
  blogId: string;
} {
  const blogIdKeyword = 'blog-';
  const postKeyword = 'post-';

  const blogIdIndex = inputString.indexOf(blogIdKeyword);
  const postIndex = inputString.indexOf(postKeyword);

  let blogId = '';
  let postId = '';

  if (blogIdIndex !== -1) {
    const blogIdStart = blogIdIndex + blogIdKeyword.length;
    const blogIdEnd = inputString.indexOf('.', blogIdStart);
    blogId = (blogIdEnd !== -1 ? inputString.substring(blogIdStart, blogIdEnd) : inputString.substring(blogIdStart)).trim();
  }

  if (postIndex !== -1) {
    const postStart = postIndex + postKeyword.length;
    const postEnd = inputString.indexOf('.', postStart);
    postId = (postEnd !== -1 ? inputString.substring(postStart, postEnd) : inputString.substring(postStart)).trim();
  }

  if (blogId || postId) {
    return { blogId, postId };
  } else {
    return { blogId: defaultValue, postId: defaultValue };
  }
}