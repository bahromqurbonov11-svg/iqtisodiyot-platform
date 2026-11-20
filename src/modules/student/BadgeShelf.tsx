import { useMemo } from 'react';
import { Award, Crosshair, Flame, Gamepad2, GraduationCap, Lightbulb, Lock, Medal, Puzzle, Rocket, Star, TrendingUp, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui';
import { computeBadges, type AttemptLike, type BadgeIcon } from './badges';
import { loadGameRecords } from './gameStats';

const icons: Record<BadgeIcon, LucideIcon> = {
  flame: Flame, award: Award, medal: Medal, star: Star, rocket: Rocket, crosshair: Crosshair,
  puzzle: Puzzle, lightbulb: Lightbulb, trending: TrendingUp, gamepad: Gamepad2, grad: GraduationCap,
};
const tierLabel = { bronze: 'Bronza', silver: 'Kumush', gold: 'Oltin' } as const;

/** Talaba kabinetidagi nishonlar javoni: olingan va hali ochilmagan nishonlar. */
export function BadgeShelf({ userId, attempts, topics, loading }: {
  userId: string;
  attempts?: AttemptLike[];
  topics: Map<number, { total: number; correct: number }>;
  loading: boolean;
}) {
  const badges = useMemo(() => computeBadges(attempts, topics, loadGameRecords(userId)), [attempts, topics, userId]);
  const earned = badges.filter(b => b.earned).length;
  const groups: { key: 'test' | 'game'; title: string; note: string }[] = [
    { key: 'test', title: 'Test nishonlari', note: 'Serverda saqlangan test natijalaridan hisoblanadi.' },
    { key: 'game', title: 'O‘yin nishonlari', note: 'Shu qurilmada o‘ynalgan o‘yinlardan hisoblanadi (boshqa qurilmada alohida yig‘iladi).' },
  ];
  return (
    <Card title="Nishonlarim" subtitle={loading ? 'Natijalar yuklanmoqda…' : earned + ' / ' + badges.length + ' nishon olingan'} className="mt-5">
      <div className="badge-meter" aria-hidden><i style={{ width: (100 * earned / badges.length) + '%' }} /></div>
      {groups.map(group => (
        <section key={group.key} className="badge-group">
          <h3>{group.title}</h3>
          <p className="small muted">{group.note}</p>
          <ul className="badges">
            {badges.filter(b => b.group === group.key).map((b, i) => {
              const Icon = icons[b.icon];
              return (
                <li key={b.id} className={'badge badge--' + b.tier + (b.earned ? ' is-earned' : ' is-locked')} style={{ animationDelay: i * 70 + 'ms' }}>
                  <span className="badge__medal">
                    <Icon size={30} aria-hidden />
                    {!b.earned && <span className="badge__lock"><Lock size={13} aria-hidden /></span>}
                  </span>
                  <strong>{b.title}</strong>
                  <small>{b.text}</small>
                  {b.earned
                    ? <span className="badge__state">✓ {tierLabel[b.tier]} nishon olindi</span>
                    : <span className="badge__prog"><i style={{ width: (100 * b.progress / b.goal) + '%' }} /><em>{b.progress} / {b.goal}</em></span>}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Card>
  );
}
