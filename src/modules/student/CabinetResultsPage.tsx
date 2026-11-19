import { useEffect, useState } from 'react';
import { Button, Card, PageHeader } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { catalogService } from '@/services/catalog.service';
import { supabase } from '@/services/supabase';

interface Result {
  attempt_id: string;
  student: string;
  taken_at: string;
  points: number;
  total: number;
  test_scope: number | null;
}

export function CabinetResultsPage({ admin = false }: { admin?: boolean }) {
  const [results, setResults] = useState<Result[]>();
  const [failed, setFailed] = useState(false);
  const topics = catalogService.getTopics().data;

  useEffect(() => {
    let active = true;
    void supabase.rpc('econ_test_results').then(({ data, error }) => {
      if (!active) return;
      if (error) setFailed(true);
      else setResults(data ?? []);
    });
    return () => { active = false; };
  }, []);

  return (
    <>
      <PageHeader title={admin ? 'Talabalar natijalari' : 'Mening natijalarim'} />
      <Card title="Topshirilgan testlar" className="mt-5">
        {failed && <p role="alert">Natijalarni yuklab bo‘lmadi.</p>}
        {!results && !failed && <p role="status">Natijalar yuklanmoqda…</p>}
        {results?.length === 0 && <p>Hozircha topshirilgan testlar yo‘q.</p>}
        <div className="stack">
          {results?.map(result => {
            const mode = result.test_scope === -1 ? '1-semestr' : result.test_scope === -2 ? '2-semestr' :
              topics.find(topic => topic.globalOrder === result.test_scope)?.title ?? 'Test';
            return (
              <div key={result.attempt_id} className="card card--pad">
                <strong>{admin ? result.student + ' · ' : ''}{mode}</strong>
                <div>{result.points} / {result.total} · {Math.round(100 * result.points / result.total)}%</div>
                <small>{new Date(result.taken_at).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}</small>
              </div>
            );
          })}
        </div>
        {!admin && <Button to={paths.tests} className="mt-3">Testlarga o‘tish</Button>}
      </Card>
    </>
  );
}
