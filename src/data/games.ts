import type { GameType } from '@/models';

/**
 * O‘yin turlari katalogi — loyiha rejasidagi 5 ta o‘yin.
 * Bu ro‘yxat haqiqiy reja; o‘yinlarning o‘zi hali yaratilmagan.
 */
export interface GameDefinition {
  type: GameType;
  slug: string;
  order: number;
  title: string;
  short: string;
  description: string;
  howItWorks: string[];
  diagnosticValue: string[];
  collectedData: string[];
  plannedStage: number;
  color: string; // CSS o‘zgaruvchisi
  icon: 'Link2' | 'ListOrdered' | 'GitCompare' | 'Compass' | 'Network';
}

export const games: GameDefinition[] = [
  {
    type: 'concept_matching',
    slug: 'moslashtirish',
    order: 1,
    title: 'Tushunchalarni moslashtirish',
    short: 'Atama va ta’rifni, hodisa va sababni juftlang.',
    description: 'Talaba iqtisodiy atamalarni ularning ta’riflari, misollari yoki formulalari bilan moslashtiradi.',
    howItWorks: ['Chap ustunda atamalar, o‘ngda ta’riflar beriladi', 'Talaba juftliklarni tortib-tashlab bog‘laydi', 'Har bir juftlik alohida baholanadi'],
    diagnosticValue: ['Qaysi atamalar bir-biri bilan chalkashtirilishini aniqlaydi', 'Masalan: “talab” va “talab hajmi”, “foyda” va “daromad”'],
    collectedData: ['Har bir juftlash urinishi', 'Noto‘g‘ri juftliklar matritsasi', 'Sarflangan vaqt'],
    plannedStage: 5,
    color: 'var(--g-teal)',
    icon: 'Link2',
  },
  {
    type: 'logical_sequence',
    slug: 'ketma-ketlik',
    order: 2,
    title: 'Mantiqiy ketma-ketlik',
    short: 'Jarayon bosqichlarini to‘g‘ri tartibga keltiring.',
    description: 'Iqtisodiy jarayon bosqichlari (masalan, kapital harakati, sikl fazalari) aralash holda beriladi.',
    howItWorks: ['Bosqichlar kartalar ko‘rinishida beriladi', 'Talaba ularni to‘g‘ri tartibga qo‘yadi', 'Tartibdagi har bir siljish qayd etiladi'],
    diagnosticValue: ['Sabab-oqibat bog‘liqligini tushunishni tekshiradi', 'Qaysi bosqich joyi noto‘g‘ri tasavvur qilinganini ko‘rsatadi'],
    collectedData: ['Yakuniy tartib', 'Oraliq o‘zgarishlar soni', 'Pozitsiya xatolari'],
    plannedStage: 8,
    color: 'var(--g-blue)',
    icon: 'ListOrdered',
  },
  {
    type: 'compare_contrast',
    slug: 'taqqoslash',
    order: 3,
    title: 'Farqlash va taqqoslash',
    short: 'Ikki tushunchaning o‘xshash va farqli tomonlarini ajrating.',
    description: 'Masalan: erkin raqobat va monopoliya, inflyatsiya va deflyatsiya belgilarini guruhlash.',
    howItWorks: ['Belgilar ro‘yxati beriladi', 'Talaba ularni “A”, “B” yoki “Ikkalasi” guruhiga ajratadi'],
    diagnosticValue: ['Yaqin tushunchalar o‘rtasidagi chegarani qanchalik aniq bilishini ko‘rsatadi'],
    collectedData: ['Har bir belgi uchun tanlangan guruh', 'Takroriy xatolar'],
    plannedStage: 8,
    color: 'var(--g-violet)',
    icon: 'GitCompare',
  },
  {
    type: 'situational_decision',
    slug: 'vaziyatli-qaror',
    order: 4,
    title: 'Vaziyatli qaror qabul qilish',
    short: 'Real iqtisodiy vaziyatda eng asosli qarorni tanlang.',
    description: 'Korxona, bozor yoki davlat siyosati bo‘yicha qisqa keys va bir necha qaror varianti beriladi.',
    howItWorks: ['Keys matni va ma’lumotlar beriladi', 'Talaba qaror tanlaydi va asoslaydi', 'Qaror oqibatlari ko‘rsatiladi'],
    diagnosticValue: ['Nazariyani amaliyotga tatbiq etish ko‘nikmasini baholaydi', 'Qaror mantiqidagi bo‘shliqlarni ochadi'],
    collectedData: ['Tanlangan qaror', 'Ishonch darajasi', 'Asoslash matni (ixtiyoriy)'],
    plannedStage: 8,
    color: 'var(--g-coral)',
    icon: 'Compass',
  },
  {
    type: 'concept_map',
    slug: 'tushunchalar-xaritasi',
    order: 5,
    title: 'Tushunchalar xaritasi',
    short: 'Tushunchalar orasidagi bog‘lanishlarni chizing.',
    description: 'Talaba mavzu tushunchalari orasida “sabab bo‘ladi”, “turi hisoblanadi” kabi bog‘lanishlar quradi.',
    howItWorks: ['Tushunchalar tugunlar sifatida beriladi', 'Talaba ular orasida bog‘lanish va uning turini belgilaydi'],
    diagnosticValue: ['Bilimning tizimliligini ko‘rsatadi', 'Qaysi bog‘lanishlar umuman ko‘rilmaganini aniqlaydi'],
    collectedData: ['Qurilgan bog‘lanishlar grafi', 'Etalon xarita bilan farq'],
    plannedStage: 8,
    color: 'var(--g-amber)',
    icon: 'Network',
  },
];
