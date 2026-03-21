import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
}

interface AppState {
  user: User | null;
  isLoading: boolean;
  theme: 'light' | 'dark' | 'system';
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: false,
  theme: 'system',
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setTheme: (theme) => set({ theme }),
}));
