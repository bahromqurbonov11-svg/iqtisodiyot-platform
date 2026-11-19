import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ClipboardCheck, Gamepad2, LineChart as LineIcon, Target, Layers, GraduationCap, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { catalogService } from '@/services/catalog.service';
import { games } from '@/data/games';
import { appConfig } from '@/config/app.config';
import { GameIcon } from '@/modules/games/GameIcon';
import { CountUp, Reveal, Tilt } from '@/components/motion/Motion';
import { MarketPlayground } from './MarketPlayground';
import { HeroChart } from './HeroChart';

export function HomePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const subject = catalogService.getSubject().data;
  const topics = catalogService.getTopics().data;
  const totalHours = subject.parts.reduce((s, p) => s + p.totalHours, 0);

  return (
    <>
      <RegistrationReminder />
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
              <Button to={paths.tests} size="lg" variant="secondary">{user ? t.nav.tests : 'Testni sinab ko‘rish'}</Button>
            </div>
            <dl className="hero__facts">
              <div><dt><CountUp to={25} /></dt><dd>mavzu</dd></div>
              <div><dt><CountUp to={2} /></dt><dd>qism</dd></div>
              <div><dt><CountUp to={subject.parts.reduce((s, p) => s + p.credits, 0)} /></dt><dd>ECTS kredit</dd></div>
              <div><dt><CountUp to={totalHours} /></dt><dd>soat</dd></div>
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
              { icon: Gamepad2, title: 'Mashq qiling', text: 'Atamalarni moslashtiring va amaliy vaziyatlarni tahlil qiling.', to: paths.games, stage: 0 },
              { icon: LineIcon, title: 'Natijani ko‘ring', text: 'Kuchli tomonlar va bo‘shliqlar xaritasi, tavsiyalar.', to: paths.cabinet, stage: 7 },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 90} className="steps__item">
                <Link to={s.to} className="step">
                  <span className="step__num">0{i + 1}</span>
                  <span className="step__icon"><s.icon size={22} /></span>
                  <h3>{s.title}</h3>
                  <p className="muted">{s.text}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* INTERAKTIV LABORATORIYA */}
      <section className="section section--lab">
        <div className="container lab">
          <Reveal className="lab__intro">
            <div className="eyebrow">Sinab ko‘ring</div>
            <h2>Bozorni o‘zingiz siljiting</h2>
            <p className="muted">
              Talab yoki taklif o‘zgarsa, narx va miqdor qanday o‘zgaradi? Slayderlarni suring va muvozanat nuqtasi
              qanday harakatlanishini kuzating. Shu tarzda tushunchalar yodlanmaydi, tushuniladi.
            </p>
            <div className="mt-4"><Button to={paths.simulator} variant="secondary" iconRight={<ArrowRight size={16} />}>To‘liq simulyator</Button></div>
          </Reveal>
          <Reveal delay={120} className="lab__widget"><MarketPlayground /></Reveal>
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
            {subject.parts.map((p, pi) => {
              const list = topics.filter((t) => t.partId === p.id);
              return (
                <Reveal as="article" delay={pi * 120} key={p.id} className="part-card">
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
                </Reveal>
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
              <h2>Har mavzu uchun ikkita o‘yin</h2>
            </div>
            <Button to={paths.games} variant="ghost" iconRight={<ArrowRight size={16} />}>O‘yinlar bo‘limi</Button>
          </div>
          <div className="game-strip">
            {games.filter((g) => g.slug === 'moslashtirish' || g.slug === 'vaziyatli-qaror').map((g, gi) => (
              <Reveal key={g.slug} delay={gi * 100}>
                <Link to={paths.games} className="game-chip" style={{ ['--gc' as string]: g.color }}>
                  <span className="game-chip__icon"><GameIcon name={g.icon} size={22} /></span>
                  <strong>{g.slug === 'moslashtirish' ? g.title : 'Vaziyatni tahlil qiling'}</strong>
                  <small>Har mavzuda 10 ta topshiriq</small>
                </Link>
              </Reveal>
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
            {user && <Button to={user.role === 'admin' ? paths.analytics : paths.cabinetResults} variant="light" iconRight={<ArrowRight size={16} />}>Natijalarni ko‘rish</Button>}
          </div>
        </div>
      </section>


    </>
  );
}

/** Bosh sahifadagi illyustratsiya: talab-taklif grafigi + bilim kartochkalari */
function HeroVisual() {
  return (
    <Tilt className="hero-visual" aria-hidden>
      <div className="hero-visual__panel">
        <div className="hero-visual__head">
          <span>Bozor muvozanati</span>
          <span className="hero-visual__pill">6-mavzu</span>
        </div>
        <HeroChart />
      </div>
      <div className="hero-visual__float hero-visual__float--a">
        <span className="dot dot--success" /> Talab qonuni <b>narx ↑ · miqdor ↓</b>
      </div>
      <div className="hero-visual__float hero-visual__float--b">
        <span className="dot dot--success" /> Muvozanat <b>talab = taklif</b>
      </div>

    </Tilt>
  );
}
import { RegistrationReminder } from './RegistrationReminder';
import { useI18n } from '@/i18n';
import { useAuth } from '@/services/auth/AuthContext';
