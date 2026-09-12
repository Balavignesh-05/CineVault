'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth';
import { getMe } from '../lib/api/auth';

export function useAuth() {
  const { user, setUser, setLoading, logout } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  useEffect(() => {
    if (error) logout();
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
