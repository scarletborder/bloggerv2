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

function transformComment(comments: any): CommentItem {
  return {
    author: {
      name: comments.author.name || "Anonymous",
      url: comments.author.url ?? undefined,
      image: comments.author.image ?? undefined
    },
    content: comments.content || "",
    timeStamp: Date.parse(comments.updated),
    source: "blogger",
    meta: {
      id: comments.id,
      replyToId: comments.inReplyTo,
    }
  };
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
    items: Object.values(comments).map(item => transformComment(item)),
  };
}


/**
 * 获取比指定时间戳更新的评论。
 * @param postId - 文章ID。
 * @param minTimestamp - 最小时间戳 (milliseconds)，只获取比这个时间更新的评论。
 * @returns 返回新评论数组。
 */
export async function GetNewestComments({
  postId,
  minTimestamp,
}: {
  postId: string;
  minTimestamp: number;
}): Promise<CommentItem[]> {
  const feed = new BloggerFeed(BLOG_BASE, {
    jsonp: true
  });

  // Blogger API 需要 ISO 格式的时间字符串
  const minPublishedTime = new Date(minTimestamp).toISOString();

  // 在实际应用中，您需要替换 YOUR_BLOG_ID
  // 这里的 fetch 逻辑需要您根据自己的项目进行适配
  // 以下是示例逻辑
  try {
    const entries = feed.comments.list({
      postId,
      maxResults: 500,
      publishedMin: minPublishedTime
    });
    // 将API返回的数据转换为您的 CommentItem 格式
    const newComments: CommentItem[] = Object.values(entries).map(entry => {
      return transformComment(entry);
    }).filter(c => c.timeStamp > minTimestamp); // 再次精确过滤，防止API返回等于边界值的评论

    return newComments;

  } catch (error) {
    console.error("Failed to fetch newest comments:", error);
    return [];
  }
}