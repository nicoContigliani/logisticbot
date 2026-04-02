'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n, Locale } from '@/lib/i18n/useI18n';

const locales = [
  { code: 'es' as Locale, label: 'Español', flag: '🇪🇸' },
  { code: 'en' as Locale, label: 'English', flag: '🇬🇧' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  const current = locales.find(l => l.code === locale) || locales[0];

  return (
    <div ref={ref} className="language-switcher">
      <button
        className="language-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch language"
      >
        <span className="language-flag">{current.flag}</span>
        <span className="language-label">{current.label}</span>
        <span className="language-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="language-dropdown">
          {locales.map((l) => (
            <button
              key={l.code}
              className={`language-option ${l.code === locale ? 'language-option-active' : ''}`}
              onClick={() => handleSwitch(l.code)}
            >
              <span className="language-flag">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
