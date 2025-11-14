import { BloggerFeed } from '@deox/blogger-feed';
import { keyBy, forEach } from 'lodash';
import { BLOG_BASE } from '../constants/feedapi';
import type { CommentItem } from '../models/CommentItem';

export type LegacyCommentRequest = {
  postId: string;
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

export async function GetPostLegacyComments(
  req: LegacyCommentRequest,
): Promise<LegacyCommentResponse> {
  const feed = new BloggerFeed(BLOG_BASE, {
    jsonp: true,
  });

  // 1. 获取主评论列表
  const commentsData = await feed.comments.list({
    postId: req.postId,
  });

  // 2. 转换评论数据结构，并使用 lodash.keyBy 创建一个以评论ID为键的高效查找映射
  const initialComments = Object.values(commentsData).map(transformComment);
  const idToCommentItem = keyBy(initialComments, 'meta.id');

  // 3. 识别出所有在当前列表中不存在的父评论ID
  const parentCommentIdsToFetch = new Set<string>();
  forEach(initialComments, (commentItem) => {
    const replyToId = commentItem.meta?.replyToId;
    // 如果一个评论是回复，并且它的父评论不在当前列表中，则记录其ID以便后续获取
    if (replyToId && !idToCommentItem[replyToId]) {
      parentCommentIdsToFetch.add(replyToId);
    }
  });

  // 4. 使用 Promise.all 并行获取所有缺失的父评论，以提高效率
  if (parentCommentIdsToFetch.size > 0) {
    const parentCommentPromises = Array.from(parentCommentIdsToFetch).map(
      (id) => feed.comments.get(req.postId, id).then(transformComment),
    );
    const fetchedParentComments = await Promise.all(parentCommentPromises);

    // 5. 将新获取的父评论也加入到查找映射中，以便后续引用
    forEach(fetchedParentComments, (parentComment) => {
      if (parentComment.meta?.id) {
        idToCommentItem[parentComment.meta.id] = parentComment;
      }
    });
  }

  // 6. 最后一次遍历，为每个子评论添加对父评论的引用
  // 此时 idToCommentItem 包含了所有需要的评论（无论是初始加载的还是补充获取的）
  forEach(initialComments, (commentItem) => {
    const replyToId = commentItem.meta?.replyToId;
    if (replyToId) {
      const parentComment = idToCommentItem[replyToId];
      if (parentComment) {
        // 在子评论 (commentItem) 上添加 inReplyTo 字段，引用父评论的信息
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
    total: commentsData.totalResults ?? 0,
    // 返回最初获取和转换后的评论列表，现在它们已经包含了正确的 inReplyTo 信息
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
  const feed = new BloggerFeed(BLOG_BASE, {
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
      .map((entry) => {
        return transformComment(entry);
      })
      .filter((c) => c.timeStamp > minTimestamp); // 再次精确过滤，防止API返回等于边界值的评论

    return newComments;
  } catch (error) {
    console.error('Failed to fetch newest comments:', error);
    return [];
  }
}
