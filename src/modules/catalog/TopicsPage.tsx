import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Shuffle, Clock, ArrowRight } from 'lucide-react';
import { PageHeader, Badge, Tabs } from '@/components/ui';
import { Reveal } from '@/components/motion/Motion';
import { TopicDiagram } from './TopicDiagram';
import { topicStyle } from './topicStyle';
import { catalogService } from '@/services/catalog.service';
import { paths } from '@/navigation/paths';

export function TopicsPage() {
  const { user } = useAuth();
  const progress = useOwnProgress();
  const [statusFilter, setStatusFilter] = useState('all');
  const subject = catalogService.getSubject().data;
  const access = useTopicAccess();
  const all = catalogService.getTopics().data.filter(topic => access.allows(topic.globalOrder));
  const [params, setParams] = useSearchParams();
  const part = params.get('qism') ?? 'all';
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const randomTopic = () => navigate(paths.topic(all[Math.floor(Math.random() * all.length)].id));
  // "/" tugmasi qidiruvga o‘tkazadi
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (e.key === '/' && !(el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const matchingTopics = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter(
      (t) =>
        (part === 'all' || t.partId === part) &&
        (!needle || t.title.toLowerCase().includes(needle) || t.subtopics.some((s) => s.toLowerCase().includes(needle))),
    );
  }, [all, part, q]);
  const filtered = matchingTopics.filter(topic => {
    const result = progress.topics.get(topic.globalOrder);
    return statusFilter === 'all' || (statusFilter === 'untested' ? !result : result && mastery(result.correct, result.total).tone === 'danger');
  });

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
        <div className="toolbar__tools">
          <label className="search">
            <Search size={16} aria-hidden />
            <span className="sr-only">Mavzu qidirish</span>
            <input ref={searchRef} type="search" placeholder="Mavzu yoki tushuncha…  ( / )" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <button type="button" className="random-btn" onClick={randomTopic} title="Tasodifiy mavzuni ochish">
            <Shuffle size={15} aria-hidden /> Tasodifiy mavzu
          </button>
        </div>
      </div>
      <p className="topics-count" aria-live="polite">
        {q.trim() ? <>Qidiruv bo‘yicha <b>{filtered.length}</b> ta mavzu topildi</> : <>Jami <b>{filtered.length}</b> ta mavzu</>}
      </p>
      {user?.role === 'student' && !user.external && progress.attempts && <div className="mt-3">
        <Tabs ariaLabel="O‘zlashtirish holati" value={statusFilter} onChange={setStatusFilter}
          items={[{ value: 'all', label: 'Barcha holatlar' }, { value: 'gap', label: 'Bo‘shliq bor' }, { value: 'untested', label: 'Test ishlanmagan' }]} />
      </div>}

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
              <div className="topic-tiles">
                {list.map((t, idx) => {
                  const outcome = progress.topics.get(t.globalOrder);
                  const status = outcome && mastery(outcome.correct, outcome.total);
                  const style = topicStyle(t.globalOrder);
                  const Icon = style.icon;
                  return (
                    <Reveal key={t.id} delay={(idx % 3) * 80}>
                      <article className="topic-tile" style={{ ['--gc' as string]: style.color }}>
                        <span className="topic-tile__glow" aria-hidden />
                        <Link to={paths.topic(t.id)} aria-label={t.globalOrder + '-mavzu. ' + t.title} className="topic-tile__main">
                          <span className="topic-tile__top">
                            <span className="topic-tile__icon"><Icon size={24} aria-hidden /></span>
                            <span className="topic-tile__num">{t.globalOrder}<small>-mavzu</small></span>
                            <span className="topic-tile__part">{p.order}-qism · {t.order}-bo‘lim</span>
                          </span>
                          <h3 className="topic-tile__title">{t.title}</h3>
                          {status && <span className="topic-tile__status">
                            <Badge tone={status.tone}>{status.label} · {status.percent}%</Badge>
                            <progress aria-label="O‘zlashtirish" value={status.percent} max={100} />
                          </span>}
                          <ul className="topic-tile__subs">
                            {t.subtopics.slice(0, 3).map((s) => <li key={s}>{s}</li>)}
                          </ul>
                        </Link>
                        <TopicDiagram topicNumber={t.globalOrder} visual={topicVisuals[t.globalOrder - 1]} />
                        <Link to={paths.topic(t.id)} className="topic-tile__foot" tabIndex={-1} aria-hidden>
                          <span><Clock size={13} /> Ma’ruza {t.lectureHours} s · Amaliy {t.practiceHours} s</span>
                          <span className="topic-tile__cta">Ochish <ArrowRight size={15} /></span>
                        </Link>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </section>
          );
        })}

      {!filtered.length && <p className="muted center mt-6">Bu tanlov bo‘yicha mavzu topilmadi.</p>}
    </div>
  );
}
export type TopicVisual = { kind: 'flow' | 'bars' | 'line' | 'market'; title: string; values: number[]; steps: [string, string][] };

// Sillabusdagi umumiy mavzu tartibi bo‘yicha. Raqamlar o‘quv misollari.
export const topicVisuals: TopicVisual[] = [
  {"kind":"line","title":"Ishlab chiqarish imkoniyatlari","values":[10,8,0],"steps":[["0 dona A","10 dona B. B mahsuloti eng ko‘p ishlab chiqariladi."],["5 dona A","8 dona B. A ko‘paygani uchun B ning bir qismidan voz kechiladi."],["10 dona A","0 dona B. Barcha resurslar A mahsulotiga yo‘naltiriladi."]]},
  {"kind":"bars","title":"Qo‘shimcha ishchi va mahsulot","values":[10,8,5],"steps":[["1-ishchi","Birinchi ishchi ishlab chiqarishni 10 dona oshiradi."],["2-ishchi","Ikkinchi ishchi yana 8 dona qo‘shadi."],["3-ishchi","Uskuna miqdori o‘zgarmaganda uchinchi ishchi yana 5 dona qo‘shadi."]]},
  {"kind":"flow","title":"Qarorlar qanday muvofiqlashadi?","values":[],"steps":[["Bozor","Narx va talab firmalar qaroriga yo‘nalish beradi."],["Markazlashgan","Nimani va qancha ishlab chiqarish markaziy reja orqali belgilanadi."],["Aralash","Bozor qarorlari va davlat tartibga solishi birga ishlaydi."]]},
  {"kind":"flow","title":"Pul ayirboshlashni qanday yengillashtiradi?","values":[],"steps":[["Tovar","Sotuvchi mahsulotini bozorga olib chiqadi."],["Pul","Mahsulot sotiladi va evaziga umumiy to‘lov vositasi olinadi."],["Xarid","Olingan pul boshqa tovarni sotib olishga sarflanadi."]]},
  {"kind":"flow","title":"Bozordagi doiraviy oqim","values":[],"steps":[["Oila","Uy xo‘jaligi firmaga mehnat taklif qiladi va ish haqi oladi."],["Firma","Firma ishlab chiqarish omillaridan foydalanib mahsulot yaratadi."],["Mahsulot bozori","Uy xo‘jaligi daromadidan mahsulot va xizmat xarid qiladi."]]},
  {"kind":"market","title":"Talab va taklif muvozanati","values":[80,60,40],"steps":[["8 ming","Talab 80, taklif 40 dona. 40 dona taqchillik bor."],["10 ming","Talab ham, taklif ham 60 dona. Bozor muvozanatda."],["12 ming","Talab 40, taklif 80 dona. 40 dona ortiqcha taklif bor."]]},
  {"kind":"flow","title":"Sotuvchilar soniga qarab bozor tuzilishi","values":[],"steps":[["Ko‘p firma","Bir xil mahsulotda alohida firma narxga ta’sir qila olmaydi."],["Bir necha firma","Oligopoliyada firmalar narx qarorida raqib javobini hisobga oladi."],["Bitta firma","Yaqin o‘rinbosar bo‘lmasa, yagona sotuvchi bozor kuchiga ega."]]},
  {"kind":"bars","title":"Chakana narx qanday yig‘iladi?","values":[60,80,100],"steps":[["Tannarx","Mahsulot tayyorlash xarajati 60 ming so‘m."],["Ulgurji","20 ming so‘m qo‘shilib, ulgurji narx 80 mingga yetadi."],["Chakana","Chakana ustama bilan xaridor 100 ming so‘m to‘laydi."]]},
  {"kind":"bars","title":"Nominal va real ish haqi","values":[100,110,95.7],"steps":[["Boshlanish","Ish haqi va narx indekslari 100 deb olingan."],["Nominal","Ish haqi 10% ko‘tarilsa, nominal indeks 110 bo‘ladi."],["Real","Narxlar 15% oshsa, real ish haqi indeksi taxminan 95,7 bo‘ladi."]]},
  {"kind":"flow","title":"Tadbirkorlik kapitalining aylanishi","values":[],"steps":[["Pul","Korxona mablag‘ bilan resurslar va ish kuchini jalb qiladi."],["Ishlab chiqarish","Omillar birlashtiriladi va mahsulot tayyorlanadi."],["Sotuv","Mahsulot sotiladi. Tushum kapital aylanishining yangi davrini boshlashi mumkin."]]},
  {"kind":"bars","title":"Xarajat, tushum va foyda","values":[80,100,20],"steps":[["Xarajat","Mahsulot tayyorlash va sotish uchun 80 birlik sarflandi."],["Tushum","Xaridorlardan jami 100 birlik tushdi."],["Foyda","Tushumdan xarajat ayirilganda 20 birlik qoldi."]]},
  {"kind":"bars","title":"Yer sifati va differensial renta","values":[3,4,6],"steps":[["Past hosil","Bir xil xarajat bilan yomonroq yer gektaridan 3 tonna olindi."],["O‘rta hosil","O‘rtacha yer gektaridan 4 tonna olindi."],["Yuqori hosil","Unumdor yer 6 tonna berdi. Bir xil narx va xarajatda farq qo‘shimcha daromad beradi."]]},
  {"kind":"bars","title":"Qo‘shilgan qiymat zanjiri","values":[40,20,40],"steps":[["Don","Fermer 40 birlik qiymat yaratdi."],["Un","Tegirmon unni 60 birlikka sotdi. Uning qo‘shgan qiymati 20 birlik."],["Non","Non 100 birlikka sotildi. Nonvoy 40 birlik qo‘shdi va jami qo‘shilgan qiymat 100 bo‘ldi."]]},
  {"kind":"flow","title":"Yalpi talab oshsa nima yuz beradi?","values":[],"steps":[["Xarajat ortadi","Uy xo‘jaliklari yoki firmalar ko‘proq xarid rejalashtiradi."],["AD siljiydi","Har bir umumiy narx darajasida talab yuqoriroq bo‘ladi."],["Yangi muvozanat","Qisqa davrda ishlab chiqarish yoki narxlar darajasi, ko‘pincha ikkalasi ham oshadi."]]},
  {"kind":"bars","title":"Daromad, iste’mol va jamg‘arma","values":[100,75,25],"steps":[["Daromad","Uy xo‘jaligi ixtiyorida 100 birlik bor."],["Iste’mol","75 birlik tovar va xizmatlarga sarflandi."],["Jamg‘arma","100 dan 75 ayirilganda 25 birlik jamg‘ariladi."]]},
  {"kind":"line","title":"Real ishlab chiqarishning o‘sishi","values":[100,105,110],"steps":[["1-yil","Boshlang‘ich real ishlab chiqarish indeksi 100."],["2-yil","Indeks 105 bo‘ldi. O‘sish 5%."],["3-yil","Indeks 110 bo‘ldi. Ikkinchi yilga nisbatan o‘sish taxminan 4,8%."]]},
  {"kind":"bars","title":"Haqiqiy va potensial ishlab chiqarish","values":[90,100,105],"steps":[["90 birlik","Potensial hajmga nisbatan 10 birlik yetishmaydi."],["100 birlik","Haqiqiy va potensial hajm teng."],["105 birlik","Haqiqiy hajm potensialdan 5 birlik yuqori, narx bosimi kuchayishi mumkin."]]},
  {"kind":"line","title":"Iqtisodiy sikl","values":[105,89,102],"steps":[["Cho‘qqi","Ishlab chiqarish yuqori nuqtaga yetadi."],["Pasayish","Ishlab chiqarish kamayib, ishsizlik ortishi mumkin."],["Tiklanish","Talab va ishlab chiqarish yana o‘sa boshlaydi."]]},
  {"kind":"bars","title":"Budjet daromadi va xarajati","values":[100,115,15],"steps":[["Daromad","Davlat budjetiga 100 birlik tushdi."],["Xarajat","Davlat 115 birlik sarfladi."],["Taqchillik","Xarajat daromaddan 15 birlikka ortiq."]]},
  {"kind":"flow","title":"Markaziy bank stavkasi va kredit","values":[],"steps":[["Asosiy stavka","Markaziy bank bazaviy foiz stavkasini oshirishi mumkin."],["Kredit sharoiti","Bank kreditlari odatda qimmatlashadi va qarzga talab sekinlashadi."],["Yalpi talab","Xarid va investitsiya o‘sishi sekinlashib, narx bosimi pasayishi mumkin."]]},
  {"kind":"flow","title":"Davlat tashqi ta’sirga qanday javob beradi?","values":[],"steps":[["Tashqi zarar","Ishlab chiqarishdagi ifloslanish boshqa aholiga zarar yetkazadi."],["Davlat chorasi","Standart yoki ifloslanish uchun to‘lov joriy qilinishi mumkin."],["Rag‘bat","Korxona chiqindini kamaytirsa, to‘lov yoki zarar ham kamayadi."]]},
  {"kind":"bars","title":"Pul daromadi va xarid quvvati","values":[100,105,95.5],"steps":[["Boshlanish","Daromad va narx indeksi dastlab 100."],["Nominal","Daromad 5% oshdi, nominal indeks 105 bo‘ldi."],["Real","Narx 10% oshganda real daromad indeksi taxminan 95,5 bo‘ladi."]]},
  {"kind":"flow","title":"Global qiymat zanjiri","values":[],"steps":[["Loyihalash","Mahsulot bir mamlakatda ishlab chiqiladi."],["Yig‘ish","Butlovchi qismlar boshqa mamlakatlarda ishlab chiqarilib, bir joyda yig‘iladi."],["Sotish","Tayyor mahsulot boshqa bozorlarga yetkaziladi."]]},
  {"kind":"bars","title":"Eksport, import va savdo balansi","values":[80,65,15],"steps":[["Eksport","Xorijga 80 birlik qiymatida tovar sotildi."],["Import","Chet eldan 65 birlik qiymatida tovar olindi."],["Balans","Eksportdan import ayirilganda 15 birlik ijobiy saldo qoldi."]]},
  {"kind":"line","title":"Valyuta kursi va import qiymati","values":[12,12.5,13],"steps":[["12 ming","Bir dollar 12 ming so‘m bo‘lsa, 100 dollarlik buyum 1,2 mln so‘m turadi."],["12,5 ming","Bir dollar 12,5 ming so‘m bo‘lsa, xarajat 1,25 mln so‘m."],["13 ming","Bir dollar 13 ming so‘m bo‘lsa, xarajat 1,3 mln so‘mga chiqadi."]]},
];
import { useOwnProgress, mastery } from '@/modules/student/useOwnProgress';
import { useAuth } from '@/services/auth/AuthContext';
import { useTopicAccess } from '@/services/TopicAccess';
