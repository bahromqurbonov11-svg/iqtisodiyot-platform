import { useI18n, type Locale } from '@/i18n';

export function LanguageSelect() {
  const { locale, setLocale } = useI18n();
  return <select className="site-language-select" aria-label="Til / Язык / Language" value={locale}
    onChange={event => setLocale(event.target.value as Locale)}>
    <option value="uz">O‘zbekcha</option>
    <option value="ru">Русский</option>
    <option value="en">English</option>
  </select>;
}
