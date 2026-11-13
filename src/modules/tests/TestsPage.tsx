import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Target, Gauge, ListChecks, ArrowRight } from 'lucide-react';
import { PageHeader, Card, Badge, StageNotice, Tabs } from '@/components/ui';
import { testCatalog } from '@/data/demo/tests';
import { catalogService } from '@/services/catalog.service';
import { paths } from '@/navigation/paths';

export function TestsPage() {
  const subject = catalogService.getSubject().data;
  const [partId, setPartId] = useState<string>('all');
  const topics = catalogService.getTopics().data;
  const list = testCatalog.filter((t) => partId === 'all' || topics.find((x) => x.id === t.topicId)?.partId === partId);

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Bosh sahifa', to: paths.home }, { label: 'Diagnostik testlar' }]}
        eyebrow="Diagnostik testlar"
        title="Bilimni tushuncha darajasida tekshirish"
        description="Testlar faqat ball hisoblash uchun emas: har bir noto‘g‘ri javob aniq qaysi tushuncha chalkashtirilganini ko‘rsatadi."
      />
      <StageNotice stage={4}>
        Testlarni topshirish va baholash hali ishlamaydi. Savollar mavjud test to‘plamlaridan olinib, tushunchalarga bog‘langach ishga
        tushiriladi. Quyida testlar tuzilmasi va interfeys ko‘rinishi berilgan.
      </StageNotice>

      <div className="grid grid--3 mt-5">
        {[
          { icon: Target, title: 'Tushunchaga bog‘langan', text: 'Har bir savol mavzu → tushuncha → ko‘nikmaga bog‘lanadi.' },
          { icon: ListChecks, title: 'Xato turlari', text: 'Har bir noto‘g‘ri variant aniq chalkashuvni ifodalaydi.' },
          { icon: Gauge, title: 'Ishonch darajasi', text: 'Talaba javobiga qanchalik ishonishini belgilaydi (1–5).' },
        ].map((f) => (
          <Card key={f.title} className="feature">
            <span className="feature__icon"><f.icon size={20} /></span>
            <h3>{f.title}</h3>
            <p className="small muted">{f.text}</p>
          </Card>
        ))}
      </div>

      <div className="section__head mt-7">
        <div>
          <div className="eyebrow">Katalog</div>
          <h2>Mavzular bo‘yicha testlar</h2>
        </div>
        <Tabs
          ariaLabel="Qism"
          value={partId}
          onChange={setPartId}
          items={[{ value: 'all', label: 'Barchasi' }, ...subject.parts.map((p) => ({ value: p.id, label: p.title }))]}
        />
      </div>
      <div className="list">
        {list.map((t) => {
          const topic = topics.find((x) => x.id === t.topicId)!;
          return (
            <Link key={t.id} to={paths.test(t.id)} className="list__row">
              <span className="list__icon"><ClipboardCheck size={18} /></span>
              <div className="list__main">
                <strong>{topic.globalOrder}. {topic.title}</strong>
                <small className="muted">Diagnostik test · rejada ~{t.plannedQuestions} savol</small>
              </div>
              <Badge tone="neutral">Rejalashtirilgan</Badge>
              <ArrowRight size={16} className="list__arrow" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
