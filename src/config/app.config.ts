/**
 * Ilova konfiguratsiyasi.
 * Markaziy ko‘p fanli platformaga ulanish uchun barcha identifikatorlar shu yerda.
 * Keyinchalik .env fayllari orqali (import.meta.env) almashtiriladi.
 */
export const appConfig = {
  appName: 'Iqtisodiyot nazariyasi',
  appTagline: 'Ta’lim va analitika platformasi',
  version: '0.2.0',
  stage: 1, // Joriy rivojlanish bosqichi (README dagi yo‘l xaritasiga qarang)

  /** Tashkilot va fan identifikatorlari (markaziy platforma uchun) */
  organization: {
    id: 'org-soliq-oliy-maktabi',
    name: 'Soliq qo‘mitasi huzuridagi Soliq oliy maktabi',
  },
  subject: {
    id: 'subj-iqtisodiyot-nazariyasi',
    code: 'IQN11210',
    name: 'Iqtisodiyot nazariyasi',
  },

  /** API: hozircha ulanmagan. Keyingi bosqichlarda server manzili beriladi. */
  api: {
    baseUrl: '/api',
    version: 'v1',
    enabled: false,
  },

  /** Til sozlamalari */
  i18n: {
    defaultLocale: 'uz' as const,
    availableLocales: ['uz'] as const, // 'ru' keyingi bosqichda qo‘shiladi
  },

  /** Funksiyalar holati — ishlamaydigan funksiya ishlayotgandek ko‘rsatilmasligi uchun */
  features: {
    realAuth: false,
    database: false,
    testScoring: false,
    games: false,
    analyticsEngine: false,
    centralPlatformSync: false,
  },
};

export type AppConfig = typeof appConfig;
