'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';

// Simple theme provider - no MUI dependency
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme = 'light' } = useAppStore();
  
  // Set data attribute for CSS selectors
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', theme);
  }, [theme]);

  return (
    <>
      {children}
    </>
  );
}

export default ThemeProvider;
