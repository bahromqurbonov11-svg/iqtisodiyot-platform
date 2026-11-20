/**
 * "Biznes yo‘lak" — guruhli o‘yin ssenariylari. Barcha summalar million so‘mda (DEMO, o‘quv modeli).
 * Option: [qaror matni, xarajat, daromad, izoh, (ixtiyoriy) tavakkal: 50% ehtimol bilan daromad shu qiymatga tushadi]
 */
export type Option = [label: string, cost: number, income: number, why: string, lowIncome?: number];
export interface Stage { title: string; concept: string; problem: string; options: [Option, Option, Option] }
export interface Sector { id: string; name: string; emoji: string; blurb: string; overhead: number; stages: Stage[] }

export const START_DEPOSIT = 100;

export const sectors: Sector[] = [
  {
    id: 'retail', name: 'Chakana savdo (oziq-ovqat do‘koni)', emoji: '🛒', overhead: 3,
    blurb: 'Mahalla do‘koni: xaridor oqimi, narx va zaxira boshqaruvi.',
    stages: [
      { title: 'Joy tanlash', concept: 'Talab va muqobil xarajat',
        problem: 'Do‘kon ochish uchun joy tanlashingiz kerak. Joy xaridor oqimini ham, ijara xarajatini ham belgilaydi.',
        options: [
          ['Aholi zich yashaydigan mahallada, o‘rtacha ijara', 12, 22, 'Xaridor oqimi barqaror, ijara o‘rtacha: eng yaxshi nisbat.'],
          ['Markaziy bozor yonida, ijara juda qimmat', 25, 30, 'Talab yuqori, lekin ijara (doimiy xarajat) foydaning katta qismini yeydi.'],
          ['Chekka hududda, ijara juda arzon', 5, 6, 'Xarajat kam, lekin xaridor yo‘q: daromad ham juda kichik.'],
        ] },
      { title: 'Yetkazib beruvchi narxni oshirdi', concept: 'Xarajat o‘sishi va narx',
        problem: 'Asosiy yetkazib beruvchi un va yog‘ narxini 15% ga oshirdi. Foydangiz qisqarmoqda.',
        options: [
          ['Barcha mahsulot narxini 15% ga oshirish', 2, 6, 'Xaridorlarning bir qismi arzonroq do‘konga o‘tdi: talab kamaydi.'],
          ['Muqobil yetkazib beruvchi topib, uzoq muddatli shartnoma tuzish', 8, 20, 'Xarajat qisqardi, narx barqaror qoldi: raqobatbardoshlik saqlandi.'],
          ['Narxni oshirmay, zarar bilan sotishda davom etish', 14, 12, 'Xarajat daromaddan ko‘p: bu holat uzoq davom eta olmaydi.'],
        ] },
      { title: 'Yaqinda supermarket ochildi', concept: 'Raqobat va mahsulot farqlanishi',
        problem: 'Ko‘chaning narigi tomonida yirik supermarket ochildi. Xaridorlar kamaymoqda.',
        options: [
          ['Narxni keskin tushirish (narx urushi)', 15, 12, 'Katta tarmoq bilan narxda tenglasha olmaysiz: marja yo‘qoldi.'],
          ['Mahalliy mahsulotlar assortimenti va uyga yetkazish xizmati', 9, 21, 'Supermarket bermaydigan qiymat taklif qildingiz: sodiq mijozlar ko‘paydi.'],
          ['Hech narsa o‘zgartirmaslik', 0, 5, 'Faqat eng sodiq mijozlar qoldi: daromad pasaydi, imkoniyat boy berildi.'],
        ] },
      { title: 'Sotuvchilar ish haqini oshirishni talab qilmoqda', concept: 'Mehnat unumdorligi va ish haqi',
        problem: 'Xodimlar ish haqini oshirishni so‘rashmoqda. Ketib qolishsa, yangi xodim topish va o‘rgatish xarajatli.',
        options: [
          ['Hammaga ish haqini 30% oshirish', 12, 14, 'Xarajat oshdi, lekin unumdorlik oshmadi: foyda deyarli o‘zgarmadi.'],
          ['Savdo hajmiga bog‘liq mukofot tizimi', 7, 18, 'Ish haqi unumdorlik bilan bog‘landi: sotuv va xizmat sifati oshdi.'],
          ['Talabni rad etish', 3, 3, 'Ikki xodim ketdi: almashtirish xarajati daromadni yedi.'],
        ] },
      { title: 'Bayram oldidan talab oshdi', concept: 'Mavsumiy talab va zaxira',
        problem: 'Bayram arafasida talab keskin ortishi kutilmoqda. Zaxirani qanday rejalashtirasiz?',
        options: [
          ['Talab prognoziga mos zaxirani oldindan oshirish', 12, 26, 'Talab to‘liq qondirildi, mahsulot buzilmadi: eng yuqori foyda.'],
          ['Katta kredit olib, juda katta zaxira yig‘ish', 28, 31, 'Foiz xarajati va buzilgan mahsulot foydani yedi: ortiqcha zaxira ham xarajat.'],
          ['Zaxirani oshirmaslik', 2, 8, 'Talab qondirilmadi: mijozlar boshqa do‘konga ketdi.'],
        ] },
      { title: 'Hisob-kitob va soliq', concept: 'Shaffoflik va soliq xavfi',
        problem: 'Yil yakunida hisob-kitobni qanday yuritishni tanlaysiz?',
        options: [
          ['Barcha daromadni rasmiylashtirib, hisobchi yollash', 6, 15, 'Jarimadan xoli, bank krediti olish imkoni paydo bo‘ldi.'],
          ['Daromadning bir qismini yashirish (tavakkal)', 3, 14, 'Tekshiruv chiqsa jarima daromaddan ancha ko‘p bo‘ladi: tavakkal o‘zini oqlamaydi.', -12],
          ['Hisobni daftarda qo‘lda yuritish', 1, 6, 'Xarajat kam, lekin xatolar ko‘p va kreditga ishonch yo‘q.'],
        ] },
    ],
  },
  {
    id: 'farm', name: 'Fermer xo‘jaligi (issiqxona sabzavoti)', emoji: '🌱', overhead: 3,
    blurb: 'Issiqxona: hosil, mavsum, saqlash va sotish kanali.',
    stages: [
      { title: 'Ekin tanlash', concept: 'Talab va ixtisoslashuv',
        problem: 'Issiqxonada qaysi ekinni yetishtirasiz? Tanlov xarajat va sotish imkoniyatini belgilaydi.',
        options: [
          ['Mahalliy bozorda talab barqaror pomidor va bodring', 12, 23, 'Talab doimiy, sotish oson: yaxshi daromad.'],
          ['Kam tanilgan ekzotik sabzavot', 18, 16, 'Ishlab chiqarish qimmat, xaridor kam: talab yetarli emas.'],
          ['Faqat kartoshka (narxi past)', 8, 12, 'Xarajat kam, lekin narx past: daromad ham past.'],
        ] },
      { title: 'O‘g‘it va yoqilg‘i narxi oshdi', concept: 'Xarajat va samaradorlik',
        problem: 'Resurs narxi oshdi. Hosildorlikni saqlab, xarajatni qanday kamaytirasiz?',
        options: [
          ['O‘g‘itni kamaytirib tejash', 4, 7, 'Hosildorlik tushdi: tejalgan pul yo‘qotilgan hosildan kam.'],
          ['Tomchilatib sug‘orish va organik o‘g‘it', 10, 21, 'Resurs sarfi kamaydi, hosildorlik oshdi: investitsiya o‘zini oqladi.'],
          ['Qimmat o‘g‘itni ko‘paytirish', 16, 18, 'Qo‘shimcha o‘g‘it hosilni oz oshirdi: har bir keyingi birlik samarasi kamayib bordi.'],
        ] },
      { title: 'Hosil pishdi, narx past', concept: 'Taklif ortishi va saqlash',
        problem: 'Hamma fermer bir vaqtda hosil topshirdi: taklif oshib, narx tushdi.',
        options: [
          ['Hammasini shu kuni arzon narxda sotish', 2, 7, 'Taklif ortiqcha vaqtda sotildi: narx eng past nuqtada.'],
          ['Sovutgichli omborda saqlab, bosqichma-bosqich sotish', 9, 22, 'Narx tiklangach sotildi: saqlash xarajati qoplandi va foyda oshdi.'],
          ['Konserva sifatida qayta ishlash', 15, 24, 'Qo‘shilgan qiymat yaratildi, lekin xarajat ham yuqori.'],
        ] },
      { title: 'Mavsumiy ishchi yetishmayapti', concept: 'Mehnat va kapital almashinuvi',
        problem: 'Hosil yig‘ish davrida ishchi kuchi yetishmayapti.',
        options: [
          ['Hammaga doimiy shartnoma berish', 14, 18, 'Ish bo‘lmagan oylarda ham ish haqi to‘landi.'],
          ['Mavsumiy shartnoma va oddiy mexanizatsiya', 8, 20, 'Ishchi va texnika to‘g‘ri uyg‘unlashdi: xarajat past, hosil o‘z vaqtida yig‘ildi.'],
          ['Faqat oila a’zolari bilan ishlash', 1, 6, 'Hosilning bir qismi o‘z vaqtida yig‘ilmay nobud bo‘ldi.'],
        ] },
      { title: 'Sotish kanalini tanlash', concept: 'Vositachi va bozorga chiqish',
        problem: 'Hosilni qaysi kanal orqali sotasiz?',
        options: [
          ['Dallolga topshirish', 2, 10, 'Vositachi marjaning katta qismini oldi.'],
          ['Supermarketlar bilan to‘g‘ridan-to‘g‘ri shartnoma', 7, 20, 'Vositachisiz sotildi: kafolatli buyurtma va yaxshi narx.'],
          ['O‘z do‘konini ochish', 20, 25, 'Daromad bor, lekin do‘kon xarajati foydani kamaytirdi.'],
        ] },
      { title: 'Sovuq urishi xavfi', concept: 'Xavf va sug‘urta',
        problem: 'Ob-havo bashorati kuchli sovuqni ko‘rsatmoqda.',
        options: [
          ['Hosil sug‘urtasi', 5, 15, 'Sovuqdan zarar sug‘urta bilan qoplandi: noaniqlik kamaydi.'],
          ['Hech narsa qilmaslik (tavakkal)', 0, 18, 'Omadingiz kelsa foyda katta, aks holda hosilning katta qismi yo‘qoladi.', -10],
          ['Qimmat isitish tizimi o‘rnatish', 16, 20, 'Hosil saqlandi, lekin xarajat juda yuqori edi.'],
        ] },
    ],
  },
  {
    id: 'sewing', name: 'Tikuv sexi (ishlab chiqarish)', emoji: '🧵', overhead: 4,
    blurb: 'Kichik tikuv ishlab chiqarishi: buyurtma, mato, stanok va narx siyosati.',
    stages: [
      { title: 'Buyurtma turini tanlash', concept: 'Talab barqarorligi',
        problem: 'Sexning asosiy yo‘nalishini tanlang.',
        options: [
          ['Maktab va tashkilotlar formasi (shartnoma asosida)', 12, 25, 'Doimiy talab va oldindan kelishilgan narx: xavf past.'],
          ['Ommaviy arzon kiyim', 15, 24, 'Raqobat yuqori, marja kichik.'],
          ['O‘z brendini yaratish', 25, 28, 'Brendni targ‘ib qilish uzoq vaqt va katta xarajat talab qiladi.'],
        ] },
      { title: 'Import mato narxi oshdi', concept: 'Xom ashyo narxi va muqobil',
        problem: 'Import mato narxi oshdi. Xarajat o‘sishi sizga bevosita ta’sir qilmoqda.',
        options: [
          ['Tayyor mahsulot narxini oshirish', 3, 8, 'Doimiy buyurtmachilar boshqa tikuvchilarga o‘ta boshladi.'],
          ['Mahalliy mato yetkazuvchi bilan uzoq muddatli shartnoma', 9, 21, 'Xom ashyo narxi barqaror bo‘ldi, sifat saqlandi.'],
          ['Sifatsiz arzon mato ishlatish', 5, 6, 'Brak ko‘paydi, qaytarishlar daromadni kamaytirdi.'],
        ] },
      { title: 'Stanoklar eskirgan', concept: 'Kapital va unumdorlik',
        problem: 'Eski stanoklar tez-tez buziladi, ishlab chiqarish sekin.',
        options: [
          ['Yangi stanoklarni qimmat kreditga olish', 22, 30, 'Unumdorlik oshdi, lekin kredit to‘lovi foydani kamaytirdi.'],
          ['Ta’mirlash va ikkita qo‘shimcha stanok', 10, 22, 'Eng kerakli joyga investitsiya: qisqa muddatda yuqori samara.'],
          ['Eski stanokda davom etish', 1, 5, 'To‘xtab qolishlar buyurtmalarni kechiktirdi.'],
        ] },
      { title: 'Ish haqi tizimi', concept: 'Rag‘bat va unumdorlik',
        problem: 'Tikuvchilar ish haqi tizimidan norozi.',
        options: [
          ['Soatbay ish haqini oshirish', 8, 14, 'Ish tezligi oshmadi: xarajat daromaddan tezroq o‘sdi.'],
          ['Dona-bay ish haqi va kasbiy o‘qitish', 9, 22, 'Rag‘bat unumdorlikni oshirdi, sifat ham yaxshilandi.'],
          ['Ish haqini o‘zgartirmaslik', 2, 4, 'Ikki mohir tikuvchi ketdi: ishlab chiqarish kamaydi.'],
        ] },
      { title: 'Narx siyosati', concept: 'Talab elastikligi',
        problem: 'Xaridorlar narxga juda sezgir (talab elastik). Daromadni oshirish yo‘lini tanlang.',
        options: [
          ['Narxni 20% oshirish', 3, 8, 'Talab elastik bo‘lgani uchun sotuv hajmi narx o‘sishidan ko‘proq kamaydi.'],
          ['Ulgurji xaridorlarga hajm bo‘yicha chegirma', 6, 19, 'Hajm oshdi, birlik xarajati kamaydi: umumiy daromad oshdi.'],
          ['Narxni zararga yaqin darajaga tushirish', 10, 12, 'Hajm biroz oshdi, lekin har bir birlikdan foyda deyarli qolmadi.'],
        ] },
      { title: 'Eksport imkoniyati', concept: 'Kengayish va xavf',
        problem: 'Qo‘shni mamlakatdan yirik buyurtma taklifi keldi.',
        options: [
          ['Eksport sertifikatlari va shartnoma xarajatlarini qilib, bosqichma-bosqich kirish', 12, 24, 'Tayyorgarlik bilan kirildi: barqaror yangi bozor ochildi.'],
          ['Yuqori foizli kredit bilan darhol katta buyurtmani olish (tavakkal)', 8, 30, 'Buyurtma muvaffaqiyatli bajarilsa foyda katta, aks holda kredit yuki og‘ir.', -15],
          ['Faqat ichki bozorda qolish', 1, 7, 'Xavf yo‘q, lekin o‘sish imkoniyati ishlatilmadi.'],
        ] },
    ],
  },
  {
    id: 'cafe', name: 'Kafe (xizmat ko‘rsatish)', emoji: '☕', overhead: 4,
    blurb: 'Talabalar mahallasidagi kafe: menyu, xodimlar, mavsum va kengayish.',
    stages: [
      { title: 'Kafe formatini tanlash', concept: 'Maqsadli talab',
        problem: 'Qanday format tanlaysiz? Maqsadli mijoz guruhi daromadni belgilaydi.',
        options: [
          ['Talabalar uchun arzon va tez ovqat', 16, 27, 'Mijoz oqimi katta, aylanma tez: barqaror daromad.'],
          ['Qimmat premium restoran', 30, 34, 'Boshlang‘ich xarajat juda katta, mijozlar soni cheklangan.'],
          ['Faqat uyga yetkazib berish', 8, 12, 'Xarajat past, lekin platforma komissiyasi foydani kamaytirdi.'],
        ] },
      { title: 'Go‘sht narxi oshdi', concept: 'Xarajat o‘sishi va menyu',
        problem: 'Asosiy xom ashyo narxi oshdi, foyda kamaymoqda.',
        options: [
          ['Menyuni qayta tuzish va mavsumiy mahsulot ishlatish', 5, 18, 'Xarajat kamaydi, mijozlar ko‘nikmasi o‘zgarmadi.'],
          ['Barcha narxlarni keskin oshirish', 2, 8, 'Narx sezgir mijozlar boshqa kafega ketdi.'],
          ['Porsiyani yashirincha kamaytirish', 1, 4, 'Mijozlar sifat pasayganini sezdi: obro‘ tushdi.'],
        ] },
      { title: 'Raqobatchi chegirma boshladi', concept: 'Raqobat strategiyasi',
        problem: 'Yaqin atrofdagi raqobatchi katta chegirmalar e’lon qildi.',
        options: [
          ['Narx urushiga kirish', 12, 13, 'Ikkalangiz ham marjadan ayrildingiz.'],
          ['Sodiqlik dasturi (har 10-buyurtma bepul)', 6, 19, 'Doimiy mijozlar ushlab qolindi: takroriy xaridlar oshdi.'],
          ['E’tibor bermaslik', 0, 6, 'Yangi mijozlar raqobatchiga o‘tdi.'],
        ] },
      { title: 'Xizmat sekin', concept: 'Texnologiya va mehnat',
        problem: 'Tushlik paytida navbat uzun, mijozlar ketmoqda.',
        options: [
          ['Ofitsiantlar sonini ko‘paytirish', 12, 17, 'Xarajat oshdi, lekin kamchilik jarayonda edi: samara kam.'],
          ['Buyurtma terminali va jarayonni tartibga solish', 9, 22, 'Kutish vaqti qisqardi, bir soatdagi buyurtmalar ko‘paydi.'],
          ['Mavjud xodimlarga yuklamani oshirish', 2, 4, 'Xodimlar charchadi, xizmat sifati tushdi.'],
        ] },
      { title: 'Past mavsum', concept: 'Mavsumiy talab',
        problem: 'Qishda talabalar soni kamaydi, daromad tushdi.',
        options: [
          ['Vaqtincha yopib, ijarani to‘lashda davom etish', 4, 6, 'Doimiy xarajat davom etdi, daromad nolga yaqin.'],
          ['Biznes-lanch va banket/to‘y buyurtmalari', 8, 22, 'Boshqa mijoz segmenti topildi: past mavsumda daromad saqlandi.'],
          ['Katta reklama kampaniyasi', 15, 20, 'Mijozlar ko‘paydi, lekin reklama xarajati yuqori edi.'],
        ] },
      { title: 'Kengayish', concept: 'O‘sish va xavf',
        problem: 'Foydangiz oshdi. Biznesni kengaytirish yo‘lini tanlang.',
        options: [
          ['Kreditga ikkinchi filial ochish', 25, 30, 'Kredit foizi va yangi joyda mijoz kamligi foydani yedi.'],
          ['Franshizaga qo‘shilish (tavakkal)', 10, 32, 'Brendning mashhurligi yordam bersa foyda katta, aks holda yo‘qotish katta.', -12],
          ['Mavjud kafeni ta’mirlab, o‘rindiqlarni ko‘paytirish', 9, 21, 'Mavjud mijozlarga xizmat sig‘imi oshdi: yuqori samara.'],
        ] },
    ],
  },
  {
    id: 'it', name: 'IT-xizmat (startap)', emoji: '💻', overhead: 3,
    blurb: 'Dasturiy xizmat: mahsulot, jamoa, daromad modeli va xavfsizlik.',
    stages: [
      { title: 'Mahsulot tanlash', concept: 'Bozor topish',
        problem: 'Qaysi yo‘nalishda ish boshlaysiz?',
        options: [
          ['Kichik bizneslar uchun hisob-kitob (CRM) xizmati', 12, 24, 'Aniq ehtiyoj va kam raqobat: mijozlar tez topildi.'],
          ['Hamma uchun umumiy ilova', 20, 22, 'Raqobat juda zich, foydalanuvchi jalb qilish qimmat.'],
          ['Buyurtma asosida veb-sayt yaratish', 6, 14, 'Tez daromad, lekin o‘sish cheklangan.'],
        ] },
      { title: 'Dasturchi maoshi oshdi', concept: 'Mehnat bozori',
        problem: 'Bozorda dasturchilar maoshi oshdi, jamoadan ketish xavfi bor.',
        options: [
          ['Hammaning maoshini oshirish', 14, 18, 'Xarajat oshdi, ish natijasi o‘zgarmadi.'],
          ['Stajyorlarni jalb qilish va masofaviy ish', 6, 18, 'Xarajat kam, mutaxassislar soni ko‘paydi.'],
          ['Maoshni o‘zgartirmaslik', 2, 3, 'Kuchli dasturchi ketdi, loyiha kechikdi.'],
        ] },
      { title: 'Yirik mijoz to‘lovni kechiktirdi', concept: 'Pul oqimi',
        problem: 'Yirik mijoz to‘lovni ikki oyga kechiktirdi, hisobda mablag‘ yetishmayapti.',
        options: [
          ['Yuqori foizli bank krediti olish', 13, 15, 'Foiz xarajati foydani deyarli yedi.'],
          ['Shartnomaga oldindan to‘lov (avans) shartini kiritish', 3, 17, 'Pul oqimi barqarorlashdi, kelgusi buyurtmalarda xavf kamaydi.'],
          ['Pul yetmasa ham, jamoani ishlatib turish', 0, 6, 'Xodimlar ish haqi kechikdi, ishga qiziqish pasaydi.'],
        ] },
      { title: 'Narx modeli', concept: 'Doimiy daromad',
        problem: 'Xizmatni qanday narxda taklif qilasiz?',
        options: [
          ['Bir martalik to‘lov', 4, 12, 'Daromad bir marta keladi: ertangi kun noaniq.'],
          ['Oylik obuna', 6, 19, 'Doimiy daromad oqimi: rejalashtirish osonlashdi.'],
          ['Bepul foydalanish va reklamadan daromad', 10, 8, 'Foydalanuvchi bor, ammo reklama daromadi xarajatni qoplamadi.'],
        ] },
      { title: 'Ma’lumotlar xavfsizligi', concept: 'Xavf va oldini olish',
        problem: 'Mijozlar ma’lumotlarini himoya qilish masalasi ko‘tarildi.',
        options: [
          ['Xavfsizlik auditini oldindan o‘tkazish', 8, 20, 'Mijozlar ishonchi oshdi, yangi shartnomalar tuzildi.'],
          ['Hech narsa qilmaslik (tavakkal)', 0, 20, 'Hammasi yaxshi o‘tsa foyda katta, ma’lumot chiqib ketsa yo‘qotish katta.', -14],
          ['Haddan tashqari qimmat himoya tizimi', 15, 19, 'Himoya yaxshi, lekin xarajat ehtiyojdan ancha ko‘p.'],
        ] },
      { title: 'Kengayish', concept: 'O‘sish yo‘nalishi',
        problem: 'Daromadingiz oshdi. Qaysi yo‘nalishda kengayasiz?',
        options: [
          ['Chet eldagi mijozlarga xizmat sotish', 12, 26, 'Katta bozor va yuqori narx: daromad oshdi.'],
          ['Butunlay boshqa mahsulot yaratish', 16, 22, 'Yangi mahsulot vaqt oladi: daromad kechikdi.'],
          ['Mavjud mijozlarga qo‘shimcha xizmat sotish', 3, 9, 'Xavfsiz, lekin o‘sish sekin.'],
        ] },
    ],
  },
];
