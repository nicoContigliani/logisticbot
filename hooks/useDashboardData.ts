import { useCallback, useEffect, useState, useRef } from 'react';
import { useAppStore, useIsDataStale } from '@/store/useAppStore';

interface FetchOptions {
  forceRefresh?: boolean;
}

// Custom hook for fetching dashboard data with Zustand caching
export function useDashboardData(options: FetchOptions = {}) {
  const { forceRefresh = false } = options;
  
  const { 
    dashboardData, 
    setDashboardData,
    clearDashboardData 
  } = useAppStore();
  
  const isDataStale = useIsDataStale();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasCalledFetch = useRef(false);
  
  const fetchData = useCallback(async () => {
    // Prevent multiple concurrent fetches
    if (hasCalledFetch.current) {
      return;
    }
    hasCalledFetch.current = true;
    
    // Don't fetch if we have data and it's not stale (unless force refresh)
    if (dashboardData.isLoaded && !forceRefresh && !isDataStale) {
      return;
    }
    
    setIsFetching(true);
    setError(null);
    
    try {
      // Removed circular-feedback API call - education feature removed
      // Just mark as loaded
      setDashboardData({
        lastFetched: Date.now(),
        isLoaded: true
      });
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsFetching(false);
    }
  }, [dashboardData.isLoaded, forceRefresh, isDataStale, setDashboardData]);
  
  // Auto-fetch on mount if needed
  useEffect(() => {
    if (!dashboardData.isLoaded || isDataStale || forceRefresh) {
      fetchData();
    }
  }, [dashboardData.isLoaded, isDataStale, forceRefresh, fetchData]);
  
  return {
    // Data from store
    isLoaded: dashboardData.isLoaded,
    
    // State
    isFetching,
    error,
    
    // Actions
    fetchData,
    refreshData: () => fetchData(),
    clearData: clearDashboardData,
  };
}
