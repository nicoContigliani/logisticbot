'use client';

import { useEffect } from 'react';
import { Providers } from '@/components/providers';

export function ClientBody({ children }: { children: React.ReactNode }) {
  // Update html lang attribute when language changes
  useEffect(() => {
    const stored = localStorage.getItem('logisticbot-lang') || 'es';
    document.documentElement.lang = stored;

    const observer = new MutationObserver(() => {
      const htmlLang = document.documentElement.lang;
      if (htmlLang) {
        document.documentElement.lang = htmlLang;
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });

    return () => observer.disconnect();
  }, []);

  return <Providers>{children}</Providers>;
}
