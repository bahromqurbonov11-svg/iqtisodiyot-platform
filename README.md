# Iqtisodiyot nazariyasi — ta’lim va analitika platformasi

**Versiya:** 0.2.0 · **Bosqich:** 1 — sayt skeleti va dizayn

Iqtisodiyot nazariyasi fani (IQN11210, Soliq oliy maktabi) uchun ta’lim platformasi.
Yakuniy maqsad — talabalarning bilim bo‘shliqlarini aniqlaydigan, o‘qituvchiga tahliliy
ma’lumot beradigan va boshqa fanlar bilan markaziy analitika orqali birlashadigan tizim.

## Hozir nima ishlaydi / nima ishlamaydi

| Ishlaydi (1-bosqich) | Hali ishlamaydi |
|---|---|
| Barcha sahifalar va navigatsiya | Haqiqiy kirish / ro‘yxatdan o‘tish (3-bosqich) |
| 25 mavzu katalogi (sillabusdan, haqiqiy nomlar) | O‘quv fayllari (2-bosqich) |
| Mavzu sahifasi shabloni (25 mavzu uchun bitta) | Testlarni topshirish va baholash (4-bosqich) |
| Test va o‘yin sahifalari tuzilmasi | O‘yinlarning o‘zi (5, 8-bosqich) |
| Talaba kabineti, administrator paneli, analitika — DEMO ma’lumot bilan | Natijalarni saqlash, ma’lumotlar bazasi (6-bosqich) |
| Mobil / planshet / kompyuter moslashuvi | Haqiqiy analitik hisob-kitoblar (7-bosqich) |

Barcha namunaviy raqamlar interfeysda **DEMO** yorlig‘i bilan belgilangan.
Ishlamaydigan tugmalar o‘chirilgan va qaysi bosqichda ishlashi yozilgan.

## Ishga tushirish

Talab: Node.js 20+ (22 tavsiya etiladi).

```bash
npm install          # yoki: pnpm install
npm run dev          # http://127.0.0.1:5173 — ishlab chiqish rejimi
npm run build        # dist/ — istalgan statik hostingga joylash uchun
npm run build:single # dist-single/index.html — butun sayt bitta faylda (namoyish uchun)
npm run typecheck    # TypeScript tekshiruvi
```

Sayt hash-marshrutlash (`#/mavzular`) ishlatadi, shuning uchun `dist/` papkasini istalgan
statik hostingga (Netlify, Vercel, GitHub Pages, oddiy server) sozlamasiz joylash mumkin.

## Texnologiyalar

- **React 19 + TypeScript** — interfeys
- **Vite 7** — yig‘ish vositasi
- **React Router 7** — sahifalar orasida o‘tish
- **lucide-react** — ikonkalar
- Grafiklar — tashqi kutubxonasiz, oddiy SVG/CSS komponentlar

Oldingi versiya (ChatGPT’da yig‘ilgan, faqat build saqlangan) bilan bir xil texnologiyalar
va rang palitrasi saqlangan.

**Nega Next.js emas?** Hozirgi bosqichda server kerak emas; Vite + React tezroq va har
qanday hostingga ko‘chiriladi. Server (3-bosqich) alohida API xizmati sifatida qo‘shiladi
(masalan, Node.js/NestJS yoki Python/FastAPI + PostgreSQL). Interfeys faqat `services/`
qatlami orqali ma’lumot oladi, shuning uchun server qo‘shilganda sahifalar o‘zgarmaydi.
Agar keyinchalik Next.js kerak bo‘lsa, `modules/` va `components/` deyarli o‘zgarishsiz ko‘chadi.

## Papkalar tuzilmasi

```
src/
├── app/router.tsx          Barcha marshrutlar
├── config/app.config.ts    organization_id, subject_id, API manzili, funksiya bayroqlari
├── i18n/                   Tarjimalar (uz — asosiy, ru — keyingi bosqich)
├── styles/                 Dizayn tizimi: tokens.css → base → components → layout → pages
├── components/
│   ├── ui/                 Button, Card, Badge, Notice, PageHeader, Stat, Tabs
│   └── charts/             LineChart, BarList, Heatmap, ColumnChart
├── layouts/                PublicLayout, DashboardLayout, AccessGate, Footer
├── navigation/             paths.ts (manzillar), menus.ts (menyular)
├── models/                 Ma’lumotlar modeli (TypeScript turlari)
├── data/
│   ├── subject.ts          HAQIQIY: 25 mavzu, soatlar, ta’lim natijalari (sillabusdan)
│   ├── games.ts            5 o‘yin turi tavsifi
│   ├── materials.ts        Material turlari
│   └── demo/               DEMO: to‘qima talabalar va analitika
├── services/
│   ├── api/                Versiyalangan API mijozi (/api/v1) va endpointlar ro‘yxati
│   ├── auth/               Autentifikatsiya interfeysi + demo provayder
│   ├── catalog.service.ts  Fan/mavzular
│   └── analytics.service.ts Analitika (hozir origin: 'demo')
└── modules/                Funksional modullar (har biri mustaqil)
    ├── public/  catalog/  materials/  tests/  games/
    ├── auth/    student/  admin/      analytics/
```

Batafsil: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Sillabus o‘zgarsa

Faqat `src/data/subject.ts` faylini tahrirlang — katalog, mavzu sahifalari, testlar
ro‘yxati va analitika avtomatik yangilanadi.

## Git

```bash
git init && git add . && git commit -m "1-bosqich: sayt skeleti"
git remote add origin <repo-manzili> && git push -u origin main
```
