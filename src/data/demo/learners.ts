import type { Learner, AccountStatus } from '@/models';
import { appConfig } from '@/config/app.config';
import { seeded } from './random';

/**
 * DEMO talabalar. Ismlar to‘qima — haqiqiy shaxslarga tegishli emas.
 */
const first = ['Aziz', 'Dilnoza', 'Jasur', 'Madina', 'Sardor', 'Nilufar', 'Bekzod', 'Gulnora', 'Otabek', 'Shahnoza', 'Timur', 'Zarina', 'Ulug‘bek', 'Feruza', 'Rustam', 'Kamola', 'Javohir', 'Sevara', 'Doston', 'Malika', 'Akmal', 'Lola', 'Sherzod', 'Nodira'];
const last = ['Karimov', 'Rahimova', 'Tursunov', 'Yusupova', 'Aliyev', 'Saidova', 'Ergashev', 'Nazarova', 'Qodirov', 'Hamidova', 'Mirzayev', 'Usmonova'];
const groups = ['ST-11', 'ST-12', 'BH-11'];

const rand = seeded(42);
const statusPool: AccountStatus[] = ['approved', 'approved', 'approved', 'approved', 'approved', 'approved', 'pending', 'approved', 'rejected', 'approved', 'blocked', 'pending'];

export const demoLearners: Learner[] = first.map((f, i) => {
  const surname = last[Math.floor(rand() * last.length)];
  const female = /a$|oz$|ra$/.test(f) || ['Gulnora', 'Nilufar', 'Shahnoza', 'Feruza', 'Kamola', 'Sevara', 'Malika', 'Lola', 'Nodira', 'Dilnoza', 'Madina', 'Zarina'].includes(f);
  const name = female && !surname.endsWith('a') ? surname + 'a' : !female && surname.endsWith('a') ? surname.slice(0, -1) : surname;
  const day = 1 + Math.floor(rand() * 28);
  return {
    id: `lrn-demo-${String(i + 1).padStart(3, '0')}`,
    organizationId: appConfig.organization.id,
    fullName: `${name} ${f}`,
    group: groups[i % groups.length],
    status: statusPool[i % statusPool.length],
    registeredAt: `2026-09-${String(day).padStart(2, '0')}`,
    lastActiveAt: `2026-11-${String(1 + Math.floor(rand() * 12)).padStart(2, '0')}`,
  };
});

export const demoGroups = groups;

/** Kabinetda ko‘rsatiladigan demo talaba */
export const demoCurrentLearner = demoLearners[0];
