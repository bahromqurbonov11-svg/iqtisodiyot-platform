# Iqtisodiyot nazariyasi — ta’lim va analitika platformasi

**Versiya:** 0.3.0 · **Bosqich:** 1 — sayt skeleti va dizayn (+ taqdimotlarni yuklash)

Iqtisodiyot nazariyasi fani (IQN11210, Soliq oliy maktabi) uchun ta’lim platformasi.
Yakuniy maqsad — talabalarning bilim bo‘shliqlarini aniqlaydigan, o‘qituvchiga tahliliy
ma’lumot beradigan va boshqa fanlar bilan markaziy analitika orqali birlashadigan tizim.

## Hozir nima ishlaydi / nima ishlamaydi

| Ishlaydi (1-bosqich) | Hali ishlamaydi |
|---|---|
| Barcha sahifalar va navigatsiya | Haqiqiy kirish / ro‘yxatdan o‘tish (3-bosqich) |
| 25 mavzu katalogi (sillabusdan, haqiqiy nomlar) | Ma’ruza matnlari, glossariy, keyslar (2-bosqich) |
| **Taqdimotlar: qo‘lda yuklash, ko‘rish, yuklab olish** | |
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

## GitHub Pages’ga joylash (bir martalik sozlash)

1. github.com’da yangi **Public** repozitoriy yarating, nomi: `iqtisodiyot-platform`.
   (Bepul GitHub Pages faqat ochiq repozitoriyda ishlaydi.)
2. Ushbu loyiha fayllarini repozitoriyga yuklang (`git push` yoki GitHub sahifasi orqali).
3. Repozitoriyda: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. **Actions** bo‘limida “Saytni GitHub Pages'ga joylash” jarayoni yashil bo‘lgach, sayt manzili:
   `https://<github-login>.github.io/iqtisodiyot-platform/`

Shundan keyin `main` tarmog‘iga har bir o‘zgarish saytni avtomatik yangilaydi (`.github/workflows/deploy.yml`).
Repozitoriy nomini o‘zgartirsangiz ham sayt ishlayveradi (nisbiy manzillar ishlatilgan).

## Taqdimotlarni yuklash (o‘qituvchi uchun)

Fayllar `public/materials/<mavzu-id>/taqdimotlar/` papkalarida saqlanadi
(`in1-t01` … `in1-t12` — 1-qism, `in2-t01` … `in2-t13` — 2-qism).

**Eng oson yo‘l:** saytda Administrator paneli → **Kontent** → mavzu qatoridagi **“Yuklash”**.
GitHub’ning shu mavzu papkasi ochiladi → faylni sudrab tashlang → **Commit changes**.
1–2 daqiqada taqdimot mavzu sahifasida paydo bo‘ladi.

- Ruxsat etilgan turlar: `.pptx`, `.ppt`, `.ppsx`, `.pdf`.
- Fayl nomi sarlavha bo‘ladi: `6-mavzu Talab va taklif.pptx`. Ruscha fayl nomiga `RU` qo‘shing — saytda RU belgisi chiqadi.
- GitHub sahifasi orqali bitta fayl ≤ 25 MB (git orqali ≤ 100 MB). Saytning umumiy hajmi ≤ 1 GB.
- Ko‘rish: PDF brauzerda ochiladi; PPTX — Microsoft Office Online orqali (faqat sayt internetda ochiq bo‘lganda).
- Fayllar ro‘yxatini qo‘lda yozish shart emas: `scripts/build-materials-manifest.mjs` build paytida o‘zi tuzadi.
- Yuklash huquqi faqat repozitoriyga yozish huquqi borlarda bo‘ladi; talabalar faqat ko‘radi va yuklab oladi.
- Diqqat: ochiq repozitoriydagi fayllarni internetda har kim yuklab olishi mumkin.

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
