import { api } from './client';
import type { ActivityEvent, PaginatedResult } from '@cinevault/shared-types';

export async function getUserActivity(userId: string, page?: number): Promise<PaginatedResult<ActivityEvent>> {
  const res = await api.get<{ data: PaginatedResult<ActivityEvent> }>(`/activity/user/${userId}`, { params: { page } });
  return res.data;
}

export async function getActivityFeed(page?: number): Promise<PaginatedResult<ActivityEvent>> {
  const res = await api.get<{ data: PaginatedResult<ActivityEvent> }>(`/activity/feed`, { params: { page } });
  return res.data;
}
