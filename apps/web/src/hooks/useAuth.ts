'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth';
import { getMe } from '../lib/api/auth';
import { ApiError } from '../lib/api/client';

export function useAuth() {
  const { user, setUser, setLoading, logout } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  useEffect(() => {
    if (error) {
      // Only logout on auth errors (401/403), not network errors
      const isAuthError =
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403);
      if (isAuthError) logout();
    }
  }, [error, logout]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await import('../lib/api/auth').then(m => m.logout());
    } catch (e) {
      console.error('API logout failed', e);
    }
    logout();
    queryClient.setQueryData(['auth', 'me'], null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: handleLogout,
  };
}
