import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { appConfig } from '@/config/app.config';
import { uz, type Dictionary } from './uz';
import { ru } from './ru';
import { en } from './en';

export type Locale = 'uz' | 'ru' | 'en';

function merge(locale: Locale): Dictionary {
  if (locale === 'uz') return uz;
  const out = structuredClone(uz) as Record<string, Record<string, string>>;
  for (const [section, values] of Object.entries(locale === 'ru' ? ru : en)) {
    Object.assign(out[section], values);
  }
  return out as unknown as Dictionary;
}

interface I18nValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try { const saved = localStorage.getItem('econ-language'); if (saved === 'uz' || saved === 'ru' || saved === 'en') return saved; } catch { /* Storage may be unavailable. */ }
    return appConfig.i18n.defaultLocale;
  });
  useEffect(() => {
    document.documentElement.lang = locale;
    try { localStorage.setItem('econ-language', locale); } catch { /* Keep the current selection in memory. */ }
  }, [locale]);
  const value = useMemo(() => ({ locale, t: merge(locale), setLocale }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n I18nProvider ichida ishlatilishi kerak');
  return ctx;
}
