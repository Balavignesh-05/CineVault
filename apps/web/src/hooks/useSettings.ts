import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, type UpdateSettingsPayload } from '@/lib/api/settings';
import { toast } from 'sonner';

export function useUserSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => settingsApi.updateSettings(payload),
    onSuccess: () => {
      toast.success('Settings updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: () => toast.error('Failed to update settings.'),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => settingsApi.deleteAccount(),
    onSuccess: () => {
      toast.success('Account deleted.');
      window.location.href = '/';
    },
    onError: () => toast.error('Failed to delete account.'),
  });
}
