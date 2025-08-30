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
  meta: MetaBlogger | MetaDisqus;
}

type Author = {
  name: string;

  // personal website or email
  url?: string;
  image?: string;
}

export type MetaBlogger = {
  id: string;
  replyToId: string | null;
}

export type MetaDisqus = {
}