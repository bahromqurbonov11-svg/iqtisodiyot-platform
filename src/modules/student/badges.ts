import type { GameKey, GameRecord } from './gameStats';

export type BadgeIcon = 'flame' | 'award' | 'medal' | 'star' | 'rocket' | 'crosshair' | 'puzzle' | 'lightbulb' | 'trending' | 'gamepad' | 'grad' | 'crown' | 'shield' | 'gem';
export interface Badge {
  id: string;
  group: 'test' | 'game';
  title: string;
  text: string;
  tier: 'bronze' | 'silver' | 'gold' | 'legend';
  icon: BadgeIcon;
  earned: boolean;
  progress: number;
  goal: number;
}

export interface AttemptLike { points: number; total: number; test_scope: number | null; taken_at: string }

/** Mavzulashtirilgan (test_scope > 0) testlar ketma-ketligidagi eng uzun va joriy "bexato" seriya. */
export function flawlessStreak(attempts: AttemptLike[]) {
  const topic = attempts.filter(a => a.test_scope && a.test_scope > 0 && a.total > 0)
    .sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime());
  let best = 0;
  let run = 0;
  for (const attempt of topic) {
    run = attempt.points === attempt.total ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return { best, current: run };
}

const PART1 = Array.from({ length: 12 }, (_, i) => i + 1);
const PART2 = Array.from({ length: 13 }, (_, i) => i + 13);

const best = (records: GameRecord[], game: GameKey) => Math.max(0, ...records.filter(r => r.game === game).map(r => r.score));
const sum = (records: GameRecord[], game: GameKey) => records.filter(r => r.game === game).reduce((s, r) => s + r.score, 0);

export function computeBadges(
  attempts: AttemptLike[] | undefined,
  topics: Map<number, { total: number; correct: number }>,
  games: GameRecord[],
): Badge[] {
  const list = attempts ?? [];
  const streak = flawlessStreak(list);
  const perfect = list.filter(a => a.total > 0 && a.points === a.total).length;
  const masteredTopics = [...topics.values()].filter(t => t.total >= 5 && t.correct / t.total >= 0.8).length;
  const firm = (part: number[]) => part.filter(n => { const t = topics.get(n); return Boolean(t && t.total >= 5 && t.correct / t.total >= 0.9); }).length;
  const flawlessTopics = (part: number[]) => part.filter(n => list.some(a => a.test_scope === n && a.total > 0 && a.points === a.total)).length;
  const firm1 = firm(PART1);
  const firm2 = firm(PART2);
  const played = new Set(games.map(g => g.game).filter(g => g !== 'graphwin')).size;
  const mk = (b: Omit<Badge, 'earned'>): Badge => ({ ...b, earned: b.progress >= b.goal });

  return [
    mk({ id: 'first-test', group: 'test', title: 'Birinchi qadam', text: 'Birinchi testni topshiring.', tier: 'bronze', icon: 'star', progress: Math.min(list.length, 1), goal: 1 }),
    mk({ id: 'perfect', group: 'test', title: 'Bexato test', text: 'Bitta testni xatosiz yeching.', tier: 'bronze', icon: 'award', progress: Math.min(perfect, 1), goal: 1 }),
    mk({ id: 'streak3', group: 'test', title: 'Ketma-ket 3 ta bexato', text: 'Ketma-ket 3 ta mavzulashtirilgan testni xatosiz yeching.', tier: 'silver', icon: 'flame', progress: Math.min(streak.best, 3), goal: 3 }),
    mk({ id: 'streak5', group: 'test', title: 'Ketma-ket 5 ta bexato', text: 'Ketma-ket 5 ta mavzulashtirilgan testni xatosiz yeching.', tier: 'gold', icon: 'flame', progress: Math.min(streak.best, 5), goal: 5 }),
    mk({ id: 'master1', group: 'test', title: 'Mavzu ustasi', text: 'Bitta mavzuda kamida 5 ta javob bilan 80% natija ko‘rsating.', tier: 'silver', icon: 'grad', progress: Math.min(masteredTopics, 1), goal: 1 }),
    mk({ id: 'master5', group: 'test', title: 'Keng bilimdon', text: '5 ta mavzuda 80% va undan yuqori natija ko‘rsating.', tier: 'gold', icon: 'medal', progress: Math.min(masteredTopics, 5), goal: 5 }),

    mk({ id: 'firm1', group: 'test', title: 'Qat‘iyatli: 1-qism', text: 'Iqtisodiyot nazariyasi 1 ning barcha 12 ta mavzusida kamida 5 ta javob bilan 90% dan yuqori natija ko‘rsating.', tier: 'gold', icon: 'shield', progress: firm1, goal: 12 }),
    mk({ id: 'firm2', group: 'test', title: 'Qat‘iyatli: 2-qism', text: 'Iqtisodiyot nazariyasi 2 ning barcha 13 ta mavzusida kamida 5 ta javob bilan 90% dan yuqori natija ko‘rsating.', tier: 'gold', icon: 'shield', progress: firm2, goal: 13 }),
    mk({ id: 'firm-all', group: 'test', title: 'Qat‘iyatli: butun kurs', text: 'Ikkala qism bo‘yicha ham “Qat‘iyatli” nishonini oling: barcha 25 ta mavzuda 90% dan yuqori natija.', tier: 'legend', icon: 'crown', progress: firm1 + firm2, goal: 25 }),
    mk({ id: 'flawless1', group: 'test', title: 'Benuqson: 1-qism', text: '1-qismning har bir mavzusi bo‘yicha kamida bitta testni xatosiz yeching (12 ta mavzu).', tier: 'legend', icon: 'gem', progress: flawlessTopics(PART1), goal: 12 }),
    mk({ id: 'flawless2', group: 'test', title: 'Benuqson: 2-qism', text: '2-qismning har bir mavzusi bo‘yicha kamida bitta testni xatosiz yeching (13 ta mavzu).', tier: 'legend', icon: 'gem', progress: flawlessTopics(PART2), goal: 13 }),

    mk({ id: 'mergan', group: 'game', title: 'Mergan', text: 'Mergan o‘yinida bir raundda kamida 50 ball to‘plang.', tier: 'silver', icon: 'crosshair', progress: Math.min(best(games, 'target'), 50), goal: 50 }),
    mk({ id: 'mergan-gold', group: 'game', title: 'Oltin mergan', text: 'Mergan o‘yinida bir raundda kamida 100 ball to‘plang.', tier: 'gold', icon: 'crosshair', progress: Math.min(best(games, 'target'), 100), goal: 100 }),
    mk({ id: 'pilot', group: 'game', title: 'Eng zo‘r haydovchi', text: 'Uchar kemada kamida 10 ta to‘siqdan o‘ting.', tier: 'silver', icon: 'rocket', progress: Math.min(best(games, 'runner'), 10), goal: 10 }),
    mk({ id: 'pilot-gold', group: 'game', title: 'Kema kapitani', text: 'Uchar kemada kamida 25 ta to‘siqdan o‘ting.', tier: 'gold', icon: 'rocket', progress: Math.min(best(games, 'runner'), 25), goal: 25 }),
    mk({ id: 'matcher', group: 'game', title: 'Tushuncha ustasi', text: 'Moslashtirish o‘yinida jami 5 ta to‘g‘ri javob bering.', tier: 'bronze', icon: 'puzzle', progress: Math.min(sum(games, 'matching'), 5), goal: 5 }),
    mk({ id: 'strategist', group: 'game', title: 'Strateg', text: 'Vaziyatli qaror o‘yinida jami 5 ta to‘g‘ri javob bering.', tier: 'bronze', icon: 'lightbulb', progress: Math.min(sum(games, 'situation'), 5), goal: 5 }),
    mk({ id: 'grapher', group: 'game', title: 'Grafik ustasi', text: 'Grafikni boshqar o‘yinida jami 5 ta to‘g‘ri javob bering.', tier: 'bronze', icon: 'trending', progress: Math.min(sum(games, 'graph'), 5), goal: 5 }),
    mk({ id: 'grand-graph', group: 'game', title: 'Grafik grossmeysteri', text: 'Sayt bo‘yicha eng qiyin topshiriq: Grafikni boshqar o‘yinida tasodifiy 10 ta murakkab savolni bitta ham xatosiz va vaqtida yeching.', tier: 'legend', icon: 'crown', progress: Math.min(sum(games, 'graphwin'), 1), goal: 1 }),
    mk({ id: 'all-games', group: 'game', title: 'Barcha o‘yinlar', text: 'Beshta o‘yinning har birini kamida bir marta o‘ynang.', tier: 'gold', icon: 'gamepad', progress: Math.min(played, 5), goal: 5 }),
  ];
}
