// ============================================
// DYNAMIC IMPORTS - FRONTEND
// Lazy loading for React components
// ============================================

'use client';

import React, { ComponentType, ReactNode, CSSProperties } from 'react';
import dynamic from 'next/dynamic';

// ============================================
// LOADING SKELETON
// Reusable loading placeholder
// ============================================

interface LoadingSkeletonProps {
  height?: string;
  width?: string;
  borderRadius?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

function LoadingSkeleton({ 
  height = '200px', 
  width = '100%', 
  borderRadius = '8px',
  animation = 'pulse'
}: LoadingSkeletonProps) {
  const containerStyle: CSSProperties = {
    height,
    width,
    borderRadius,
    backgroundColor: '#f0f0f0',
  };

  const animationStyle: CSSProperties = animation === 'pulse' 
    ? { animation: 'pulse 1.5s ease-in-out infinite' }
    : animation === 'wave'
    ? { 
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'wave 1.5s ease-in-out infinite'
      }
    : {};

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes wave {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
      <div style={{ ...containerStyle, ...animationStyle }} />
    </>
  );
}

// ============================================
// BASIC DYNAMIC IMPORTS
// ============================================

const Loading400 = () => <LoadingSkeleton height="400px" />;
const Loading200 = () => <LoadingSkeleton height="200px" />;
const Loading100 = () => <LoadingSkeleton height="100px" />;

// Lazy load heavy components
export const DynamicDataTable = dynamic(
  () => import('@/components/ui/DataTable'),
  { ssr: false, loading: Loading200 }
);

export const DynamicDatePicker = dynamic(
  () => import('@/components/ui/DatePicker').then(mod => ({ default: mod.DatePicker })),
  { ssr: false, loading: Loading100 }
);

export const DynamicForm = dynamic(
  () => import('@/components/ui/DynamicForm'),
  { ssr: false, loading: Loading200 }
);

export const DynamicPagination = dynamic(
  () => import('@/components/ui/Pagination').then(mod => ({ default: mod.Pagination })),
  { ssr: false, loading: Loading100 }
);

// ============================================
// HEAVY FEATURE COMPONENTS
// These are loaded only when needed
// ============================================

// Dynamic import with custom loading
export function withDynamicImport<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent?: ComponentType
) {
  return dynamic(importFn, {
    ssr: false,
    loading: () => LoadingComponent 
      ? <LoadingComponent /> 
      : <LoadingSkeleton height="200px" />
  });
}

// ============================================
// ROUTE-BASED CODE SPLITTING
// Preload routes for faster navigation
// ============================================

interface RouteConfig {
  path: string;
  preload?: () => void;
}

// Preload list for critical routes
export const criticalRoutes: RouteConfig[] = [
  { path: '/dashboard' },
  { path: '/dashboard/english' },
  { path: '/api/docs' }
];

// Preload a route when hovering
export function preloadRoute(path: string): void {
  // Use Next.js built-in preloading
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
}

// ============================================
// IMAGE OPTIMIZATION
// Manual image optimization utilities
// ============================================

interface ImageLoaderProps {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg';
}

// Next.js image loader configuration
export const imageLoader = ({ src, width, quality = 75 }: ImageLoaderProps): string => {
  // Use Next.js image optimization API
  const params = new URLSearchParams();
  params.set('url', src);
  params.set('w', width?.toString() || 'auto');
  params.set('q', quality.toString());
  
  return `/api/image?${params.toString()}`;
};

// Get optimized image URL for external sources
export function getOptimizedImageUrl(
  imageUrl: string,
  options: { width?: number; height?: number; quality?: number; format?: string } = {}
): string {
  const { width, height, quality = 75, format = 'webp' } = options;
  
  // If it's already an optimized URL, return it
  if (imageUrl.includes('/api/image')) {
    return imageUrl;
  }
  
  // Build query params
  const params = new URLSearchParams();
  params.set('url', imageUrl);
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('fmt', format);
  
  return `/api/image?${params.toString()}`;
}

// ============================================
// LAZY COMPONENT FACTORY
// Create lazy-loaded versions of any component
// ============================================

export function createLazyComponent<P = Record<string, unknown>>(
  importPath: string,
  options: {
    ssr?: boolean;
    loadingHeight?: string;
  } = {}
) {
  const { ssr = false, loadingHeight = '200px' } = options;
  
  const LoadingComp = () => <LoadingSkeleton height={loadingHeight} />;
  
  return dynamic(
    () => import(importPath),
    {
      ssr,
      loading: LoadingComp
    }
  );
}

// ============================================
// SUSPENSE WRAPPER
// For React Suspense integration
// ============================================

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SuspenseWrapper({ 
  children, 
  fallback = <LoadingSkeleton height="100px" />
}: SuspenseWrapperProps) {
  return (
    <React.Suspense fallback={fallback}>
      {children}
    </React.Suspense>
  );
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  DynamicDataTable,
  DynamicDatePicker,
  DynamicForm,
  DynamicPagination,
  withDynamicImport,
  preloadRoute,
  criticalRoutes,
  imageLoader,
  getOptimizedImageUrl,
  createLazyComponent,
  LoadingSkeleton,
  SuspenseWrapper
};
