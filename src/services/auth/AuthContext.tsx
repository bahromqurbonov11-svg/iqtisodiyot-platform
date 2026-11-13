import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AuthProvider, SessionUser } from './auth.types';
import { demoAuthProvider, demoUsers } from './demo-auth.provider';

interface AuthValue {
  provider: AuthProvider;
  user: SessionUser | null;
  /** Faqat DEMO: interfeysni ma’lum rol sifatida ko‘rish */
  previewAs: (role: 'student' | 'admin') => void;
  exitPreview: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProviderRoot({ children, provider = demoAuthProvider }: { children: ReactNode; provider?: AuthProvider }) {
  const [user, setUser] = useState<SessionUser | null>(provider.getSession());
  const value = useMemo<AuthValue>(
    () => ({
      provider,
      user,
      previewAs: (role) => setUser(demoUsers[role]),
      exitPreview: () => setUser(null),
    }),
    [provider, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProviderRoot ichida ishlatilishi kerak');
  return ctx;
}
