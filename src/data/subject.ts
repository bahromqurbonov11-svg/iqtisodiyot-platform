import type { Subject, SubjectPart, Topic, SourceRef } from '@/models';
import { appConfig } from '@/config/app.config';

/**
 * FAN TUZILMASI — HAQIQIY MA’LUMOT
 * Manba: "IN sillabus 1.docx" va "IN sillabus 2.docx" (2026–2027 o‘quv yili,
 * Soliq oliy maktabi). Mavzu nomlari va soatlar sillabusdan aynan olingan.
 * Sillabus yangilansa, faqat shu faylni tahrirlang.
 */

const SUBJECT_ID = appConfig.subject.id;
const SRC1: SourceRef = { origin: 'syllabus', document: 'IN sillabus 1.docx' };
const SRC2: SourceRef = { origin: 'syllabus', document: 'IN sillabus 2.docx' };

export const parts: SubjectPart[] = [
  {
    id: 'in1',
    subjectId: SUBJECT_ID,
    order: 1,
    title: 'Iqtisodiyot nazariyasi 1',
    credits: 4,
    totalHours: 120,
    lectureHours: 24,
    practiceHours: 24,
    selfStudyHours: 72,
    goal:
      'Talabalarga iqtisodiy bilimlarning nazariy asoslarini, iqtisodiyotning asosiy tushunchalari va kategoriyalarini, iqtisodiy qonunlar va tamoyillarni o‘rgatish, ularni real iqtisodiy jarayonlarni tahlil qilish hamda amaliy vaziyatlarda qo‘llash ko‘nikmalarini shakllantirish.',
    outcomes: [
      { code: 'TN1', kind: 'knowledge', text: 'Iqtisodiyot nazariyasining predmeti, usullari, asosiy kategoriyalari, iqtisodiy qonunlar va ilmiy bilish usullarini tushuntira oladi.' },
      { code: 'TN2', kind: 'knowledge', text: 'Ishlab chiqarish jarayoni, omillari, iqtisodiy tizimlar, mulkchilik shakllari, tovar-pul munosabatlari va bozor iqtisodiyoti tamoyillarini biladi.' },
      { code: 'TN3', kind: 'knowledge', text: 'Talab, taklif, bozor muvozanati, raqobat, monopoliya, narx, ish haqi va mehnat munosabatlarining iqtisodiy mazmunini biladi.' },
      { code: 'TN4', kind: 'knowledge', text: 'Tadbirkorlik faoliyati, kapital, ishlab chiqarish xarajatlari, foyda, agrar munosabatlar va agrobiznes tushunchalarini o‘zlashtiradi.' },
      { code: 'TN5', kind: 'skill', text: 'Iqtisodiy hodisalarni sabab-oqibat, grafik, jadval va raqamli ko‘rsatkichlar asosida tahlil qiladi.' },
      { code: 'TN6', kind: 'skill', text: 'Egiluvchanlik, bozor muvozanati, narx shakllanishi, xarajatlar va foyda bo‘yicha amaliy topshiriqlarni bajaradi.' },
      { code: 'TN7', kind: 'skill', text: 'Bozor infratuzilmasi, raqobat, tadbirkorlik, mehnat va agrar munosabatlar bo‘yicha amaliy vaziyatlarni baholaydi.' },
      { code: 'TN8', kind: 'competence', text: 'Iqtisodiy muammolar bo‘yicha asoslangan xulosa chiqaradi va mustaqil tahliliy ish tayyorlaydi.' },
    ],
    source: SRC1,
  },
  {
    id: 'in2',
    subjectId: SUBJECT_ID,
    order: 2,
    title: 'Iqtisodiyot nazariyasi 2',
    credits: 5,
    totalHours: 150,
    lectureHours: 30,
    practiceHours: 30,
    selfStudyHours: 90,
    goal:
      'Talabalarga milliy iqtisodiyotning makroiqtisodiy o‘lchamlari, yalpi talab va yalpi taklif, iste’mol, jamg‘arma, investitsiyalar, iqtisodiy o‘sish, makroiqtisodiy beqarorlik, moliya, pul-kredit tizimi, davlatning iqtisodiy roli hamda xalqaro iqtisodiy munosabatlar bo‘yicha bilim va tahlil ko‘nikmalarini shakllantirish.',
    outcomes: [
      { code: 'TN1', kind: 'knowledge', text: 'Milliy iqtisodiyot, makroiqtisodiy ko‘rsatkichlar, milliy hisoblar tizimi, YaIM va YaMM mazmunini tushuntiradi.' },
      { code: 'TN2', kind: 'knowledge', text: 'Yalpi talab va taklif, iste’mol, jamg‘arma, investitsiyalar, iqtisodiy o‘sish va makroiqtisodiy muvozanat nazariyalarini biladi.' },
      { code: 'TN3', kind: 'knowledge', text: 'Iqtisodiy sikl, inqiroz, ishsizlik, inflyatsiya, moliya va pul-kredit tizimi, banklar faoliyati mazmunini anglaydi.' },
      { code: 'TN4', kind: 'knowledge', text: 'Davlatning iqtisodiy roli, ijtimoiy siyosat, jahon xo‘jaligi, xalqaro savdo, valyuta va kredit munosabatlarini biladi.' },
      { code: 'TN5', kind: 'skill', text: 'Makroiqtisodiy ko‘rsatkichlarni hisoblaydi, taqqoslaydi, jadval va grafiklar asosida tahlil qiladi.' },
      { code: 'TN6', kind: 'skill', text: 'Yalpi muvozanat, iste’mol-jamg‘arma, investitsiya, o‘sish, ishsizlik va inflyatsiya jarayonlarini amaliy vaziyatlarda tahlil qiladi.' },
      { code: 'TN7', kind: 'skill', text: 'Moliya, pul-kredit va ijtimoiy siyosat choralari hamda xalqaro munosabatlar bo‘yicha asoslangan xulosa chiqaradi.' },
      { code: 'TN8', kind: 'competence', text: 'Makro va xalqaro iqtisodiy jarayonlar bo‘yicha mustaqil tahliliy ish va amaliy tavsiyalar tayyorlaydi.' },
    ],
    source: SRC2,
  },
];

type RawTopic = Pick<Topic, 'title' | 'subtopics' | 'lectureHours' | 'practiceHours' | 'references'>;

const in1: RawTopic[] = [
  { title: 'Iqtisodiyotga kirish. Fanning predmeti va usullari', lectureHours: 2, practiceHours: 2, references: [1, 2, 3, 7, 11], subtopics: ['Cheklangan resurslar va cheksiz ehtiyojlar', 'Iqtisodiyot va uning bosh masalasi', 'Iqtisodiyotga oid bilimlarning shakllanishi va rivojlanishi', 'Iqtisodiy qonunlar va kategoriyalar', 'Fanning predmeti va soliq mutaxassislarini tayyorlashdagi ahamiyati', 'Iqtisodiy jarayonlarni ilmiy bilish usullari'] },
  { title: 'Ishlab chiqarish jarayoni va uning natijalari', lectureHours: 2, practiceHours: 2, references: [1, 2, 3, 4, 8, 9], subtopics: ['Ishlab chiqarish omillari va tarkibi', 'Ishlab chiqarish jarayonining mazmuni', 'Umumiy va pirovard natijalar', 'Ishlab chiqarish imkoniyatlari va uning chegarasi', 'Samaradorlik ko‘rsatkichlari va soliqlarning ta’siri'] },
  { title: 'Iqtisodiy tizimlar va mulkchilik', lectureHours: 2, practiceHours: 2, references: [1, 2, 4, 5, 6], subtopics: ['Ijtimoiy-iqtisodiy taraqqiyot bosqichlari', 'Iqtisodiy tizimlar modellari va soliqqa tortishning o‘rni', 'Mulkchilik munosabatlari: mohiyati, shakllari, turlari', 'Davlat tasarrufidan chiqarish va xususiylashtirish'] },
  { title: 'Tovar-pul munosabatlari', lectureHours: 2, practiceHours: 2, references: [1, 2, 3, 4, 8, 9], subtopics: ['Natural xo‘jalikdan tovar ishlab chiqarishga o‘tish', 'Tovar va uning xususiyatlari', 'Qiymatning mehnat nazariyasi va naflilik nazariyalari', 'Pulning kelib chiqishi, mohiyati va vazifalari'] },
  { title: 'Bozor iqtisodiyoti. Bozor va uning tuzilishi', lectureHours: 2, practiceHours: 2, references: [1, 2, 3, 5], subtopics: ['Bozor iqtisodiyoti tizimining mazmuni', 'Afzalliklari va kamchiliklari', 'Bozor tuzilishi, infratuzilmasi va elementlari', 'Bozor turlari: tovar, resurs va moliya bozorlari', 'O‘tish davri iqtisodiyoti va o‘tish modellari'] },
  { title: 'Talab, taklif, bozor muvozanati', lectureHours: 2, practiceHours: 2, references: [1, 2, 3, 4, 10, 11, 17], subtopics: ['Talab va talab qonuni', 'Talabga ta’sir qiluvchi omillar va soliqlar', 'Taklif va unga ta’sir qiluvchi omillar', 'Bozor muvozanati va nomutanosibligi'] },
  { title: 'Raqobat va monopoliya', lectureHours: 2, practiceHours: 2, references: [1, 2, 5], subtopics: ['Raqobatning iqtisodiy asoslari', 'Raqobat shakllari va usullari', 'Monopoliyalarning asosi va turlari', 'Monopoliyaga qarshi qonunchilik'] },
  { title: 'Narxning mohiyati va shakllanish xususiyatlari', lectureHours: 2, practiceHours: 2, references: [1, 2, 4, 14, 17], subtopics: ['Narxning mazmuni va obyektiv asoslari', 'Narxga ta’sir etuvchi omillar va narx vazifalari', 'Soliqlarning narx shakllanishiga ta’siri', 'Narx turlari', 'Turli raqobat sharoitida narx shakllanishi'] },
  { title: 'Ish haqi va mehnat munosabatlari', lectureHours: 2, practiceHours: 2, references: [1, 2, 4, 6, 17], subtopics: ['Daromadlarni taqsimlash tamoyillari', 'Ish haqining mazmuni va soliqqa tortish asoslari', 'Ish haqini tashkil etish shakllari va tizimlari', 'Mehnat munosabatlari va kasaba uyushmalari'] },
  { title: 'Tadbirkorlik faoliyati va tadbirkorlik kapitali', lectureHours: 2, practiceHours: 2, references: [1, 2, 4, 8, 14], subtopics: ['Tadbirkorlik mohiyati va belgilari', 'Tadbirkorlik shakllari va soliqqa tortish', 'Kapital va uning harakati bosqichlari', 'Asosiy va aylanma kapital, ulardan foydalanish samaradorligi'] },
  { title: 'Ishlab chiqarish xarajatlari va foyda', lectureHours: 2, practiceHours: 2, references: [1, 2, 3, 17], subtopics: ['Ishlab chiqarish xarajatlari tushunchasi va tarkibi', 'Xarajat turlari va soliqlarning ta’siri', 'Foydaning mazmuni, taqsimlanishi va ishlatilishi'] },
  { title: 'Agrar munosabatlar va agrobiznes', lectureHours: 2, practiceHours: 2, references: [1, 4, 6, 9, 11], subtopics: ['Agrar munosabatlar xususiyatlari', 'Ijara haqi va renta munosabatlari', 'Agrosanoat integratsiyasi va majmuasi', 'Agrobiznes va uning turlari'] },
];

const in2: RawTopic[] = [
  { title: 'Milliy iqtisodiyot va uning makroiqtisodiy o‘lchamlari', lectureHours: 4, practiceHours: 4, references: [1, 2, 5, 11], subtopics: ['Milliy iqtisodiyotning qaror topishi', 'Makroiqtisodiy ko‘rsatkichlar tizimi', 'Milliy hisoblar tizimi', 'YaIM va YaMM tarkibi, YaIMni hisoblash usullari'] },
  { title: 'Yalpi talab va yalpi taklif', lectureHours: 2, practiceHours: 2, references: [1, 5, 6, 7, 11], subtopics: ['Yalpi talab va yalpi taklif tushunchalari', 'Ularga ta’sir qiluvchi omillar', 'Makroiqtisodiy muvozanat', 'Egri chiziqlar va xrapovik samarasi'] },
  { title: 'Iste’mol, jamg‘arma va investitsiyalar', lectureHours: 2, practiceHours: 2, references: [1, 2, 4, 10], subtopics: ['Iste’mol va jamg‘armaning mazmuni', 'Iste’mol va jamg‘arish o‘rtasidagi optimal nisbat', 'Investitsiyalarning vazifalari va turlari', 'Investitsiya hajmiga ta’sir etuvchi omillar'] },
  { title: 'Iqtisodiy taraqqiyot. Iqtisodiy o‘sish va milliy boylik', lectureHours: 2, practiceHours: 2, references: [1, 3, 5, 8], subtopics: ['Iqtisodiy o‘sish mazmuni, mezonlari va turlari', 'Iqtisodiy o‘sish omillari', 'Milliy boylikning tarkibiy tuzilishi', 'O‘zbekiston iqtisodiy salohiyatidan foydalanish'] },
  { title: 'Milliy iqtisodiyotning muvozanatli va mutanosibli rivojlanishi', lectureHours: 2, practiceHours: 2, references: [1, 2, 6, 17], subtopics: ['Iqtisodiy muvozanatlik va uning shart-sharoitlari', 'Iqtisodiy mutanosiblik turlari', 'Yalpi talab va yalpi taklif muvozanati', 'Tarkibiy tuzilishni o‘zgartirish vazifalari'] },
  { title: 'Makroiqtisodiy beqarorlik, ishsizlik va inflyatsiya', lectureHours: 4, practiceHours: 4, references: [1, 2, 7, 8, 17], subtopics: ['Iqtisodiy sikl nazariyalari, fazalari va turlari', 'Iqtisodiy inqirozlar sabablari va oqibatlari', 'Ishsizlik turlari va Ouken qonuni', 'Inflyatsiya jarayonlari'] },
  { title: 'Moliya tizimi va moliyaviy siyosat', lectureHours: 2, practiceHours: 2, references: [1, 3, 6, 9, 12], subtopics: ['Moliyaning mohiyati va vazifalari', 'Moliya tizimining bo‘g‘inlari', 'Davlat byudjeti daromadlari va xarajatlari', 'Soliqqa tortish tamoyillari va islohotlar'] },
  { title: 'Pul muomalasi, pul-kredit tizimi va banklar', lectureHours: 2, practiceHours: 2, references: [1, 2, 4, 10, 17], subtopics: ['Pul muomalasi qonuniyatlari', 'Pulga talab va pul taklifi', 'Kreditning mohiyati, manbalari va vazifalari', 'Markaziy bank va tijorat banklari'] },
  { title: 'Davlatning iqtisodiy roli', lectureHours: 2, practiceHours: 2, references: [1, 2, 3, 5, 14], subtopics: ['Davlat roli haqidagi nazariy qarashlar', 'Davlat tomonidan tartibga solishning obyektiv asoslari', 'Maqsad va vazifalar', 'Tartibga solish usul va vositalari'] },
  { title: 'Aholi daromadlari va davlatning ijtimoiy siyosati', lectureHours: 2, practiceHours: 2, references: [1, 2, 6, 14, 17], subtopics: ['Daromadlar turlari va manbalari', 'Turmush darajasi ko‘rsatkichlari', 'Daromadlar tengsizligi', 'Ijtimoiy himoya va qashshoqlikni kamaytirish'] },
  { title: 'Jahon xo‘jaligi va uning evolyutsiyasi', lectureHours: 2, practiceHours: 2, references: [1, 2, 3, 7, 8], subtopics: ['Ishlab chiqarishning baynalmilallashuvi', 'Xalqaro iqtisodiy munosabatlar shakllari', 'Jahon infratuzilmasi va globallashuv', 'Transmilliy kompaniyalarning ta’siri'] },
  { title: 'Xalqaro iqtisodiy munosabatlar va O‘zbekistonning jahon hamjamiyatiga kirib borishi', lectureHours: 2, practiceHours: 2, references: [1, 2, 5, 6], subtopics: ['Xalqaro iqtisodiy integratsiya nazariyalari', 'Integratsiya shakllari va guruhlari', 'O‘zbekistonning jahon iqtisodiyotiga integratsiyalashuvi'] },
  { title: 'Jahon bozori. Xalqaro valyuta va kredit munosabatlari', lectureHours: 2, practiceHours: 2, references: [1, 2, 4, 7, 17], subtopics: ['Xalqaro mehnat taqsimoti va savdo nazariyalari', 'To‘lov balansi', 'Valyuta tizimlari', 'Davlatlararo moliya institutlari'] },
];

function build(partId: 'in1' | 'in2', raw: RawTopic[], offset: number, src: SourceRef): Topic[] {
  return raw.map((t, i) => ({
    ...t,
    id: `${partId}-t${String(i + 1).padStart(2, '0')}`,
    subjectId: SUBJECT_ID,
    partId,
    order: i + 1,
    globalOrder: offset + i + 1,
    conceptIds: [],
    source: src,
  }));
}

export const topics: Topic[] = [...build('in1', in1, 0, SRC1), ...build('in2', in2, 12, SRC2)];

export const subject: Subject = {
  id: SUBJECT_ID,
  organizationId: appConfig.organization.id,
  code: appConfig.subject.code,
  name: appConfig.subject.name,
  parts,
};

/** Sillabusdagi adabiyotlar ro‘yxati (har ikki qism uchun bir xil) */
export const references: Record<number, string> = {
  1: 'Шодмонов Ш., Рахматов М. Иқтисодиёт назарияси. Дарслик. — Тошкент: Замин нашр, 2021.',
  2: 'Jo‘rayev T.T., Hamdamov M.A. Iqtisodiyot nazariyasi. Darslik. — Toshkent, 2024.',
  3: 'Nasyrxodjayeva D.S. Ekonomicheskaya teoriya. O‘quv qo‘llanma. — Toshkent: IQTISODIYOT, 2022.',
  4: 'Xodiyev B.Y., Shodmonov Sh. Iqtisodiyot nazariyasi. Darslik. — 2017.',
  5: 'Mankiw N.G. Principles of Economics. — Cengage Learning, 2021.',
  6: 'Носова С.С. Экономическая теория. Учебник. — Москва: КНОРУС, 2017.',
  7: 'O‘lmasov A. Iqtisodiyot nazariyasi. Darslik. — Iqtisod-Moliya, 2014.',
  8: 'Jo‘rayev T.T. va boshq. Iqtisodiyot-2. Darslik. — Toshkent: Nihol print, 2021.',
  9: 'Шодмонов Ш. и др. Экономическая теория. Учебник. — Ташкент: Иқтисод-молия, 2021.',
  10: 'Xodiyev B.Yu., Shodmonov Sh.Sh. Iqtisodiyot nazariyasi. — Toshkent, 2017.',
  11: 'Mankiw N.G. Essentials of Economics. 10th ed. — Cengage Learning, 2024.',
  12: 'www.lex.uz — Qonun hujjatlari milliy bazasi',
  13: 'www.president.uz',
  14: 'www.imv.uz — Iqtisodiyot va moliya vazirligi',
  15: 'www.pearson.com',
  16: 'www.thestudyspace.com',
  17: 'stat.uz — Milliy statistika qo‘mitasi',
  18: 'www.economist.com',
};
