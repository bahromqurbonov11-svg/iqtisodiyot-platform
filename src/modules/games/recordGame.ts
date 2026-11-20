import { supabase } from '@/services/supabase';
import { useAuth } from '@/services/auth/AuthContext';
import { saveGameRecord } from '@/modules/student/gameStats';

export function useRecordGame() {
  const { user } = useAuth();
  return (game: 'matching' | 'situation' | 'graph' | 'target-answer', topic: number, answers: { question: string; correct: boolean }[]) => {
    if (user?.role !== 'student' || user.external || !answers.length) return;
    if (game !== 'target-answer') saveGameRecord(user.id, { game, score: answers.filter(answer => answer.correct).length, total: answers.length });
    void supabase.rpc('econ_record_game', {
      event_id: crypto.randomUUID(), game_type: game, topic_number: topic,
      score: answers.filter(answer => answer.correct).length, answers,
    }).then(({ error }) => { if (error) console.warn('O‘yin natijasi saqlanmadi', error.code); });
  };
}
