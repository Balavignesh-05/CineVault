import { api } from './client';
import type { Notification, PaginatedResult } from '@cinevault/shared-types';

export async function getNotifications(page?: number): Promise<PaginatedResult<Notification>> {
  const res = await api.get<{ data: PaginatedResult<Notification> }>(`/notifications`, { params: { page } });
  return res.data;
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const res = await api.get<{ data: { count: number } }>(`/notifications/unread`);
  return res.data;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await api.patch(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch(`/notifications/read/all`);
}
