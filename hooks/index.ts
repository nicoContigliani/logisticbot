export { useForm } from './useForm';
export { 
  pageVariants,
  fadeInVariants,
  slideInVariants,
  scaleInVariants,
  staggerContainer,
  listItemVariants,
  hoverScale,
  tapScale,
  animationConfig,
  springConfig,
  useStaggeredAnimation,
} from './useAnimations';

// Zustand-based hooks (legacy - for backwards compatibility)
export { 
  useDashboardData as useDashboardDataStore
} from './useDashboardData';

// TanStack Query hooks (recommended for caching)
export { 
  useDashboardData as useDashboardQuery,
  useRefreshDashboard,
  queryKeys 
} from './useQueries';
