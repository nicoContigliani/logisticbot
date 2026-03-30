'use client';

import { useCallback } from 'react';

// CSS-based animation utilities (replacing framer-motion)

// Page transition variants (CSS classes)
export const pageVariants = {
  initial: 'animate-fade-in-up',
  animate: 'animate-fade-in',
  exit: 'animate-fade-out',
};

// Fade in variants (CSS classes)
export const fadeInVariants = {
  initial: 'animate-fade-in',
  animate: 'animate-fade-in',
  exit: 'animate-fade-out',
};

// Slide variants (CSS classes)
export const slideInVariants = {
  initial: 'animate-slide-right',
  animate: 'animate-slide-right',
  exit: 'animate-slide-left',
};

// Scale variants (CSS classes)
export const scaleInVariants = {
  initial: 'animate-scale',
  animate: 'animate-scale',
  exit: 'animate-scale',
};

// Stagger children variants (CSS classes)
export const staggerContainer = {
  initial: 'animate-stagger',
  animate: 'animate-stagger',
};

// List item variants (CSS classes)
export const listItemVariants = {
  initial: 'animate-fade-in-up',
  animate: 'animate-fade-in-up',
};

// Hover scale animation (CSS class)
export const hoverScale = 'hover:scale-102 transition-transform duration-200';

// Tap scale animation (CSS class)
export const tapScale = 'active:scale-98 transition-transform duration-100';

// Custom hook for staggered animations
export function useStaggeredAnimation(itemCount: number, baseDelay: number = 0) {
  const getDelay = useCallback(
    (index: number) => ({
      delay: baseDelay + index * 0.1,
      duration: 0.4,
    }),
    [baseDelay]
  );

  const containerVariants = {
    initial: 'animate-stagger',
    animate: 'animate-stagger',
  };

  const itemVariants = {
    initial: 'animate-fade-in-up',
    animate: (index: number) => `animate-stagger animate-stagger-${index + 1}`,
  };

  return { containerVariants, itemVariants, getDelay };
}

// Animation configuration
export const animationConfig = {
  fast: { duration: 0.2 },
  normal: { duration: 0.4 },
  slow: { duration: 0.6 },
};

// Legacy export for compatibility
export const springConfig = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

export default {
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
};
