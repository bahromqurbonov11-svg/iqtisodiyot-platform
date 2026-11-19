
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AuthProvider, SessionUser } from './auth.types';
import {
  supabaseAuthProvider,
  restoreSupabaseSession,
} from './supabase-auth.provider';
import { supabase } from '../supabase';

interface AuthValue {
  provider: AuthProvider;
  user: SessionUser | null;
  ready: boolean;
  exitPreview: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProviderRoot({
  children,
  provider = supabaseAuthProvider,
}: {
  children: ReactNode;
  provider?: AuthProvider;
}) {
  const [user, setUser] = useState<SessionUser | null>(
    provider.getSession()
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const sessionUser = await restoreSupabaseSession();

      if (active) {
        setUser(sessionUser);
        setReady(true);
      }
    }

    void restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        }

        if (event === 'SIGNED_IN') {
          void restoreSupabaseSession().then((sessionUser) => {
            if (active) {
              setUser(sessionUser);
            }
          });
        }
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      provider,
      user,
      ready,

      exitPreview: () => {
        setUser(null);
        void provider.signOut();
      },
    }),
    [provider, user, ready]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth AuthProviderRoot ichida ishlatilishi kerak'
    );
  }

  return ctx;
}
