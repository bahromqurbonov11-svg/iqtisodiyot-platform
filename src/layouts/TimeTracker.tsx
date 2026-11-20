import { useEffect } from 'react';
import { useAuth } from '@/services/auth/AuthContext';
import { supabase } from '@/services/supabase';

/**
 * SODIQLIK NISHONI UCHUN FAOL VAQT HISOBI (faqat tizimga kirgan talaba uchun).
 * Soniya faqat varaq ochiq va oxirgi harakatdan 60 soniyadan kam o‘tgan bo‘lsa hisoblanadi.
 * Server har bir hisobotni yana real vaqt bilan cheklaydi (docs/loyalty-time.sql).
 */
const IDLE_MS = 60_000;

export function TimeTracker() {
  const { user } = useAuth();
  const id = user?.role === 'student' && !user.external ? user.id : undefined;

  useEffect(() => {
    if (!id) return;
    let lastActive = Date.now();
    let pending = 0;
    const touch = () => { lastActive = Date.now(); };
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart', 'wheel'] as const;
    for (const name of events) window.addEventListener(name, touch, { passive: true });

    const tick = window.setInterval(() => {
      if (!document.hidden && Date.now() - lastActive < IDLE_MS) pending += 1;
    }, 1000);

    function flush() {
      const seconds = Math.min(30, pending);
      if (seconds <= 0) return;
      pending -= seconds;
      void supabase.rpc('econ_time_report', { elapsed: seconds });
    }
    const send = window.setInterval(flush, 15_000);
    document.addEventListener('visibilitychange', flush);
    return () => {
      for (const name of events) window.removeEventListener(name, touch);
      window.clearInterval(tick);
      window.clearInterval(send);
      document.removeEventListener('visibilitychange', flush);
    };
  }, [id]);

  return null;
}
