'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialQueryKeys } from '@/constants/query-keys';
import { getFilmReviews, getReview, getMyReviews, createReview, updateReview, deleteReview, likeReview, unlikeReview } from '@/lib/api/reviews';
import type { Review, CreateReviewRequest, UpdateReviewRequest } from '@cinevault/shared-types';

export function useFilmReviews(filmId: string | undefined, page?: number) {
  return useQuery({
    queryKey: socialQueryKeys.reviews.film(filmId!, page),
    queryFn: () => getFilmReviews(filmId!, page),
    enabled: !!filmId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReview(reviewId: string | undefined) {
  return useQuery({
    queryKey: socialQueryKeys.reviews.single(reviewId!),
    queryFn: () => getReview(reviewId!),
    enabled: !!reviewId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyReviews(page?: number) {
  return useQuery({
    queryKey: socialQueryKeys.reviews.mine(page),
    queryFn: () => getMyReviews(page),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReviewRequest) => createReview(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.reviews.film(data.filmId) });
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.reviews.mine() });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: UpdateReviewRequest }) => updateReview(reviewId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.reviews.single(data.id) });
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.reviews.film(data.filmId) });
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.reviews.mine() });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.reviews.mine() });
    },
  });
}

export function useLikeReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, isLiked }: { reviewId: string; isLiked: boolean }) => {
      if (isLiked) return unlikeReview(reviewId);
      return likeReview(reviewId);
    },
    onMutate: async ({ reviewId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: socialQueryKeys.reviews.single(reviewId) });
      const previous = queryClient.getQueryData(socialQueryKeys.reviews.single(reviewId));
      queryClient.setQueryData(socialQueryKeys.reviews.single(reviewId), (old: Review | undefined) => {
        if (!old) return old;
        return {
          ...old,
          isLikedByMe: !isLiked,
          likeCount: isLiked ? old.likeCount - 1 : old.likeCount + 1,
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(socialQueryKeys.reviews.single(_vars.reviewId), context.previous);
      }
    },
    onSettled: (_data, _err, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.reviews.single(reviewId) });
    },
  });
}
