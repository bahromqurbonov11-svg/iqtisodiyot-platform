import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Presentation, BookA, Briefcase, ClipboardCheck, Gamepad2, Lightbulb, Clock, Network,
} from 'lucide-react';
import { PageHeader, Card, Badge, Button, StageBadge } from '@/components/ui';
import { catalogService } from '@/services/catalog.service';
import { references } from '@/data/subject';
import { games } from '@/data/games';
import { paths } from '@/navigation/paths';
import { NotFoundPage } from '@/modules/public/NotFoundPage';
import { GameIcon } from '@/modules/games/GameIcon';

/**
 * MAVZU SAHIFASI SHABLONI — barcha 25 mavzu uchun bitta komponent.
 * Mazmun bloklari 2-bosqichda (materiallar, tushunchalar) to‘ldiriladi.
 */
export function TopicDetailPage() {
  const { topicId = '' } = useParams();
  const topic = catalogService.getTopic(topicId);
  if (!topic) return <NotFoundPage />;

  const part = catalogService.getSubject().data.parts.find((p) => p.id === topic.partId)!;
  const siblings = catalogService.getTopics(topic.partId).data;
  const { prev, next } = catalogService.getAdjacent(topic.id);

  const materialSlots = [
    { icon: BookOpen, title: 'Ma’ruza matni', text: 'Asosiy nazariy material' },
    { icon: Presentation, title: 'Taqdimot', text: 'Ma’ruza slaydlari' },
    { icon: BookA, title: 'Glossariy', text: 'Mavzu atamalari' },
    { icon: Briefcase, title: 'Keys / amaliy topshiriq', text: 'Amaliy mashg‘ulot uchun' },
  ];

  return (
    <div className="container page">
      <PageHeader
        crumbs={[
          { label: 'Mavzular', to: paths.topics },
          { label: part.title, to: `${paths.topics}?qism=${part.id}` },
          { label: `${topic.order}-mavzu` },
        ]}
        eyebrow={`${part.title} · ${topic.order}-mavzu · umumiy tartib ${topic.globalOrder}/25`}
        title={topic.title}
        badges={
          <>
            <Badge tone="neutral" icon={<Clock size={12} />}>Ma’ruza {topic.lectureHours} soat</Badge>
            <Badge tone="neutral" icon={<Clock size={12} />}>Amaliy {topic.practiceHours} soat</Badge>
            <Badge tone="primary">Manba: {topic.source.document}</Badge>
          </>
        }
      />

      <div className="topic-layout">
        <div className="stack">
          <Card title="Mavzu rejasi" subtitle="Sillabusdagi asosiy masalalar">
            <ol className="plan">
              {topic.subtopics.map((s, i) => (
                <li key={s}><span>{i + 1}</span>{s}</li>
              ))}
            </ol>
          </Card>

          <Card title="O‘quv materiallari" actions={<StageBadge stage={2} />}>
            <div className="slots">
              {materialSlots.map((m) => (
                <div key={m.title} className="slot">
                  <m.icon size={20} aria-hidden />
                  <div>
                    <strong>{m.title}</strong>
                    <small className="muted">{m.text}</small>
                  </div>
                  <span className="slot__state">Fayl ulanmagan</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Asosiy tushunchalar" actions={<StageBadge stage={2} />}>
            <div className="placeholder">
              <Network size={22} aria-hidden />
              <p>
                Bu yerda mavzuning tushunchalari va ular orasidagi bog‘liqlik ko‘rsatiladi. Tushunchalar ro‘yxati ma’ruza matnlari va
                glossariy asosida tuziladi — testlar va o‘yinlar aynan shu tushunchalarga bog‘lanadi.
              </p>
            </div>
          </Card>

          <div className="grid grid--2">
            <Card title="Diagnostik test" actions={<StageBadge stage={4} />}>
              <p className="small muted">Har bir savol mavzu tushunchasiga va ehtimoliy xato turiga bog‘lanadi.</p>
              <Button to={paths.test(`test-${topic.id}`)} variant="secondary" icon={<ClipboardCheck size={16} />} className="mt-3">
                Test sahifasi
              </Button>
            </Card>
            <Card title="O‘yinlar" actions={<StageBadge stage={5} />}>
              <div className="game-mini-list">
                {games.slice(0, 3).map((g) => (
                  <Link key={g.slug} to={paths.game(g.slug)} className="game-mini" style={{ ['--gc' as string]: g.color }}>
                    <GameIcon name={g.icon} size={16} /> {g.title}
                  </Link>
                ))}
              </div>
              <Link to={paths.games} className="link small mt-3 inline-flex"><Gamepad2 size={14} /> Barcha o‘yinlar</Link>
            </Card>
          </div>

          <Card title="Adabiyotlar" subtitle="Sillabusda shu mavzu uchun ko‘rsatilgan manbalar">
            <ol className="refs">
              {topic.references.map((n) => (
                <li key={n}><span className="refs__n">[{n}]</span> {references[n]}</li>
              ))}
            </ol>
          </Card>

          <div className="pager">
            {prev ? (
              <Link to={paths.topic(prev.id)} className="pager__link">
                <ArrowLeft size={16} />
                <span><small>Oldingi mavzu</small>{prev.title}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link to={paths.topic(next.id)} className="pager__link pager__link--next">
                <span><small>Keyingi mavzu</small>{next.title}</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>

        <aside className="topic-aside">
          <Card padded={false}>
            <div className="topic-aside__head">{part.title}</div>
            <ol className="topic-aside__list">
              {siblings.map((s) => (
                <li key={s.id}>
                  <Link to={paths.topic(s.id)} className={s.id === topic.id ? 'is-active' : ''} aria-current={s.id === topic.id ? 'page' : undefined}>
                    <span className="num">{s.order}</span>
                    {s.title}
                  </Link>
                </li>
              ))}
            </ol>
          </Card>
          <Card className="tip">
            <Lightbulb size={18} aria-hidden />
            <p className="small">Kelajakda bu yerda sizning shu mavzu bo‘yicha natijangiz va tavsiyalar ko‘rinadi.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
