import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, PageHeader } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { useAdminActivity } from './adminActivity';

export function AdminLearnersPage() {
  const { data, error } = useAdminActivity();
  const [group, setGroup] = useState('');
  const [query, setQuery] = useState('');
  const students = (data?.students ?? []).filter(student =>
    (!group || String(student.group_id) === group) && student.name.toLocaleLowerCase('uz').includes(query.trim().toLocaleLowerCase('uz')));
  return <>
    <PageHeader eyebrow="Administrator paneli" title="Talabalar va guruhlar" />
    <Card className="mt-5">
      {error && <p role="alert">Ro‘yxatni yuklab bo‘lmadi.</p>}
      {!data && !error && <p role="status">Ro‘yxat yuklanmoqda…</p>}
      {data && <div className="stack">
        <div className="admin-summary">
          <strong>{data.groups.length} ta guruh</strong><strong>{data.students.length} ta talaba</strong>
        </div>
        <label>Guruh<select className="search-control" value={group} onChange={e => setGroup(e.target.value)}>
          <option value="">Barcha guruhlar</option>
          {data.groups.map(g => <option key={g.id} value={g.id}>{g.name} ({data.students.filter(s => s.group_id === g.id).length})</option>)}
        </select></label>
        <label>Ism yoki familiya<input type="search" className="search-control" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <p>{students.length} ta talaba</p>
        {students.length > 0 && <ul className="admin-roster">
          {students.map(s => <li key={s.id}>
            <strong>{s.name || 'Ismi kiritilmagan'}</strong>
            <span>{data.groups.find(g => g.id === s.group_id)?.name ?? 'Guruh biriktirilmagan'}</span>
            <Link to={paths.analytics + '?talaba=' + s.id}>Natijalar</Link>
          </li>)}
        </ul>}
      </div>}
    </Card>
  </>;
}
