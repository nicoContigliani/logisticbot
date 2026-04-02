'use client';

import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './ThemeProvider';
import { I18nProvider } from '@/lib/i18n/useI18n';
import { useState } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export { ThemeProvider };
