// src/components/post/comments/types.ts

export interface CommentsState {
  postId: string;
  blogId: string;
  replyToId: string | null;

  // state
  loading: boolean;
  totalComments: number;

}