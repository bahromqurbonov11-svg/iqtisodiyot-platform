import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/services/auth/AuthContext';
import { supabase } from '@/services/supabase';

const TopicAccess = createContext({ maximum: null as number | null, failed: false, setMaximum: (_value: number) => {} });

export function TopicAccessProvider({ children }: { children: ReactNode }) {
  const [maximum, setMaximum] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    async function refresh() {
      const { data, error } = await supabase.rpc('econ_public_topic_limit');
      if (!active) return;
      setFailed(Boolean(error));
      setMaximum(typeof data === 'number' ? data : null);
    }
    void refresh();
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  return <TopicAccess.Provider value={{ maximum, failed, setMaximum }}>{children}</TopicAccess.Provider>;
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
