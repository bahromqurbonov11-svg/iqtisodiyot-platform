import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Clock, Eye } from 'lucide-react';
import { supabase } from '@/services/supabase';

/**
 * SAYT STATISTIKASI: tashrif soni va saytda o‘tkazilgan umumiy vaqt.
 * Provayder butun ilovani o‘rab turadi (main.tsx), shuning uchun vaqt kabinet va admin panelda ham hisoblanadi.
 * Hisob faqat varaq ochiq turganda yuritiladi.
 */
export type SiteTotals = { visits: number; seconds: number };
const Totals = createContext<SiteTotals | undefined>(undefined);

export function SiteStatsProvider({ children }: { children: ReactNode }) {
  const [totals, setTotals] = useState<SiteTotals>();

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

  return <Totals.Provider value={totals}>{children}</Totals.Provider>;
}

export const useSiteStats = () => useContext(Totals);

export function formatSpent(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return Math.floor(minutes / 60) + ' soat ' + (minutes % 60) + ' daqiqa';
}

/** Bosh sahifadagi katta statistika kartalari */
export function SiteStatTiles() {
  const totals = useSiteStats();
  const hours = totals ? Math.floor(totals.seconds / 3600) : 0;
  const minutes = totals ? Math.floor((totals.seconds % 3600) / 60) : 0;
  return (
    <div className="site-stats" aria-label="Sayt statistikasi" aria-busy={!totals}>
      <div className="site-stat site-stat--visits">
        <span className="site-stat__icon"><Eye size={26} aria-hidden /></span>
        <div>
          <div className="site-stat__value">{totals ? totals.visits.toLocaleString('uz') : '—'}</div>
          <div className="site-stat__label">ta tashrif</div>
        </div>
      </div>
      <div className="site-stat site-stat--time">
        <span className="site-stat__icon"><Clock size={26} aria-hidden /></span>
        <div>
          <div className="site-stat__value">
            {totals ? <>{hours}<small> soat </small>{minutes}<small> daqiqa</small></> : '—'}
          </div>
          <div className="site-stat__label">saytda o‘tkazilgan vaqt</div>
        </div>
      </div>
    </div>
  );
}

/** Pastki qismdagi ixcham satr */
export function SiteStatsLine() {
  const totals = useSiteStats();
  if (!totals) return null;
  return (
    <div className="site-stats-line" aria-label="Sayt statistikasi">
      <span><Eye size={14} aria-hidden /> <strong>{totals.visits.toLocaleString('uz')}</strong> ta tashrif</span>
      <span><Clock size={14} aria-hidden /> <strong>{formatSpent(totals.seconds)}</strong> saytda o‘tkazildi</span>
    </div>
  );
}
