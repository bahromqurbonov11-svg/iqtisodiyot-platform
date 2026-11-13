import type { Dictionary } from './uz';

/**
 * Rus tili — keyingi bosqichda to‘ldiriladi.
 * Hozircha faqat tuzilma; tarjima qilinmagan kalitlar o‘zbekcha qoladi.
 */
export const ru: Partial<{ [K in keyof Dictionary]: Partial<Dictionary[K]> }> = {
  nav: {
    home: 'Главная',
    topics: 'Темы',
  },
};
