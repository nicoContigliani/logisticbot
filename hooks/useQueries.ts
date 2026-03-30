import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys
export const queryKeys = {
  dashboard: ['dashboard'] as const,
};

// Fetch all dashboard data
async function fetchDashboardData() {
  // Removed circular-feedback API call - education feature removed
  return { isLoaded: true };
}

// Hook for fetching all dashboard data
export function useDashboardData() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// Hook for refreshing dashboard data
export function useRefreshDashboard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fetchDashboardData,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.dashboard, data);
    },
  });
}
