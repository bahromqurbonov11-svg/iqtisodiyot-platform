import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ClipboardCheck, Gamepad2, LineChart as LineIcon, Target, Layers, GraduationCap, Clock } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { catalogService } from '@/services/catalog.service';
import { games } from '@/data/games';
import { roadmap } from '@/data/roadmap';
import { appConfig } from '@/config/app.config';
import { GameIcon } from '@/modules/games/GameIcon';

export function HomePage() {
  const subject = catalogService.getSubject().data;
  const topics = catalogService.getTopics().data;
  const totalHours = subject.parts.reduce((s, p) => s + p.totalHours, 0);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__text">
            <div className="eyebrow">Soliq oliy maktabi · {appConfig.subject.code}</div>
            <h1 className="hero__title">
              Iqtisodiyot nazariyasi:<br />
              <span className="hero__accent">bilimdan — tahlilga</span>
            </h1>
            <p className="hero__lead">
              25 mavzu, diagnostik testlar va interaktiv o‘yinlar orqali o‘rganing. Platforma qaysi tushunchalar o‘zlashtirilganini va
              qayerda bo‘shliq borligini ko‘rsatadi.
            </p>
            <div className="hero__actions">
              <Button to={paths.topics} size="lg" iconRight={<ArrowRight size={18} />}>Mavzularni ko‘rish</Button>
              <Button to={paths.about} size="lg" variant="secondary">Fan haqida</Button>
            </div>
            <dl className="hero__facts">
              <div><dt>25</dt><dd>mavzu</dd></div>
              <div><dt>2</dt><dd>qism</dd></div>
              <div><dt>{subject.parts.reduce((s, p) => s + p.credits, 0)}</dt><dd>ECTS kredit</dd></div>
              <div><dt>{totalHours}</dt><dd>soat</dd></div>
            </dl>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* QANDAY ISHLAYDI */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <div>
              <div className="eyebrow">O‘quv sikli</div>
              <h2>To‘rt qadam: o‘rganish, tekshirish, mashq, tahlil</h2>
            </div>
          </div>
          <div className="steps">
            {[
              { icon: BookOpen, title: 'O‘rganing', text: 'Mavzu bo‘yicha ma’ruza, taqdimot va glossariy.', to: paths.materials, stage: 2 },
              { icon: ClipboardCheck, title: 'Tekshiring', text: 'Har bir savol aniq tushunchaga bog‘langan diagnostik test.', to: paths.tests, stage: 4 },
              { icon: Gamepad2, title: 'Mashq qiling', text: 'Moslashtirish, ketma-ketlik, vaziyatli qaror o‘yinlari.', to: paths.games, stage: 5 },
              { icon: LineIcon, title: 'Natijani ko‘ring', text: 'Kuchli tomonlar va bo‘shliqlar xaritasi, tavsiyalar.', to: paths.cabinet, stage: 7 },
            ].map((s, i) => (
              <Link to={s.to} key={s.title} className="step">
                <span className="step__num">0{i + 1}</span>
                <span className="step__icon"><s.icon size={22} /></span>
                <h3>{s.title}</h3>
                <p className="muted">{s.text}</p>
                <Badge tone="info">{s.stage}-bosqichda to‘liq ishlaydi</Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* QISMLAR */}
      <section className="section section--tint">
        <div className="container">
          <div className="section__head">
            <div>
              <div className="eyebrow">Fan tuzilmasi · sillabus asosida</div>
              <h2>Ikki qism, 25 mavzu</h2>
            </div>
            <Button to={paths.topics} variant="ghost" iconRight={<ArrowRight size={16} />}>To‘liq katalog</Button>
          </div>
          <div className="parts">
            {subject.parts.map((p) => {
              const list = topics.filter((t) => t.partId === p.id);
              return (
                <article key={p.id} className="part-card">
                  <header className="part-card__head">
                    <div>
                      <span className="part-card__tag">{p.order}-qism</span>
                      <h3>{p.title}</h3>
                    </div>
                    <div className="part-card__meta">
                      <span><Layers size={14} /> {list.length} mavzu</span>
                      <span><GraduationCap size={14} /> {p.credits} kredit</span>
                      <span><Clock size={14} /> {p.totalHours} soat</span>
                    </div>
                  </header>
                  <ol className="part-card__list">
                    {list.slice(0, 5).map((t) => (
                      <li key={t.id}>
                        <Link to={paths.topic(t.id)}>
                          <span className="num">{t.globalOrder}</span>
                          {t.title}
                        </Link>
                      </li>
                    ))}
                  </ol>
                  <Link to={`${paths.topics}?qism=${p.id}`} className="part-card__more">
                    Yana {list.length - 5} ta mavzu <ArrowRight size={14} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* O‘YINLAR */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <div>
              <div className="eyebrow">Interaktiv o‘yinlar</div>
              <h2>Besh xil o‘yin — besh xil tafakkur ko‘nikmasi</h2>
            </div>
            <Button to={paths.games} variant="ghost" iconRight={<ArrowRight size={16} />}>O‘yinlar bo‘limi</Button>
          </div>
          <div className="game-strip">
            {games.map((g) => (
              <Link key={g.slug} to={paths.game(g.slug)} className="game-chip" style={{ ['--gc' as string]: g.color }}>
                <span className="game-chip__icon"><GameIcon name={g.icon} size={22} /></span>
                <strong>{g.title}</strong>
                <small>{g.short}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ANALITIKA */}
      <section className="section section--dark">
        <div className="container analytics-teaser">
          <div>
            <div className="eyebrow eyebrow--light">O‘qituvchi uchun</div>
            <h2>Ball emas — tushuncha darajasidagi tahlil</h2>
            <p>
              Har bir savol <em>Fan → Mavzu → Tushuncha → Ko‘nikma → Xato turi</em> zanjiriga bog‘lanadi. Natijada qaysi tushunchalar
              chalkashtirilayotgani, qaysi xatolar takrorlanayotgani va talabaning o‘z bahosi obyektiv natijadan qanchalik farq qilishi
              ko‘rinadi.
            </p>
            <ul className="check-list">
              <li><Target size={16} /> Kuzatilgan dalil va taxmin aniq ajratiladi</li>
              <li><Target size={16} /> Topshirilmagan ish “0 bilim” deb hisoblanmaydi</li>
              <li><Target size={16} /> Guruh va individual hisobotlar</li>
            </ul>
            <Button to={paths.analytics} variant="light" iconRight={<ArrowRight size={16} />}>Analitika panelini ko‘rish</Button>
          </div>
        </div>
      </section>

      {/* YO‘L XARITASI */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <div>
              <div className="eyebrow">Rivojlanish rejasi</div>
              <h2>Platforma bosqichma-bosqich quriladi</h2>
            </div>
          </div>
          <ol className="roadmap">
            {roadmap.map((r) => (
              <li key={r.stage} className={`roadmap__item${r.stage === appConfig.stage ? ' is-current' : r.stage < appConfig.stage ? ' is-done' : ''}`}>
                <span className="roadmap__num">{r.stage}</span>
                <div>
                  <strong>{r.title}</strong>
                  <p className="muted small">{r.text}</p>
                </div>
                {r.stage === appConfig.stage && <Badge tone="primary">Hozir</Badge>}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

/** Bosh sahifadagi illyustratsiya: talab-taklif grafigi + bilim kartochkalari */
function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden>
      <div className="hero-visual__panel">
        <div className="hero-visual__head">
          <span>Bozor muvozanati</span>
          <span className="hero-visual__pill">6-mavzu</span>
        </div>
        <svg viewBox="0 0 320 220" className="hero-visual__chart">
          <defs>
            <linearGradient id="hvg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#276e59" stopOpacity=".16" />
              <stop offset="1" stopColor="#276e59" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[40, 80, 120, 160].map((y) => (
            <line key={y} x1="36" x2="300" y1={y} y2={y} stroke="#e3e8df" />
          ))}
          <line x1="36" y1="196" x2="300" y2="196" stroke="#9fb1a8" />
          <line x1="36" y1="20" x2="36" y2="196" stroke="#9fb1a8" />
          <path d="M50 40 C 120 90, 180 130, 290 180" stroke="#276e59" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M50 180 C 130 140, 190 100, 290 40" stroke="#c9a646" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M50 40 C 120 90, 170 112, 170 112 L 170 196 L 50 196 Z" fill="url(#hvg)" />
          <line x1="170" y1="112" x2="170" y2="196" stroke="#1f3832" strokeDasharray="4 4" />
          <line x1="36" y1="112" x2="170" y2="112" stroke="#1f3832" strokeDasharray="4 4" />
          <circle cx="170" cy="112" r="7" fill="#fff" stroke="#153a32" strokeWidth="3" />
          <text x="276" y="196" fontSize="12" fill="#276e59" fontWeight="700">D</text>
          <text x="280" y="36" fontSize="12" fill="#a8892f" fontWeight="700">S</text>
          <text x="20" y="116" fontSize="11" fill="#6f817a">P*</text>
          <text x="164" y="212" fontSize="11" fill="#6f817a">Q*</text>
        </svg>
      </div>
      <div className="hero-visual__float hero-visual__float--a">
        <span className="dot dot--success" /> Talab qonuni <b>o‘zlashtirilgan</b>
      </div>
      <div className="hero-visual__float hero-visual__float--b">
        <span className="dot dot--danger" /> Egiluvchanlik <b>bo‘shliq</b>
      </div>
      <div className="hero-visual__float hero-visual__float--c">
        <small>Ishonch: 4/5 · Natija: 2/5</small>
        <strong>Qayta ko‘rish tavsiya etiladi</strong>
      </div>
    </div>
  );
}
