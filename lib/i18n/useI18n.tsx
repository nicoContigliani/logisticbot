'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import esMessages from '@/messages/es.json';
import enMessages from '@/messages/en.json';

type Messages = typeof esMessages;
type Locale = 'es' | 'en';

const allMessages: Record<Locale, Messages> = {
  es: esMessages,
  en: enMessages,
};

const defaultLocale: Locale = 'es';

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  messages: Messages;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const stored = localStorage.getItem('logisticbot-lang');
    if (stored && (stored === 'es' || stored === 'en')) {
      setLocaleState(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('logisticbot-lang', newLocale);
    document.cookie = `logisticbot-lang=${newLocale}; path=/; max-age=31536000`;
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const messages = allMessages[locale];
      let value = getNestedValue(messages as unknown as Record<string, unknown>, key);
      if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
          value = value.replace(`{${paramKey}}`, String(paramValue));
        }
      }
      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, messages: allMessages[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export function useT() {
  return useI18n().t;
}

export type { Locale };
