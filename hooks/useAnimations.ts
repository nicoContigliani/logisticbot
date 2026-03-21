'use client';

import { useCallback } from 'react';
import { motion, Variants, Transition } from 'framer-motion';

// Type-safe spring configuration
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// Fade in variants
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Slide variants
export const slideInVariants: Variants = {
  initial: {
    opacity: 0,
    x: -50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      duration: 0.3,
    },
  },
};

// Scale variants
export const scaleInVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
    },
  },
};

// Stagger children variants
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// List item variants
export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Hover scale animation
export const hoverScale = {
  scale: 1.02,
  transition: {
    duration: 0.2,
  },
};

// Tap scale animation
export const tapScale = {
  scale: 0.98,
  transition: {
    duration: 0.1,
  },
};

// Custom hook for staggered animations
export function useStaggeredAnimation(itemCount: number, baseDelay: number = 0) {
  const getDelay = useCallback(
    (index: number) => ({
      delay: baseDelay + index * 0.1,
      duration: 0.4,
    }),
    [baseDelay]
  );

  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: baseDelay,
      },
    },
  };

  const itemVariants: Variants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.1,
        ease: 'easeOut',
      },
    }),
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
export const springConfig = springTransition;

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
  springTransition,
};
