import type { AuthProvider, SessionUser } from './auth.types';
import { demoCurrentLearner } from '@/data/demo/learners';

/**
 * DEMO provayder: haqiqiy kirish YO‘Q.
 * signIn/register aniq xato qaytaradi. Faqat "ko‘rish rejimi" mavjud:
 * foydalanuvchi talaba yoki administrator interfeysini ko‘rib chiqishi mumkin.
 */
export class AuthNotAvailableError extends Error {
  constructor() {
    super('Haqiqiy kirish va ro‘yxatdan o‘tish 3-bosqichda ishga tushiriladi.');
    this.name = 'AuthNotAvailableError';
  }
}

export const demoUsers: Record<'student' | 'admin', SessionUser> = {
  student: {
    id: demoCurrentLearner.id,
    fullName: demoCurrentLearner.fullName,
    role: 'student',
    status: 'approved',
    group: demoCurrentLearner.group,
  },
  admin: { id: 'adm-demo-001', fullName: 'Fan administratori', role: 'admin', status: 'approved' },
};

export const demoAuthProvider: AuthProvider = {
  kind: 'demo',
  getSession: () => null,
  async signIn() {
    throw new AuthNotAvailableError();
  },
  async register() {
    throw new AuthNotAvailableError();
  },
  async signOut() {},
};
