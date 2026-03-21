'use client';

import React, { memo, useCallback, useMemo, ComponentType, ReactNode } from 'react';

// Higher-order component for memoizing functional components
export function memoize<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  return memo(Component, (prevProps, nextProps) => {
    // Custom comparison for deep equality of complex props
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }
    
    for (const key of prevKeys) {
      if (prevProps[key as keyof P] !== nextProps[key as keyof P]) {
        return false;
      }
    }
    
    return true;
  });
}

// Memoized wrapper for components with children
interface WithChildrenProps {
  children?: ReactNode;
}

export const MemoizedBox = memoize(({ children, ...props }: any) => {
  return React.createElement('div', props, children);
});

// Utility to create memoized event handlers
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps) as T;
}

// Utility to create memoized values
export function useMemoizedValue<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

// Lazy loading helper for components
export function lazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(factory);
}

// Preload helper for dynamic imports
export function preload<T>(factory: () => Promise<{ default: T }>): void {
  if (typeof window !== 'undefined') {
    factory();
  }
}

export default memoize;
