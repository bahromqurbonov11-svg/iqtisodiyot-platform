import { useMemo, useState } from 'react';
import { Check, X, Ban, Search, RotateCcw } from 'lucide-react';
import { PageHeader, Card, Tabs, StatusBadge, DemoBadge, Notice } from '@/components/ui';
import { learnersService } from '@/services/analytics.service';
import type { AccountStatus, Learner } from '@/models';

type Filter = 'all' | AccountStatus;

/**
 * Talabalarni boshqarish: tasdiqlash / rad etish / bloklash.
 * DEMO: o‘zgarishlar faqat sahifa xotirasida, hech qayerga saqlanmaydi.
 * 3-bosqichda: PATCH /api/v1/admin/learners/:id/status
 */
export function AdminLearnersPage() {
  const [rows, setRows] = useState<Learner[]>(learnersService.list().data);
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [touched, setTouched] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    rows.forEach((r) => (c[r.status] = (c[r.status] ?? 0) + 1));
    return c;
  }, [rows]);

  const list = rows.filter(
    (r) => (filter === 'all' || r.status === filter) && (!q || r.fullName.toLowerCase().includes(q.toLowerCase()) || r.group.toLowerCase().includes(q.toLowerCase())),
  );

  const setStatus = (id: string, status: AccountStatus) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    setTouched(true);
  };

  return (
    <>
      <PageHeader eyebrow="Administrator paneli" title="Talabalar" description="Ro‘yxatdan o‘tgan talabalar va akkaunt holatlarini boshqarish." badges={<DemoBadge />} />
      {touched && (
        <Notice kind="demo" title="O‘zgarish saqlanmadi">
          Demo rejim: holat faqat shu sahifada o‘zgardi. Sahifa yangilansa, avvalgi holat qaytadi.
        </Notice>
      )}
      <div className="toolbar mt-4">
        <Tabs
          ariaLabel="Holat bo‘yicha"
          value={filter}
          onChange={setFilter}
          items={[
            { value: 'all', label: 'Barchasi', count: counts.all },
            { value: 'pending', label: 'Kutilmoqda', count: counts.pending ?? 0 },
            { value: 'approved', label: 'Tasdiqlangan', count: counts.approved ?? 0 },
            { value: 'rejected', label: 'Rad etilgan', count: counts.rejected ?? 0 },
            { value: 'blocked', label: 'Bloklangan', count: counts.blocked ?? 0 },
          ]}
        />
        <label className="search">
          <Search size={16} aria-hidden />
          <span className="sr-only">Qidirish</span>
          <input type="search" placeholder="Ism yoki guruh…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      <Card padded={false} className="mt-4">
        <div className="table-wrap table-wrap--flush">
          <table className="table">
            <thead>
              <tr>
                <th>Talaba</th>
                <th>Guruh</th>
                <th>Ro‘yxatdan o‘tgan</th>
                <th>Oxirgi faollik</th>
                <th>Holat</th>
                <th className="right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="person">
                      <span className="avatar avatar--sm">{r.fullName.split(' ').map((p) => p[0]).join('')}</span>
                      <div><strong>{r.fullName}</strong><small className="muted mono">{r.id}</small></div>
                    </div>
                  </td>
                  <td>{r.group}</td>
                  <td>{r.registeredAt}</td>
                  <td>{r.status === 'approved' ? r.lastActiveAt : '—'}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="right">
                    <div className="row-actions">
                      {r.status === 'pending' && (
                        <>
                          <button className="chip-btn chip-btn--success" onClick={() => setStatus(r.id, 'approved')}><Check size={14} /> Tasdiqlash</button>
                          <button className="chip-btn chip-btn--danger" onClick={() => setStatus(r.id, 'rejected')}><X size={14} /> Rad etish</button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <button className="chip-btn" onClick={() => setStatus(r.id, 'blocked')}><Ban size={14} /> Bloklash</button>
                      )}
                      {(r.status === 'rejected' || r.status === 'blocked') && (
                        <button className="chip-btn" onClick={() => setStatus(r.id, 'pending')}><RotateCcw size={14} /> Qayta ko‘rish</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!list.length && (
                <tr><td colSpan={6} className="center muted">Mos talaba topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
