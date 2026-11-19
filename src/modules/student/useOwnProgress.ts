import { useEffect, useState } from 'react';
import { useAuth } from '@/services/auth/AuthContext';
import { supabase } from '@/services/supabase';

type Attempt = { points: number; total: number; test_scope: number | null; taken_at: string; items?: { topic: number | null; correct: boolean }[] | null };

export function useOwnProgress() {
  const { user } = useAuth();
  const id = user?.role === 'student' && !user.external ? user.id : undefined;
  const [result, setResult] = useState<{ id: string; attempts?: Attempt[]; error?: boolean }>();
  useEffect(() => {
    if (!id) return;
    let active = true;
    void supabase.rpc('econ_analytics').then(({ data, error }) => {
      if (active) setResult(error ? { id, error: true } : { id, attempts: data ?? [] });
    });
    return () => { active = false; };
  }, [id]);
  const attempts = result?.id === id ? result?.attempts : undefined;
  const topics = new Map<number, { total: number; correct: number }>();
  for (const attempt of attempts ?? []) {
    const add = (topic: number, total: number, correct: number) => {
      const old = topics.get(topic) ?? { total: 0, correct: 0 };
      topics.set(topic, { total: old.total + total, correct: old.correct + correct });
    };
    if (attempt.items?.length) {
      for (const item of attempt.items) if (item.topic) add(item.topic, 1, Number(item.correct));
    } else if (attempt.test_scope && attempt.test_scope > 0) add(attempt.test_scope, attempt.total, attempt.points);
  }
  return { attempts, topics, loading: Boolean(id && result?.id !== id), error: result?.id === id && result?.error };
}

export function mastery(correct: number, total: number) {
  const percent = total > 0 ? Math.round(100 * correct / total) : 0;
  const label = percent >= 80 ? 'O‘zlashtirilgan' : percent >= 60 ? 'Mashq kerak' : 'Bo‘shliq';
  return { percent, label, tone: percent >= 80 ? 'success' : percent >= 60 ? 'warning' : 'danger' } as const;
}
