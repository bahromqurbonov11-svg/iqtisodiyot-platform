import type { Dictionary } from './uz';

/**
 * Rus tili — keyingi bosqichda to‘ldiriladi.
 * Hozircha faqat tuzilma; tarjima qilinmagan kalitlar o‘zbekcha qoladi.
 */
export const ru: Partial<{ [K in keyof Dictionary]: Partial<Dictionary[K]> }> = {
  nav: {
    home: 'Главная',
    topics: 'Темы',
    about:'О курсе', materials:'Материалы', tests:'Тесты', games:'Игры', cabinet:'Кабинет',
    admin:'Администрирование', analytics:'Аналитика', login:'Войти', register:'Регистрация', menu:'Меню',
    backToSite:'Вернуться на сайт', simulator:'Симулятор', overview:'Обзор', results:'Мои результаты',
    profile:'Профиль', learners:'Студенты', integration:'Интеграция', study:'Обучение',
    manage:'Управление', site:'Сайт',
  },
  common: { open:'Открыть', viewAll:'Посмотреть все', topic:'Тема', topics:'темы', lecture:'Лекция', practice:'Практика', hours:'часов', search:'Поиск', all:'Все', source:'Источник' },
};
