import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'student' | 'admin';
}

interface DashboardData {
  lastFetched: number;
  isLoaded: boolean;
}

interface AppState {
  user: User | null;
  isLoading: boolean;
  theme: 'light' | 'dark' | 'system';
  themeStyle: 'modern' | 'metro'; // modern = default, metro = Windows 8 style
  
  // Dashboard data
  dashboardData: DashboardData;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setThemeStyle: (style: 'modern' | 'metro') => void;
  
  // Dashboard data actions
  setDashboardData: (data: Partial<DashboardData>) => void;
  clearDashboardData: () => void;
}

const initialDashboardData: DashboardData = {
  lastFetched: 0,
  isLoaded: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      theme: 'system',
      themeStyle: 'modern',
      
      dashboardData: initialDashboardData,
      
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setTheme: (theme) => set({ theme }),
      setThemeStyle: (themeStyle) => set({ themeStyle }),
      
      setDashboardData: (data) => set((state) => ({
        dashboardData: { ...state.dashboardData, ...data, isLoaded: true }
      })),
      
      clearDashboardData: () => set({ dashboardData: initialDashboardData }),
    }),
    {
      name: 'logisticbot-app-storage',
      partialize: (state) => ({
        theme: state.theme,
        themeStyle: state.themeStyle,
        dashboardData: {
          lastFetched: state.dashboardData.lastFetched,
          isLoaded: state.dashboardData.isLoaded,
        }
      }),
    }
  )
);

// Helper hook to check if data is stale (older than 5 minutes)
export const useIsDataStale = () => {
  const { dashboardData } = useAppStore();
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - dashboardData.lastFetched > fiveMinutes;
};
