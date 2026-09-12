import { api } from './client';
import type { Collection, PaginatedResult, CreateCollectionRequest, UpdateCollectionRequest } from '@cinevault/shared-types';

export async function getMyCollections(page?: number): Promise<PaginatedResult<Collection>> {
  const res = await api.get<{ data: PaginatedResult<Collection> }>(`/collections/me`, { params: { page } });
  return res.data;
}

export async function getUserCollections(userId: string, page?: number): Promise<PaginatedResult<Collection>> {
  const res = await api.get<{ data: PaginatedResult<Collection> }>(`/collections/user/${userId}`, { params: { page } });
  return res.data;
}

export async function getCollection(collectionId: string): Promise<Collection> {
  const res = await api.get<{ data: Collection }>(`/collections/${collectionId}`);
  return res.data;
}

export async function createCollection(data: CreateCollectionRequest): Promise<Collection> {
  const res = await api.post<{ data: Collection }>(`/collections`, data);
  return res.data;
}

export async function updateCollection(collectionId: string, data: UpdateCollectionRequest): Promise<Collection> {
  const res = await api.put<{ data: Collection }>(`/collections/${collectionId}`, data);
  return res.data;
}

export async function deleteCollection(collectionId: string): Promise<void> {
  await api.delete(`/collections/${collectionId}`);
}

export async function addFilmToCollection(collectionId: string, filmId: string, position?: number, note?: string): Promise<void> {
  await api.post(`/collections/${collectionId}/films`, { filmId, position, note });
}

export async function removeFilmFromCollection(collectionId: string, filmId: string): Promise<void> {
  await api.delete(`/collections/${collectionId}/films/${filmId}`);
}

export async function reorderCollectionFilms(collectionId: string, films: { filmId: string; position: number }[]): Promise<void> {
  await api.put(`/collections/${collectionId}/reorder`, { films });
}

export async function likeCollection(collectionId: string): Promise<void> {
  await api.post(`/collections/${collectionId}/like`);
}

export async function unlikeCollection(collectionId: string): Promise<void> {
  await api.delete(`/collections/${collectionId}/like`);
}
