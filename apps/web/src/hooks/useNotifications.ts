'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialQueryKeys } from '@/constants/query-keys';
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '@/lib/api/notifications';

export function useNotifications(page?: number) {
  return useQuery({
    queryKey: socialQueryKeys.notifications.list(page),
    queryFn: () => getNotifications(page),
    staleTime: 60 * 1000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: socialQueryKeys.notifications.count(),
    queryFn: () => getUnreadCount(),
    staleTime: 60 * 1000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.notifications.list() });
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.notifications.count() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.notifications.list() });
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.notifications.count() });
    },
  });
}
