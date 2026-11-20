import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui';
import { supabase } from '@/services/supabase';
import { computeBadges, type AttemptLike } from '@/modules/student/badges';
import { useLoyalty, spent } from '@/modules/student/loyalty';

type Row = AttemptLike & { student_id: string; student: string; group_name: string | null };

/** Administrator uchun: kim qaysi test nishonlarini olgan (serverdagi test natijalaridan hisoblanadi). */
export function AdminBadgesCard() {
  const [rows, setRows] = useState<Row[]>();
  const [error, setError] = useState(false);
  const loyalty = useLoyalty(true);
  useEffect(() => {
    let active = true;
    void supabase.rpc('econ_analytics').then(({ data, error: e }) => {
      if (!active) return;
      if (e) setError(true); else setRows((data ?? []) as Row[]);
    });
    return () => { active = false; };
  }, []);

  const people = useMemo(() => {
    const byStudent = new Map<string, Row[]>();
    for (const row of rows ?? []) byStudent.set(row.student_id, [...(byStudent.get(row.student_id) ?? []), row]);
    return [...byStudent.values()].map(list => {
      const earned = computeBadges(list, new Map(), []).filter(b => b.group === 'test' && b.earned);
      return { id: list[0].student_id, name: list[0].student || 'Ismi kiritilmagan', group: list[0].group_name, tests: list.length, earned };
    }).sort((a, b) => b.earned.length - a.earned.length || a.name.localeCompare(b.name, 'uz'));
  }, [rows]);

  const holder = loyalty?.top?.[0] && loyalty.top[0].seconds >= loyalty.min_seconds ? loyalty.top[0] : undefined;
  return <Card title="Talabalar nishonlari" subtitle="Test nishonlari serverdagi natijalardan hisoblanadi" className="mt-5">
    {error && <p role="alert">Natijalarni yuklab bo‘lmadi.</p>}
    {!rows && !error && <p role="status">Yuklanmoqda…</p>}
    {rows && <div className="stack">
      <p className="small muted">O‘yin nishonlari (Mergan, Kema kapitani va boshqalar) har bir talabaning o‘z qurilmasida saqlanadi, shuning uchun bu yerda ko‘rinmaydi.
        Test topshirmagan talabalar ro‘yxatda yo‘q.</p>
      <p><strong>Sodiqlik nishoni:</strong> {holder ? holder.name + ' (' + spent(holder.seconds) + ')' : 'hozircha hech kimda yo‘q'}</p>
      <ul className="admin-roster">
        {people.map(p => <li key={p.id}>
          <strong>{p.name}</strong>
          <span>{p.group ?? 'Guruhsiz'} · {p.tests} ta test</span>
          <span>{p.earned.length ? p.earned.map(b => b.title).join(', ') : 'Hali nishon yo‘q'}</span>
        </li>)}
      </ul>
    </div>}
  </Card>;
}
