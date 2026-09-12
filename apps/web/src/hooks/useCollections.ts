'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialQueryKeys } from '@/constants/query-keys';
import { getMyCollections, getUserCollections, getCollection, createCollection, updateCollection, deleteCollection, addFilmToCollection, removeFilmFromCollection } from '@/lib/api/collections';
import type { CreateCollectionRequest, UpdateCollectionRequest } from '@cinevault/shared-types';

export function useMyCollections(page?: number) {
  return useQuery({
    queryKey: socialQueryKeys.collections.mine(page),
    queryFn: () => getMyCollections(page),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserCollections(userId: string | undefined, page?: number) {
  return useQuery({
    queryKey: socialQueryKeys.collections.user(userId!, page),
    queryFn: () => getUserCollections(userId!, page),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCollection(collectionId: string | undefined) {
  return useQuery({
    queryKey: socialQueryKeys.collections.single(collectionId!),
    queryFn: () => getCollection(collectionId!),
    enabled: !!collectionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCollectionRequest) => createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.collections.mine() });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, data }: { collectionId: string; data: UpdateCollectionRequest }) => updateCollection(collectionId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.collections.single(data.id) });
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.collections.mine() });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collectionId: string) => deleteCollection(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.collections.mine() });
    },
  });
}

export function useAddFilmToCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, filmId, position, note }: { collectionId: string; filmId: string; position?: number; note?: string }) => addFilmToCollection(collectionId, filmId, position, note),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.collections.single(collectionId) });
    },
  });
}

export function useRemoveFilmFromCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, filmId }: { collectionId: string; filmId: string }) => removeFilmFromCollection(collectionId, filmId),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.collections.single(collectionId) });
    },
  });
}
