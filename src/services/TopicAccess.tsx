import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/services/auth/AuthContext';
import { supabase } from '@/services/supabase';

const TopicAccess = createContext({ maximum: null as number | null, failed: false,
  setMaximum: (_value: number) => {}, refresh: () => {} });

export function TopicAccessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const id = user?.id ?? 'guest';
  const [state, setState] = useState<{ id: string; maximum: number | null; failed: boolean }>();
  const request = useRef(0);
  const refresh = useCallback(() => {
    const current = ++request.current;
    void supabase.rpc('econ_topic_mastery_limit').then(({ data, error }) => {
      if (current !== request.current) return;
      setState({ id, maximum: typeof data === 'number' ? data : null, failed: Boolean(error) });
    });
  }, [id]);
  function setMaximum(maximum: number) {
    request.current += 1;
    setState({ id, maximum, failed: false });
  }
  useEffect(() => {
    refresh();
    const timer = window.setInterval(() => { if (!document.hidden) refresh(); }, 30000);
    window.addEventListener('focus', refresh);
    return () => {
      request.current += 1;
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);
  const current = state?.id === id ? state : undefined;
  return <TopicAccess.Provider value={{ maximum: current?.maximum ?? null, failed: current?.failed ?? false, setMaximum, refresh }}>
    {children}
  </TopicAccess.Provider>;
}

export function useTopicAccess() {
  const { user } = useAuth();
  const access = useContext(TopicAccess);
  return { ...access, allows: (order: number) => user?.role === 'admin' || (access.maximum !== null && order <= access.maximum) };
}

export function TopicAccessNotice({ pending, failed }: { pending?: boolean; failed?: boolean }) {
  return <div className="container page"><p role="status">
    {failed ? 'Mavzuga kirish holatini tekshirib bo‘lmadi.' : pending ? 'Mavzuga kirish holati tekshirilmoqda…' : 'Bu mavzu hali ochilmagan.'}
  </p></div>;
}
