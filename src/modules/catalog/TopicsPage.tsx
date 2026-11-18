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
                  <article key={t.id} className="topic-card">
                    <Link to={paths.topic(t.id)} aria-label={t.title} style={{ display: 'grid', gap: 8, color: 'inherit' }}>
                    <div className="topic-card__top">
                      <span className="topic-card__num">{String(t.globalOrder).padStart(2, '0')}</span>
                      <span className="topic-card__part">{p.order}-qism · {t.order}-mavzu</span>
                      <ArrowUpRight size={18} className="topic-card__arrow" aria-hidden />
                    </div>
                    <h3 className="topic-card__title">{t.title}</h3>
                    </Link>
                    <ul className="topic-card__subs">
                      {t.subtopics.slice(0, 3).map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                    <TopicDiagram visual={topicVisuals[t.globalOrder - 1]} />
                    <div className="topic-card__foot">
                      <span><Clock size={13} /> Ma’ruza {t.lectureHours} s · Amaliy {t.practiceHours} s</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

      {!filtered.length && <p className="muted center mt-6">“{q}” bo‘yicha mavzu topilmadi.</p>}
    </div>
  );
}
function TopicDiagram({ visual }: { visual: TopicVisual }) {
  const [selected, setSelected] = useState(visual.kind === 'market' ? 1 : 0);
  const chart = visual.kind !== 'flow';
  const chartMax = Math.max(...visual.values, 1);
  const chartMin = visual.kind === 'line' ? Math.min(...visual.values) : 0;
  const max = chartMax + (chartMax - chartMin || 1) * 0.1;
  const x = (index: number) => [51, 150, 249][index];
  const y = (value: number) => 78 - 61 * (value - chartMin) / (max - chartMin);
  const line = (values: number[]) => values.map((value, index) => x(index) + ',' + y(value)).join(' ');
  const fill = (active: boolean) => active ? 'var(--c-primary)' : '#bbdbcb';

  return (
    <div style={{ background: '#f1f7f3', border: '1px solid #dce9e1', borderRadius: 12, padding: 12, marginTop: 'auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 4 }}>
        <strong className="small">{visual.title}</strong>
        {chart && <span className="xs muted">O‘quv misoli</span>}
      </div>
      {chart && (
        <svg viewBox="0 0 300 88" aria-hidden="true" style={{ display: 'block', width: '100%', height: 'auto', marginBlock: 4 }}>
          <path d="M22 15V78H278" fill="none" stroke="#b7cec0" />
          {visual.kind === 'market' && (
            <polyline points={line([...visual.values].reverse())} fill="none" stroke="#a56d22" strokeWidth={2.5} />
          )}
          {visual.kind !== 'bars' && <polyline points={line(visual.values)} fill="none" stroke="var(--c-primary)" strokeWidth={2.5} />}
          {visual.values.map((value, i) => visual.kind === 'bars' ? (
            <rect key={i} x={x(i) - 22} y={y(value)} width={44} height={78 - y(value)} rx={4} fill={fill(i === selected)} />
          ) : (
            <circle key={i} cx={x(i)} cy={y(value)} r={i === selected ? 6 : 3.5} fill={fill(i === selected)} stroke="var(--c-primary)" strokeWidth={1.5} />
          ))}
          {visual.kind === 'market' && <circle cx={x(selected)} cy={y(visual.values[2 - selected])} r={5} fill="white" stroke="#a56d22" strokeWidth={2.5} />}
        </svg>
      )}
      {visual.kind === 'market' && <div className="xs muted">● Talab · ○ Taklif</div>}
      <div role="group" aria-label={visual.title} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 5, marginTop: 7 }}>
        {visual.steps.map(([label], i) => (
          <button key={label} type="button" aria-pressed={i === selected} onClick={() => setSelected(i)}
            style={{ minWidth: 0, minHeight: 36, padding: '4px 3px', font: 'inherit', fontSize: 11.5, border: '1px solid #b7cec0', borderRadius: 7, background: i === selected ? '#245d4b' : '#fff', color: i === selected ? '#fff' : '#23473d', cursor: 'pointer' }}>
            {visual.kind === 'flow' && <span aria-hidden="true">{i + 1}. </span>}{label}
          </button>
        ))}
      </div>
      <p className="xs" aria-live="polite" style={{ margin: '7px 0 0', minHeight: '3.4em', lineHeight: 1.4 }}>{visual.steps[selected][1]}</p>
    </div>
  );
}


type TopicVisual = { kind: 'flow' | 'bars' | 'line' | 'market'; title: string; values: number[]; steps: [string, string][] };

// Sillabusdagi umumiy mavzu tartibi bo‘yicha. Raqamlar o‘quv misollari.
const topicVisuals: TopicVisual[] = [
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
