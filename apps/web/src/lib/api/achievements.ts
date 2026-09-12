import { api } from './client';
import type { Achievement, UserAchievement } from '@cinevault/shared-types';

export async function getAllAchievements(): Promise<Achievement[]> {
  const res = await api.get<{ data: Achievement[] }>(`/achievements`);
  return res.data;
}

export async function getMyAchievements(): Promise<UserAchievement[]> {
  const res = await api.get<{ data: UserAchievement[] }>(`/achievements/me`);
  return res.data;
}
