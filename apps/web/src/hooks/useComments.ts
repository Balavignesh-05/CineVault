'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialQueryKeys } from '@/constants/query-keys';
import { getComments, createComment, updateComment, deleteComment, likeComment, unlikeComment } from '@/lib/api/comments';
import type { ReviewComment, CreateCommentRequest, UpdateCommentRequest } from '@cinevault/shared-types';

export function useComments(reviewId: string | undefined, page?: number) {
  return useQuery({
    queryKey: socialQueryKeys.comments.review(reviewId!, page),
    queryFn: () => getComments(reviewId!, page),
    enabled: !!reviewId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentRequest) => createComment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.comments.review(data.reviewId) });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentRequest }) => updateComment(commentId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.comments.review(data.reviewId) });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, reviewId }: { commentId: string; reviewId: string }) => deleteComment(commentId),
    onSuccess: (_, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.comments.review(reviewId) });
    },
  });
}

export function useLikeComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, isLiked, reviewId }: { commentId: string; isLiked: boolean; reviewId: string }) => {
      if (isLiked) return unlikeComment(commentId);
      return likeComment(commentId);
    },
    onMutate: async ({ commentId, isLiked, reviewId }) => {
      await queryClient.cancelQueries({ queryKey: socialQueryKeys.comments.review(reviewId) });
      // Optimistic update for comment could be added here if needed, but skipping for simplicity as instructed only for review/collections mostly
    },
    onSettled: (_data, _err, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.comments.review(reviewId) });
    },
  });
}
