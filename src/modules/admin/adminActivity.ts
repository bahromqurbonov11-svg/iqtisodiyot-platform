import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';

export type Group = { id: number; name: string };
export type Learner = { id: string; name: string; group_id: number | null };
export type GameAnswer = { question: string; correct: boolean; topic?: number | null };
export type GameActivity = {
  id: string; player: string; game: string; topic: number | null; points: number;
  items: GameAnswer[] | null; played_at: string;
};
type Activity = { groups: Group[]; students: Learner[]; games: GameActivity[] };

export function useAdminActivity(enabled = true) {
  const [data, setData] = useState<Activity>();
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let inFlight = false;
    async function refresh() {
      if (document.hidden || inFlight) return;
      inFlight = true;
      const result = await supabase.rpc('econ_admin_activity');
      inFlight = false;
      if (!active) return;
      setError(Boolean(result.error));
      if (!result.error) setData(result.data);
    }
    void refresh();
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [enabled]);
  return { data, error };
}
