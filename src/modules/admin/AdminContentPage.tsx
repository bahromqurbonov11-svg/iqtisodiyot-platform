import { Link } from 'react-router-dom';
import { BookOpen, ClipboardCheck, Gamepad2, Upload } from 'lucide-react';
import { PageHeader, Card, Badge, StageNotice, Button } from '@/components/ui';
import { catalogService } from '@/services/catalog.service';
import { games } from '@/data/games';
import { paths } from '@/navigation/paths';

export function AdminContentPage() {
  const topics = catalogService.getTopics().data;
  return (
    <>
      <PageHeader
        eyebrow="Administrator paneli"
        title="Kontent boshqaruvi"
        description="Mavzular, materiallar, test savollari va o‘yinlar holati."
        actions={<Button disabled icon={<Upload size={16} />} title="2-bosqichda">Material yuklash</Button>}
      />
      <StageNotice stage={2}>Material yuklash va tahrirlash hali ishlamaydi. Quyidagi jadval kontent qayerda tayyor, qayerda bo‘sh ekanini ko‘rsatadi.</StageNotice>

      <div className="stats mt-5">
        <div className="stat"><div className="stat__top"><span className="stat__label">Mavzular</span><BookOpen size={18} /></div><div className="stat__value">25</div><div className="stat__hint">Sillabusdan yuklangan</div></div>
        <div className="stat stat--neutral"><div className="stat__top"><span className="stat__label">Test savollari</span><ClipboardCheck size={18} /></div><div className="stat__value">0</div><div className="stat__hint">4-bosqichda</div></div>
        <div className="stat stat--neutral"><div className="stat__top"><span className="stat__label">Faol o‘yinlar</span><Gamepad2 size={18} /></div><div className="stat__value">0/{games.length}</div><div className="stat__hint">5-bosqichdan</div></div>
      </div>

      <Card padded={false} className="mt-5">
        <div className="table-wrap table-wrap--flush">
          <table className="table">
            <thead>
              <tr><th>№</th><th>Mavzu</th><th>Tuzilma</th><th>Materiallar</th><th>Tushunchalar</th><th>Test</th></tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t.id}>
                  <td className="muted">{t.globalOrder}</td>
                  <td><Link to={paths.topic(t.id)} className="link">{t.title}</Link></td>
                  <td><Badge tone="success">Tayyor</Badge></td>
                  <td><Badge>Bo‘sh</Badge></td>
                  <td><Badge>Bo‘sh</Badge></td>
                  <td><Badge>Bo‘sh</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
