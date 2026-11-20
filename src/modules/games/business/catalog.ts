import { sectors as baseSectors, type Sector } from './scenarios';
import { extraSectors, extraStages } from './extra';

/** Barcha sohalar: asosiy + qo‘shimcha bosqichlar + yangi sohalar. Har jamoa uchun 6 ta bosqich tasodifiy tanlanadi. */
export const allSectors: Sector[] = [
  ...baseSectors.map(s => ({ ...s, stages: [...s.stages, ...(extraStages[s.id] ?? [])] })),
  ...extraSectors,
];
