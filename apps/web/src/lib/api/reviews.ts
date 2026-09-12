import { api } from './client';
import type { Review, PaginatedResult, CreateReviewRequest, UpdateReviewRequest } from '@cinevault/shared-types';

export async function getFilmReviews(filmId: string, page?: number): Promise<PaginatedResult<Review>> {
  const res = await api.get<{ data: PaginatedResult<Review> }>(`/reviews/film/${filmId}`, { params: { page } });
  return res.data;
}

export async function getReview(reviewId: string): Promise<Review> {
  const res = await api.get<{ data: Review }>(`/reviews/${reviewId}`);
  return res.data;
}

export async function createReview(data: CreateReviewRequest): Promise<Review> {
  const res = await api.post<{ data: Review }>(`/reviews`, data);
  return res.data;
}

export async function updateReview(reviewId: string, data: UpdateReviewRequest): Promise<Review> {
  const res = await api.put<{ data: Review }>(`/reviews/${reviewId}`, data);
  return res.data;
}

export async function deleteReview(reviewId: string): Promise<void> {
  await api.delete(`/reviews/${reviewId}`);
}

export async function likeReview(reviewId: string): Promise<{ liked: boolean; likeCount: number }> {
  const res = await api.post<{ data: { liked: boolean; likeCount: number } }>(`/reviews/${reviewId}/like`);
  return res.data;
}

export async function unlikeReview(reviewId: string): Promise<{ liked: boolean; likeCount: number }> {
  const res = await api.delete<{ data: { liked: boolean; likeCount: number } }>(`/reviews/${reviewId}/like`);
  return res.data;
}

export async function getMyReviews(page?: number): Promise<PaginatedResult<Review>> {
  const res = await api.get<{ data: PaginatedResult<Review> }>(`/reviews/me`, { params: { page } });
  return res.data;
}
