import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { toast } from 'sonner';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(),
    staleTime: 30 * 1000,
  });
}

export function useAdminUsers(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getUsers(params),
  });
}

export function useAdminUserMutations() {
  const queryClient = useQueryClient();

  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: () => {
      toast.success('User suspended');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('Failed to suspend user'),
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => adminApi.banUser(id),
    onSuccess: () => {
      toast.success('User banned');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('Failed to ban user'),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => adminApi.restoreUser(id),
    onSuccess: () => {
      toast.success('User status restored to active');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('Failed to restore user'),
  });

  return { suspendMutation, banMutation, restoreMutation };
}

export function useAdminReviews(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'reviews', params],
    queryFn: () => adminApi.getReviews(params),
  });
}

export function useAdminReviewMutations() {
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveReview(id),
    onSuccess: () => {
      toast.success('Review approved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });

  const featureMutation = useMutation({
    mutationFn: (id: string) => adminApi.featureReview(id),
    onSuccess: () => {
      toast.success('Review feature status toggled');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });

  return { approveMutation, featureMutation, deleteMutation };
}

export function useAdminCollections(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'collections', params],
    queryFn: () => adminApi.getCollections(params),
  });
}

export function useAdminCollectionMutations() {
  const queryClient = useQueryClient();

  const featureMutation = useMutation({
    mutationFn: (id: string) => adminApi.featureCollection(id),
    onSuccess: () => {
      toast.success('Collection feature status toggled');
      queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCollection(id),
    onSuccess: () => {
      toast.success('Collection deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] });
    },
  });

  return { featureMutation, deleteMutation };
}

export function useAdminReports(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => adminApi.getReports(params),
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.resolveReport(id, status),
    onSuccess: () => {
      toast.success('Report updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
    onError: () => toast.error('Failed to resolve report'),
  });
}

export function useAdminLogs(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'logs', params],
    queryFn: () => adminApi.getLogs(params),
  });
}
