import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';

export function VisitReport() {
  const [totals, setTotals] = useState<{ visits: number; seconds: number }>();

  useEffect(() => {
    const key = 'econ-visit-id';
    const visit = sessionStorage.getItem(key) ?? crypto.randomUUID();
    sessionStorage.setItem(key, visit);
    let last = performance.now();
    let active = true;
    let wasVisible = !document.hidden;

    function report() {
      const now = performance.now();
      const seconds = wasVisible ? Math.min(30, Math.floor((now - last) / 1000)) : 0;
      last = now;
      wasVisible = !document.hidden;
      if (!seconds && document.hidden) return;
      void supabase.rpc('econ_visit_report', { visit, elapsed: seconds }).then(({ data }) => {
        if (active && data) setTotals(data);
      });
    }
    report();
    const timer = window.setInterval(report, 15_000);
    document.addEventListener('visibilitychange', report);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', report);
    };
  }, []);

  if (!totals) return null;
  const minutes = Math.floor(totals.seconds / 60);
  return (
    <div className="container visit-report" aria-label="Sayt statistikasi">
      <span><strong>{totals.visits.toLocaleString('uz')}</strong> ta tashrif</span>
      <span><strong>{Math.floor(minutes / 60)} soat {minutes % 60} daqiqa</strong> saytda o‘tkazildi</span>
    </div>
  );
}
