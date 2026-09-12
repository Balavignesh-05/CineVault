import { api } from './client';
import type { User } from '@cinevault/shared-types';

export interface UpdateSettingsPayload {
  displayName?: string;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  isPrivate?: boolean;
}

export const settingsApi = {
  getSettings: () => api.get<{ data: User }>('/settings'),

  updateSettings: (payload: UpdateSettingsPayload) =>
    api.patch<{ data: User }>('/settings', payload),

  deleteAccount: () => api.delete<void>('/settings/account'),
};
