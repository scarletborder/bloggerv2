import { BloggerFeed } from "@deox/blogger-feed";
import { BLOG_BASE } from "../constants/feedapi";
import type { CommentItem } from "../models/CommentItem";

export type LegacyCommentRequest = {
  postId: string;
  pageSize: number;
  startIndex?: number; // 已显示的文章数量，用于计算正确的 start-index
}

export type LegacyCommentResponse = {
  items: CommentItem[];
  total: number;
}


export async function GetPostLegacyComments(req: LegacyCommentRequest): Promise<LegacyCommentResponse> {
  const feed = new BloggerFeed(BLOG_BASE, {
    jsonp: true
  });


  const comments = await feed.comments.list({
    postId: req.postId,
    maxResults: 500,
  });

  return {
    total: comments.totalResults ?? 0,
    items: Object.values(comments).map(item => {
      return {
        author: {
          name: item.author.name || "Anonymous",
          url: item.author.url ?? undefined,
          image: item.author.image ?? undefined
        },
        content: item.content || "",
        timeStamp: Date.parse(item.updated),
        source: "blogger"
      };
    })
  };
} 