import { api } from './client';
import type { ReviewComment, PaginatedResult, CreateCommentRequest, UpdateCommentRequest } from '@cinevault/shared-types';

export async function getComments(reviewId: string, page?: number): Promise<PaginatedResult<ReviewComment>> {
  const res = await api.get<{ data: PaginatedResult<ReviewComment> }>(`/comments/review/${reviewId}`, { params: { page } });
  return res.data;
}

export async function createComment(data: CreateCommentRequest): Promise<ReviewComment> {
  const res = await api.post<{ data: ReviewComment }>(`/comments`, data);
  return res.data;
}

export async function updateComment(commentId: string, data: UpdateCommentRequest): Promise<ReviewComment> {
  const res = await api.put<{ data: ReviewComment }>(`/comments/${commentId}`, data);
  return res.data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await api.delete(`/comments/${commentId}`);
}

export async function likeComment(commentId: string): Promise<{ liked: boolean; likeCount: number }> {
  const res = await api.post<{ data: { liked: boolean; likeCount: number } }>(`/comments/${commentId}/like`);
  return res.data;
}

export async function unlikeComment(commentId: string): Promise<{ liked: boolean; likeCount: number }> {
  const res = await api.delete<{ data: { liked: boolean; likeCount: number } }>(`/comments/${commentId}/like`);
  return res.data;
}
