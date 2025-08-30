// src/components/post/comments/types.ts

export interface CommentsState {
  postId: string;
  blogId: string;
  replyToId: string | null;

  // state
  loading: boolean;
  totalComments: number;

  // 新增：用于触发刷新的信号
  refreshKey: number;
}