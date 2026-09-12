import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  logModalFilmId: string | null;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  openLogModal: (filmId: string) => void;
  closeLogModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  theme: 'dark',
  sidebarOpen: false,
  logModalFilmId: null,
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openLogModal: (filmId) => set({ logModalFilmId: filmId }),
  closeLogModal: () => set({ logModalFilmId: null }),
}));
