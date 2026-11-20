/**
 * "Grafikni boshqar" o‘yini savollar banki (30 ta).
 * Javob vektori: [talab, taklif, narx]
 *  - talab/taklif: -2 keskin chapga, -1 biroz chapga, 0 o‘z joyida, 1 biroz o‘ngga, 2 keskin o‘ngga
 *  - narx: avvalgi narxga nisbatan -1 pasayadi, 0 o‘zgarmaydi, 1 oshadi (erkin bozorda = sign(talab − taklif); davlat narx belgilasa — savolda aytilgan)
 * Matnlarda "biroz" = 1 qadam, "keskin" = 2 qadam (qadam sonlari matnda ko‘rsatilmaydi — javobni o‘quvchi chiqaradi).
 */
export type Shift = -2 | -1 | 0 | 1 | 2;
export type PriceLevel = -1 | 0 | 1;
export interface GraphQuestion { id: number; prompt: string; answer: [Shift, Shift, PriceLevel] }

export const graphQuestions: GraphQuestion[] = [
  { id: 1, prompt: 'Aholi daromadi biroz oshdi (odatiy tovar). Shu bilan birga xaridorlar soni ham biroz ko‘paydi. Ikkala omilning kuchi bir xil. Narx bozorda erkin shakllanadi.', answer: [2, 0, 1] },
  { id: 2, prompt: 'Ish haqi xarajati keskin oshdi. Shu paytda ishlab chiqarishning yangi usuli xarajatni biroz kamaytirdi. Narx bozorda erkin shakllanadi.', answer: [0, -1, 1] },
  { id: 3, prompt: 'Sotuvchilarga solinadigan soliq biroz oshdi. Shu bilan birga davlat ishlab chiqaruvchiga xuddi shuncha miqdorda yordam to‘ladi. Narx bozorda erkin shakllanadi.', answer: [0, 0, 0] },
  { id: 4, prompt: 'Almashtiriladigan tovar narxi biroz oshdi. Shu paytda birga ishlatiladigan tovar narxi ham biroz oshdi. Ikkala ta’sirning kuchi bir xil. Narx bozorda erkin shakllanadi.', answer: [0, 0, 0] },
  { id: 5, prompt: 'Xaridorlar soni keskin kamaydi, aholi daromadi esa biroz oshdi (odatiy tovar). Narx bozorda erkin shakllanadi.', answer: [-1, 0, -1] },
  { id: 6, prompt: 'Narx pasayishi kutilib, xaridorlar xaridni biroz kechiktirdi; shu paytda xom ashyo biroz qimmatlashdi. Narx bozorda erkin shakllanadi.', answer: [-1, -1, 0] },
  { id: 7, prompt: 'Aholi daromadi biroz oshdi. Bu past toifali tovar: daromad oshganda unga talab kamayadi. Narx bozorda erkin shakllanadi.', answer: [-1, 0, -1] },
  { id: 8, prompt: 'Talab keskin oshdi. Davlat narxni avvalgi darajada ushlab turdi.', answer: [2, 0, 0] },
  { id: 9, prompt: 'Qurg‘oqchilikdan taklif keskin kamaydi. Davlat narxni avvalgi darajada ushlab turdi.', answer: [0, -2, 0] },
  { id: 10, prompt: 'Talab keskin pasaydi. Davlat narxni avvalgi darajada ushlab turdi.', answer: [-2, 0, 0] },
  { id: 11, prompt: 'Yangi korxonalar kirib, taklif keskin ortdi. Davlat narxni avvalgi darajada ushlab turdi.', answer: [0, 2, 0] },
  { id: 12, prompt: 'Talab biroz oshdi, taklif esa xuddi shuncha kamaydi. Narx bozorda erkin shakllanadi.', answer: [1, -1, 1] },
  { id: 13, prompt: 'Talab keskin oshdi, taklif esa biroz kamaydi. Narx bozorda erkin shakllanadi.', answer: [2, -1, 1] },
  { id: 14, prompt: 'Talab biroz kamaydi, taklif esa keskin ortdi. Narx bozorda erkin shakllanadi.', answer: [-1, 2, -1] },
  { id: 15, prompt: 'Talab biroz oshdi. Davlat narxning eng yuqori chegarasini bozor narxi yetib bora olmaydigan darajada baland qilib belgiladi (narx erkin shakllanadi).', answer: [1, 0, 1] },
  { id: 16, prompt: 'Aholi daromadi keskin oshdi (odatiy tovar), xaridorlar soni biroz kamaydi, ishlab chiqarish xarajati esa biroz oshdi. Narx bozorda erkin shakllanadi.', answer: [1, -1, 1] },
  { id: 17, prompt: 'Talab biroz oshdi, taklif biroz kamaydi. Davlat narxni avvalgisidan pastroq qilib belgiladi.', answer: [1, -1, -1] },
  { id: 18, prompt: 'Talab keskin kamaydi. Davlat narxni avvalgisidan yuqori qilib qotirdi (eng past chegara).', answer: [-2, 0, 1] },
  { id: 19, prompt: 'Ishlab chiqaruvchiga solinadigan soliq keskin oshdi, davlat esa yordamni biroz oshirdi. Narx bozorda erkin shakllanadi.', answer: [0, -1, 1] },
  { id: 20, prompt: 'Yangi korxonalar bozorga kirdi, xom ashyo qimmatlashdi, aholi daromadi esa keskin oshdi (odatiy tovar). Korxonalar kirishi va xom ashyo qimmatlashishining ta’siri teng kuchli. Narx bozorda erkin shakllanadi.', answer: [2, 0, 1] },
  { id: 21, prompt: 'Bayram arafasida talab keskin oshdi. Ishlab chiqaruvchilar har bir narx darajasida avvalgidan keskin ko‘proq mahsulot taklif qila boshladi. Narx bozorda erkin shakllanadi.', answer: [2, 2, 0] },
  { id: 22, prompt: 'Mahsulot sifatsiz deb e’lon qilinib, talab keskin tushdi. Ishlab chiqaruvchilar har bir narx darajasida avvalgidan biroz kamroq taklif qila boshladi. Narx bozorda erkin shakllanadi.', answer: [-2, -1, -1] },
  { id: 23, prompt: 'Daromad keskin tushdi (odatiy tovar), yangi usul xarajatni biroz kamaytirdi. Davlat narxni avvalgisidan yuqori qilib qotirib qo‘ydi.', answer: [-2, 1, 1] },
  { id: 24, prompt: 'Almashtiriladigan tovar narxi keskin oshdi; shu tovarning o‘ziga solinadigan soliq esa biroz oshdi. Narx bozorda erkin shakllanadi.', answer: [2, -1, 1] },
  { id: 25, prompt: 'Qurg‘oqchilikdan taklif keskin kamaydi, talab esa biroz kamaydi. Narx bozorda erkin shakllanadi.', answer: [-1, -2, 1] },
  { id: 26, prompt: 'Talab ham, taklif ham biroz ortdi, ikkalasining o‘zgarishi teng. Davlat narxni avvalgisidan pastroq qilib belgiladi.', answer: [1, 1, -1] },
  { id: 27, prompt: 'Narx oshishi kutilib xaridorlar oldindan xarid qildi (talab biroz oshdi), sotuvchilar esa mahsulotni ushlab qoldi (taklif biroz kamaydi). Davlat narxni avvalgi darajada qotirdi.', answer: [1, -1, 0] },
  { id: 28, prompt: 'Ish haqi keskin oshdi: xaridorlar daromadi biroz oshdi (odatiy tovar), ishlab chiqarish xarajati esa keskin oshdi. Narx bozorda erkin shakllanadi.', answer: [1, -2, 1] },
  { id: 29, prompt: 'Aholi soni keskin ortdi, ishlab chiqaruvchilarga beriladigan yordam ham keskin oshirildi. Narx bozorda erkin shakllanadi.', answer: [2, 2, 0] },
  { id: 30, prompt: 'Talab keskin oshdi, taklif keskin kamaydi. Davlat narxni avvalgisidan pastroq qilib ushlab turdi.', answer: [2, -2, -1] },
];

/** 30 ta savoldan tasodifiy 10 tasini tanlaydi (Fisher–Yates). */
export function pickQuestions(count = 10): GraphQuestion[] {
  const list = [...graphQuestions];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list.slice(0, count);
}
