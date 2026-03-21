'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import Box from '@mui/material/Box';

interface AnimatedContainerProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  animation?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight';
  delay?: number;
  duration?: number;
  className?: string;
}

const animations = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 50, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
  slideUp: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 },
  },
  slideDown: {
    initial: { y: -50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 50, opacity: 0 },
  },
  slideLeft: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  },
  slideRight: {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 50, opacity: 0 },
  },
};

export function AnimatedContainer({
  children,
  animation = 'fade',
  delay = 0,
  duration = 0.5,
  className,
  ...props
}: AnimatedContainerProps) {
  const selectedAnimation = animations[animation];

  return (
    <motion.div
      initial={{ ...selectedAnimation.initial, transition: { delay, duration } }}
      animate={{ ...selectedAnimation.animate, transition: { delay, duration } }}
      exit={{ ...selectedAnimation.exit, transition: { delay: 0, duration: duration * 0.5 } }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedBoxProps {
  children: ReactNode;
  animation?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight';
  delay?: number;
  duration?: number;
  className?: string;
}

export function AnimatedBox({
  children,
  animation = 'fade',
  delay = 0,
  duration = 0.5,
  className,
}: AnimatedBoxProps) {
  const selectedAnimation = animations[animation];

  return (
    <motion.div
      initial={selectedAnimation.initial}
      animate={selectedAnimation.animate}
      exit={selectedAnimation.exit}
      transition={{ delay, duration, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListProps {
  children: ReactNode;
  delay?: number;
  staggerDelay?: number;
}

export function AnimatedList({ children, delay = 0, staggerDelay = 0.1 }: AnimatedListProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay }}
      >
        <AnimatePresence>
          {Array.isArray(children)
            ? children.map((child, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: delay + index * staggerDelay, duration: 0.3 }}
                >
                  {child}
                </motion.div>
              ))
            : children}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

export default AnimatedContainer;
