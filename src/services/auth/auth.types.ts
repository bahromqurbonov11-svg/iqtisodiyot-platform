import type { AccountStatus, UserRole } from '@/models';

/**
 * AUTENTIFIKATSIYA INTEGRATSIYA QATLAMI
 * Interfeys sahifalari faqat shu shartnomaga tayanadi.
 * 3-bosqichda `ServerAuthProvider` (login-parol, server sessiyasi) yoziladi
 * va AuthContext ichida DemoAuthProvider bilan almashtiriladi.
 * Claude/ChatGPT akkaunti orqali kirishga bog‘lanmaydi.
 */
export interface SessionUser {
  id: string;
  fullName: string;
  role: UserRole;
  external?: boolean;
  status: AccountStatus;
  group?: string;
}

export interface RegisterInput {
  fullName: string;
  group: string;
  login: string;
  password: string;
}

export interface AuthProvider {
  readonly kind: 'demo' | 'server';
  getSession(): SessionUser | null;
  signIn(login: string, password: string): Promise<SessionUser>;
  register(input: RegisterInput): Promise<{ status: AccountStatus }>;
  signOut(): Promise<void>;
}
