import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@cinevault/shared-types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null });
      },
    }),
    {
      name: 'cinevault-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
