import { BloggerFeed } from '@deox/blogger-feed';
import { keyBy, forEach } from 'lodash';
import {
  API_URL_PREFIX } from '../constants/feedapi';
import type { CommentItem } from '../models/CommentItem';

export type LegacyCommentRequest = {
  postId: string;
  startIndex?: number;
  maxResults?: number;
};

export type LegacyCommentResponse = {
  items: CommentItem[];
  total: number;
};

function transformComment(comments: any): CommentItem {
  return {
    author: {
      name: comments.author.name || 'Anonymous',
      url: comments.author.url ?? undefined,
      image: comments.author.image ?? undefined,
    },
    content: comments.content || '',
    timeStamp: Date.parse(comments.updated),
    source: 'blogger',
    meta: {
      id: comments.id,
      replyToId: comments.inReplyTo,
    },
  };
}


export async function GetPostLegacyComments(req: LegacyCommentRequest): Promise<LegacyCommentResponse> {
  const feed = new BloggerFeed(API_URL_PREFIX, {
    jsonp: true,
  });

  // 1. 获取主评论列表
  const commentsData = await feed.comments.list({
    postId: req.postId,
    startIndex: req.startIndex,
    maxResults: req.maxResults,
  });

  // ==================== 修复点 1: 正确提取 items 数组 ====================
  // 原代码使用 Object.values(commentsData) 会错误地包含 totalResults 等元数据
  // Blogger API 返回结构通常是 { items: [...], totalResults: 100, ... }
  const initialComments = commentsData.map(transformComment);
  const idToCommentItem = keyBy(initialComments, 'meta.id');

  // 3. 识别出所有在当前列表中不存在的父评论ID
  const parentCommentIdsToFetch = new Set<string>();
  forEach(initialComments, (commentItem) => {
    const replyToId = commentItem.meta?.replyToId;
    if (replyToId && !idToCommentItem[replyToId]) {
      parentCommentIdsToFetch.add(replyToId);
    }
  });

  // 4. 并行获取缺失的父评论
  if (parentCommentIdsToFetch.size > 0) {
    try {
      const parentCommentPromises = Array.from(parentCommentIdsToFetch).map(id => feed.comments.get(req.postId, id)
        .then(transformComment)
        .catch(() => null));
      const fetchedParentComments = await Promise.all(parentCommentPromises);

      forEach(fetchedParentComments, (parentComment) => {
        if (parentComment?.meta?.id) {
          idToCommentItem[parentComment.meta.id] = parentComment;
        }
      });
    } catch (e) {
      console.warn('Failed to fetch parent comments', e);
    }
  }

  // 6. 关联父子评论
  forEach(initialComments, (commentItem) => {
    const replyToId = commentItem.meta?.replyToId;
    if (replyToId) {
      const parentComment = idToCommentItem[replyToId];
      if (parentComment) {
        commentItem.inReplyTo = {
          author: {
            name: parentComment.author.name,
          },
          content: parentComment.content,
        };
      }
    }
  });

  return {
    // 从交叉类型中直接读取 totalResults
    total: commentsData.totalResults ?? 0,
    items: initialComments,
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
  const feed = new BloggerFeed(API_URL_PREFIX, {
    jsonp: true,
  });

  // Blogger API 需要 ISO 格式的时间字符串
  const minPublishedTime = new Date(minTimestamp).toISOString();

  try {
    const entries = feed.comments.list({
      postId,
      maxResults: 500,
      publishedMin: minPublishedTime,
    });
    const newComments: CommentItem[] = Object.values(entries)
      .map(entry => transformComment(entry))
      .filter(c => c.timeStamp > minTimestamp); // 再次精确过滤，防止API返回等于边界值的评论

    return newComments;
  } catch (error) {
    console.error('Failed to fetch newest comments:', error);
    return [];
  }
}
