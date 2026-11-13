import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Clock, ArrowUpRight } from 'lucide-react';
import { PageHeader, Badge, Tabs } from '@/components/ui';
import { catalogService } from '@/services/catalog.service';
import { paths } from '@/navigation/paths';

export function TopicsPage() {
  const subject = catalogService.getSubject().data;
  const all = catalogService.getTopics().data;
  const [params, setParams] = useSearchParams();
  const part = params.get('qism') ?? 'all';
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter(
      (t) =>
        (part === 'all' || t.partId === part) &&
        (!needle || t.title.toLowerCase().includes(needle) || t.subtopics.some((s) => s.toLowerCase().includes(needle))),
    );
  }, [all, part, q]);

  const setPart = (v: string) => {
    const next = new URLSearchParams(params);
    if (v === 'all') next.delete('qism');
    else next.set('qism', v);
    setParams(next, { replace: true });
  };

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Bosh sahifa', to: paths.home }, { label: 'Mavzular' }]}
        eyebrow="Mavzular katalogi"
        title="25 mavzu — ikki qism"
        description="Mavzu nomlari va soatlar rasmiy sillabuslardan olingan. Mavzuni tanlab, uning rejasi, materiallari, testi va o‘yinlariga o‘ting."
        badges={<Badge tone="primary">Manba: IN sillabus 1 va 2</Badge>}
      />

      <div className="toolbar">
        <Tabs
          ariaLabel="Qism bo‘yicha saralash"
          value={part}
          onChange={setPart}
          items={[
            { value: 'all', label: 'Barchasi', count: all.length },
            ...subject.parts.map((p) => ({ value: p.id, label: p.title, count: all.filter((t) => t.partId === p.id).length })),
          ]}
        />
        <label className="search">
          <Search size={16} aria-hidden />
          <span className="sr-only">Mavzu qidirish</span>
          <input type="search" placeholder="Mavzu yoki tushuncha…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>

      {subject.parts
        .filter((p) => part === 'all' || p.id === part)
        .map((p) => {
          const list = filtered.filter((t) => t.partId === p.id);
          if (!list.length) return null;
          return (
            <section key={p.id} className="topic-section">
              <div className="topic-section__head">
                <h2>{p.title}</h2>
                <span className="muted small">{list.length} mavzu · {p.credits} kredit · {p.totalHours} soat</span>
              </div>
              <div className="topic-grid">
                {list.map((t) => (
                  <Link key={t.id} to={paths.topic(t.id)} className="topic-card">
                    <div className="topic-card__top">
                      <span className="topic-card__num">{String(t.globalOrder).padStart(2, '0')}</span>
                      <span className="topic-card__part">{p.order}-qism · {t.order}-mavzu</span>
                      <ArrowUpRight size={18} className="topic-card__arrow" aria-hidden />
                    </div>
                    <h3 className="topic-card__title">{t.title}</h3>
                    <ul className="topic-card__subs">
                      {t.subtopics.slice(0, 3).map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                    <div className="topic-card__foot">
                      <span><Clock size={13} /> Ma’ruza {t.lectureHours} s · Amaliy {t.practiceHours} s</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

      {!filtered.length && <p className="muted center mt-6">“{q}” bo‘yicha mavzu topilmadi.</p>}
    </div>
  );
}
