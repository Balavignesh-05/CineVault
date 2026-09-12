import { api } from './client';
import type { UserDashboardData, UserStats } from '@cinevault/shared-types';

export async function getDashboardData(): Promise<UserDashboardData> {
  const res = await api.get<{ data: UserDashboardData }>(`/dashboard`);
  return res.data;
}

export async function getUserStats(username: string): Promise<UserStats> {
  const res = await api.get<{ data: UserStats }>(`/dashboard/stats/${username}`);
  return res.data;
}
