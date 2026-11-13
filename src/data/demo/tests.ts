import { topics } from '@/data/subject';

/**
 * Diagnostik testlar katalogi.
 * Hozir faqat tuzilma: har bir mavzu uchun bitta diagnostik test rejalashtirilgan.
 * Savollar 4-bosqichda mavjud test to‘plamlaridan (ON/Testlar) olinib,
 * tushunchalarga bog‘lanadi.
 */
export interface TestDefinition {
  id: string;
  topicId: string;
  title: string;
  kind: 'diagnostic' | 'self_check' | 'final';
  plannedQuestions: number;
  status: 'planned' | 'draft' | 'published';
}

export const testCatalog: TestDefinition[] = [
  ...topics.map<TestDefinition>((t) => ({
    id: `test-${t.id}`,
    topicId: t.id,
    title: `${t.globalOrder}-mavzu bo‘yicha diagnostik test`,
    kind: 'diagnostic',
    plannedQuestions: 15,
    status: 'planned',
  })),
];

/** Test interfeysini ko‘rsatish uchun DEMO savol (baholanmaydi) */
export const demoQuestion = {
  topicTitle: 'Talab, taklif, bozor muvozanati',
  concept: 'Talab va talab hajmi',
  stem: 'Tovar narxi pasayganda xaridorlar uni ko‘proq sotib ola boshladi. Bu holat qanday izohlanadi?',
  options: [
    { id: 'a', text: 'Talab egri chizig‘i o‘ngga siljidi' },
    { id: 'b', text: 'Talab hajmi talab egri chizig‘i bo‘ylab oshdi' },
    { id: 'c', text: 'Taklif egri chizig‘i chapga siljidi' },
    { id: 'd', text: 'Bozor muvozanati buzildi' },
  ],
};
