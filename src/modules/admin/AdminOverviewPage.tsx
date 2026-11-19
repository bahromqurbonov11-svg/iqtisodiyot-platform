import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader, Card, Button } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { appConfig } from '@/config/app.config';
import { catalogService } from '@/services/catalog.service';
import { supabase } from '@/services/supabase';
import { SiteStatTiles } from '@/layouts/VisitReport';

export function AdminOverviewPage() {
  const [limit, setLimit] = useState<number>();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void supabase.rpc('econ_runner_topic_limit').then(({ data, error }) => {
      if (error) setMessage('O‘yin sozlamalarini yuklab bo‘lmadi.');
      else setLimit(data);
    });
  }, []);

  async function saveLimit() {
    if (limit === undefined) return;
    setSaving(true);
    const { error } = await supabase.rpc('econ_runner_topic_limit', { maximum: limit });
    setSaving(false);
    setMessage(error ? 'Chegarani saqlab bo‘lmadi.' : 'Chegara saqlandi.');
  }
  return (
    <>
      <PageHeader
        eyebrow="Administrator paneli"
        title="Umumiy ko‘rinish"
        description={`${appConfig.subject.name} · ${appConfig.subject.code}`}
        actions={<Button to={paths.analytics} iconRight={<ArrowRight size={16} />}>Analitika</Button>}
      />

      <Card title="Marraga yugurish va Mergan · Savollar" className="mt-5">
        <div className="stack">
          <label htmlFor="runner-topic-limit">Savol chiqadigan oxirgi mavzu</label>
          <select id="runner-topic-limit" className="search-control" value={limit ?? ''} disabled={limit === undefined || saving}
            onChange={event => setLimit(Number(event.target.value))}>
            {limit === undefined && <option value="">Yuklanmoqda…</option>}
            {catalogService.getTopics().data.map(topic => (
              <option key={topic.id} value={topic.globalOrder}>{topic.globalOrder}. {topic.title}</option>
            ))}
          </select>
          <Button disabled={limit === undefined || saving} onClick={() => void saveLimit()}>Chegarani saqlash</Button>
          {message && <p role="status">{message}</p>}
        </div>
      </Card>
      <Card title="Sayt statistikasi" subtitle="Barcha tashriflar va saytda o‘tkazilgan vaqt" className="mt-5">
        <SiteStatTiles />
      </Card>

      <Card title="Tezkor o‘tish" className="mt-5">
        <div className="presentation-actions">
          <Button to={paths.analytics} variant="secondary">Natijalar va analitika</Button>
          <Button to={paths.topics} variant="secondary">Mavzular</Button>
          <Button to={paths.games} variant="secondary">O‘yinlar</Button>
        </div>
      </Card>
    </>
  );
}
