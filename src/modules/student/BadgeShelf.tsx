import { useMemo, useState } from 'react';
import { Award, Crosshair, Flame, Gamepad2, GraduationCap, Info, Lightbulb, Lock, Medal, Puzzle, Rocket, Star, TrendingUp, X, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui';
import { computeBadges, type AttemptLike, type Badge, type BadgeIcon } from './badges';
import { loadGameRecords } from './gameStats';

const icons: Record<BadgeIcon, LucideIcon> = {
  flame: Flame, award: Award, medal: Medal, star: Star, rocket: Rocket, crosshair: Crosshair,
  puzzle: Puzzle, lightbulb: Lightbulb, trending: TrendingUp, gamepad: Gamepad2, grad: GraduationCap,
};
const tierLabel = { bronze: 'Bronza', silver: 'Kumush', gold: 'Oltin' } as const;
const sources = {
  test: 'Serverda saqlangan test natijalaridan hisoblanadi.',
  game: 'Shu qurilmada o‘ynalgan o‘yinlardan hisoblanadi (boshqa qurilmada alohida yig‘iladi).',
} as const;
type Filter = 'all' | 'earned' | 'locked';

function Ring({ value, total }: { value: number; total: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 84 84" className="ach-ring" aria-hidden>
      <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="9" />
      <circle cx="42" cy="42" r={r} fill="none" stroke="#f3d36b" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={(c * value) / total + ' ' + c} transform="rotate(-90 42 42)" />
      <text x="42" y="47" textAnchor="middle" className="ach-ring__text">{value}/{total}</text>
    </svg>
  );
}

function BadgeCard({ b, index, open, onToggle }: { b: Badge; index: number; open: boolean; onToggle: () => void }) {
  const Icon = icons[b.icon];
  const percent = Math.round((100 * b.progress) / b.goal);
  return (
    <li className={'ach ach--' + b.tier + (b.earned ? ' is-earned' : ' is-locked') + (open ? ' is-open' : '')} style={{ animationDelay: index * 60 + 'ms' }}>
      <div className="ach__top">
        <span className="ach__medal">
          <Icon size={30} aria-hidden />
          {!b.earned && <span className="ach__lock"><Lock size={13} aria-hidden /></span>}
        </span>
        <span className="ach__tier">{tierLabel[b.tier]}</span>
        <button type="button" className="ach__info" aria-expanded={open} aria-label={b.title + ': qanday olinadi?'}
          title="Bu nishonni qanday olish mumkin?" onClick={onToggle}>
          {open ? <X size={16} aria-hidden /> : <Info size={16} aria-hidden />}
        </button>
      </div>
      <strong className="ach__title">{b.title}</strong>
      {open ? (
        <div className="ach__detail" role="region" aria-label={b.title + ' haqida'}>
          <p><b>Qanday olinadi:</b> {b.text}</p>
          <p><b>Holat:</b> {b.earned ? 'Olingan ✓' : b.progress + ' / ' + b.goal + ' (' + percent + '%)'}</p>
          <p className="ach__src">{sources[b.group]}</p>
        </div>
      ) : (
        <small className="ach__text">{b.text}</small>
      )}
      {b.earned
        ? <span className="ach__state">✓ {tierLabel[b.tier]} nishon olindi</span>
        : <span className="ach__prog"><i style={{ width: percent + '%' }} /><em>{b.progress} / {b.goal}</em></span>}
    </li>
  );
}

/** Talaba kabinetidagi nishonlar javoni: olingan va hali ochilmagan nishonlar. */
export function BadgeShelf({ userId, attempts, topics, loading }: {
  userId: string;
  attempts?: AttemptLike[];
  topics: Map<number, { total: number; correct: number }>;
  loading: boolean;
}) {
  const badges = useMemo(() => computeBadges(attempts, topics, loadGameRecords(userId)), [attempts, topics, userId]);
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const earned = badges.filter(b => b.earned).length;
  const next = badges.filter(b => !b.earned).sort((a, b) => b.progress / b.goal - a.progress / a.goal)[0];
  const shown = (group: 'test' | 'game') => badges.filter(b => b.group === group && (filter === 'all' || (filter === 'earned') === b.earned));
  const groups: { key: 'test' | 'game'; title: string }[] = [
    { key: 'test', title: 'Test nishonlari' },
    { key: 'game', title: 'O‘yin nishonlari' },
  ];
  const filters: [Filter, string, number][] = [
    ['all', 'Barchasi', badges.length], ['earned', 'Olingan', earned], ['locked', 'Ochilmagan', badges.length - earned],
  ];

  return (
    <Card title="Nishonlarim" subtitle={loading ? 'Natijalar yuklanmoqda…' : 'Muvaffaqiyatlaringiz to‘plami'} className="mt-5">
      <div className="ach-top">
        <Ring value={earned} total={badges.length} />
        <div className="ach-top__text">
          <strong>{earned} / {badges.length} nishon olingan</strong>
          {next
            ? <span>Eng yaqin nishon: <b>{next.title}</b> — {next.progress} / {next.goal}</span>
            : <span>Barcha nishonlar olingan. Tabriklaymiz!</span>}
        </div>
      </div>
      <div className="ach-filter" role="group" aria-label="Nishonlarni saralash">
        {filters.map(([key, label, count]) => (
          <button key={key} type="button" className={filter === key ? 'is-on' : ''} aria-pressed={filter === key} onClick={() => setFilter(key)}>
            {label} <span>{count}</span>
          </button>
        ))}
      </div>
      {groups.map(group => {
        const list = shown(group.key);
        return (
          <section key={group.key} className="ach-group">
            <h3>{group.title}</h3>
            <p className="small muted">{sources[group.key]}</p>
            {list.length === 0 ? <p className="ach-empty">Bu bo‘limda mos nishon yo‘q.</p> : (
              <ul className="achs">
                {list.map((b, i) => (
                  <BadgeCard key={b.id} b={b} index={i} open={openId === b.id} onToggle={() => setOpenId(openId === b.id ? null : b.id)} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </Card>
  );
}
