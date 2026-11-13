import type { Insight, MasteryLevel } from '@/models';
import { topics } from '@/data/subject';
import { demoGroups, demoLearners } from './learners';
import { seeded } from './random';

/**
 * DEMO ANALITIKA MA’LUMOTLARI
 * Barcha raqamlar to‘qima. Interfeys qanday ko‘rinishini namoyish qilish uchun.
 * Haqiqiy hisob-kitoblar 7-bosqichda server tomonida bajariladi.
 *
 * Qoida: topshiriq bajarilmagan bo‘lsa — qiymat `null` ("ma’lumot yetarli emas"),
 * hech qachon 0 emas.
 */
const rand = seeded(7);

/** Faqat birinchi 9 mavzu "o‘tilgan" deb olinadi; qolganlari uchun dalil yo‘q */
const COVERED = 9;

export interface MasteryCell {
  topicId: string;
  value: number | null; // 0..1 yoki null
  evidence: number; // javoblar soni
}

export const groupTopicMastery: { group: string; cells: MasteryCell[] }[] = demoGroups.map((group, gi) => ({
  group,
  cells: topics.map((t, ti) => {
    if (ti >= COVERED + (gi === 0 ? 1 : 0)) return { topicId: t.id, value: null, evidence: 0 };
    const base = 0.78 - ti * 0.025 - gi * 0.04 + (ti === 5 ? -0.2 : 0) + (ti === 6 ? -0.08 : 0);
    const v = Math.max(0.25, Math.min(0.95, base + (rand() - 0.5) * 0.12));
    return { topicId: t.id, value: Math.round(v * 100) / 100, evidence: 40 + Math.floor(rand() * 60) };
  }),
}));

export function levelOf(value: number | null): MasteryLevel {
  if (value === null) return 'insufficient_data';
  if (value >= 0.75) return 'mastered';
  if (value >= 0.55) return 'developing';
  return 'gap';
}

export interface ConceptErrorStat {
  concept: string;
  topicOrder: number;
  errorRate: number;
  evidence: number;
  students: number;
}

export const conceptErrors: ConceptErrorStat[] = [
  { concept: 'Talab va talab hajmi farqi', topicOrder: 6, errorRate: 0.48, evidence: 212, students: 17 },
  { concept: 'Narx egiluvchanligini hisoblash', topicOrder: 6, errorRate: 0.41, evidence: 180, students: 15 },
  { concept: 'Muqobil xarajat (imkoniyat narxi)', topicOrder: 1, errorRate: 0.37, evidence: 205, students: 14 },
  { concept: 'Monopoliyada narx va hajm tanlovi', topicOrder: 7, errorRate: 0.33, evidence: 146, students: 12 },
  { concept: 'Ishlab chiqarish imkoniyatlari chegarasi', topicOrder: 2, errorRate: 0.29, evidence: 198, students: 11 },
  { concept: 'Qiymat va naflilik nazariyalari', topicOrder: 4, errorRate: 0.26, evidence: 164, students: 9 },
  { concept: 'Bozor infratuzilmasi elementlari', topicOrder: 5, errorRate: 0.19, evidence: 171, students: 7 },
];

export interface Misconception {
  id: string;
  title: string;
  topicOrder: number;
  share: number; // talabalarning ulushi
  pattern: string;
  repeated: number; // necha marta takrorlangan
}

export const misconceptions: Misconception[] = [
  { id: 'm1', title: 'Narx o‘zgarishini talab egri chizig‘ining siljishi deb talqin qilish', topicOrder: 6, share: 0.38, pattern: 'Noto‘g‘ri variant B tanlanishi 3 ta savolda takrorlangan', repeated: 41 },
  { id: 'm2', title: 'Daromad va foydani bir xil tushuncha deb hisoblash', topicOrder: 11, share: 0.22, pattern: 'Moslashtirish savollarida juftlik xatosi', repeated: 18 },
  { id: 'm3', title: 'Muqobil xarajatni faqat pul xarajati deb tushunish', topicOrder: 1, share: 0.31, pattern: 'Vaziyatli savollarda vaqt omili e’tiborsiz qolgan', repeated: 29 },
  { id: 'm4', title: 'Monopoliya har doim eng yuqori narxni belgilaydi degan tasavvur', topicOrder: 7, share: 0.19, pattern: 'Ishonch yuqori, javob noto‘g‘ri', repeated: 14 },
];

/** Haftalik dinamika (o‘rtacha natija, faqat topshirganlar bo‘yicha) */
export const weeklyTrend = {
  weeks: ['1-h', '2-h', '3-h', '4-h', '5-h', '6-h', '7-h', '8-h', '9-h', '10-h'],
  series: demoGroups.map((g, gi) => ({
    name: g,
    values: Array.from({ length: 10 }, (_, w) => Math.round((0.52 + w * 0.025 - gi * 0.03 + (rand() - 0.5) * 0.05) * 100)),
  })),
};

/** Ishonch va natija: har bir ishonch darajasida to‘g‘ri javoblar ulushi */
export const calibration = [
  { confidence: 1, accuracy: 0.34, n: 96 },
  { confidence: 2, accuracy: 0.45, n: 188 },
  { confidence: 3, accuracy: 0.58, n: 342 },
  { confidence: 4, accuracy: 0.66, n: 401 },
  { confidence: 5, accuracy: 0.71, n: 289 },
];

export const calibrationQuadrants = [
  { key: 'sure_right', label: 'Ishonchli va to‘g‘ri', value: 0.41, tone: 'success' as const, note: 'Mustahkam bilim' },
  { key: 'sure_wrong', label: 'Ishonchli, lekin noto‘g‘ri', value: 0.17, tone: 'danger' as const, note: 'Eng xavfli: noto‘g‘ri tasavvur mustahkamlangan' },
  { key: 'unsure_right', label: 'Ishonchsiz, lekin to‘g‘ri', value: 0.19, tone: 'warning' as const, note: 'Bilim bor, lekin mustahkam emas' },
  { key: 'unsure_wrong', label: 'Ishonchsiz va noto‘g‘ri', value: 0.23, tone: 'info' as const, note: 'Talaba bo‘shliqni o‘zi sezadi' },
];

/** Bilimlar bog‘liqligi: oldingi tushunchadagi bo‘shliq keyingi mavzuga ta’siri (gipoteza) */
export const prerequisiteLinks = [
  { from: 'Muqobil xarajat', fromTopic: 1, to: 'Ishlab chiqarish imkoniyatlari chegarasi', toTopic: 2, strength: 0.62 },
  { from: 'Talab va talab hajmi farqi', fromTopic: 6, to: 'Narx shakllanishi', toTopic: 8, strength: 0.54 },
  { from: 'Xarajat turlari', fromTopic: 11, to: 'Monopoliyada narx tanlovi', toTopic: 7, strength: 0.41 },
];

export const insights: Insight[] = [
  { id: 'i1', kind: 'observation', text: '6-mavzu (Talab, taklif, bozor muvozanati) barcha guruhlarda eng past natijaga ega.', evidence: '3 guruh, 512 ta javob, o‘rtacha 49%' },
  { id: 'i2', kind: 'hypothesis', text: 'Ehtimoliy sabab: “talab” va “talab hajmi” tushunchalari ajratilmagan.', evidence: 'Shu juftlikdagi noto‘g‘ri variant 38% talabada takrorlangan. Tasdiqlash uchun qo‘shimcha savollar kerak.' },
  { id: 'i3', kind: 'recommendation', text: '6-mavzuning grafik qismini qisqa takrorlash va moslashtirish o‘yinini berish.', evidence: '2 ta bog‘liq tushunchada xato ulushi 40% dan yuqori' },
  { id: 'i4', kind: 'observation', text: '17% javoblarda talaba o‘ziga ishongan, lekin javob noto‘g‘ri.', evidence: '1316 ta ishonch bahosi berilgan javob' },
];

/** Talabalar jadvali uchun qisqa ko‘rsatkichlar */
export const learnerRows = demoLearners
  .filter((l) => l.status === 'approved')
  .map((l, i) => {
    const r = seeded(100 + i);
    const attempted = 3 + Math.floor(r() * 7);
    const avg = Math.round((0.45 + r() * 0.45) * 100);
    const gaps = Math.floor(r() * 4);
    return { learner: l, attempted, avg, gaps, risk: avg < 55 || gaps >= 3 };
  });

/** Joriy (demo) talaba uchun mavzular bo‘yicha natija */
export const currentLearnerTopics = topics.map((t, i) => {
  const r = seeded(500 + i);
  if (i >= 8) return { topic: t, value: null as number | null, attempts: 0, selfRating: null as number | null };
  const v = Math.round((0.5 + r() * 0.45 - (i === 5 ? 0.18 : 0)) * 100) / 100;
  return { topic: t, value: v, attempts: 1 + Math.floor(r() * 3), selfRating: Math.min(5, Math.max(1, Math.round(v * 5 + (r() - 0.3) * 2))) };
});
