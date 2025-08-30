/**
 * 通用评论Item兼容
 * - 来自google评论组件
 * - disqus接管
 */
export type CommentItem = {
  author: Author;
  content: string;

  // milliseconds 
  timeStamp: number;

  // 来源, blogger, disqus
  source: "blogger" | "disqus";
}

type Author = {
  name: string;

  // personal website or email
  url?: string;
  image?: string;
}
