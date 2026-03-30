'use client';

import React from 'react';

interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'bounce';
  duration?: 'fast' | 'normal' | 'slow';
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedContainer({
  children,
  animation = 'fadeIn',
  duration = 'normal',
  delay = 0,
  className = '',
  style = {},
}: AnimatedContainerProps) {
  const animationClass = `animate-${animation}`;
  const durationClass = `animate-duration-${duration}`;
  
  const combinedStyle: React.CSSProperties = {
    ...style,
    animationDelay: delay > 0 ? `${delay}ms` : undefined,
  };

  return (
    <div
      className={`${animationClass} ${durationClass} ${className}`.trim()}
      style={combinedStyle}
    >
      {children}
    </div>
  );
}

export default AnimatedContainer;
