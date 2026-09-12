'use client';

import { useQuery } from '@tanstack/react-query';
import { socialQueryKeys } from '@/constants/query-keys';
import { getUserActivity, getActivityFeed } from '@/lib/api/activity';

export function useUserActivity(userId: string | undefined, page?: number) {
  return useQuery({
    queryKey: socialQueryKeys.activity.user(userId!, page),
    queryFn: () => getUserActivity(userId!, page),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useActivityFeed(page?: number) {
  return useQuery({
    queryKey: socialQueryKeys.activity.feed(page),
    queryFn: () => getActivityFeed(page),
    staleTime: 5 * 60 * 1000,
  });
}
