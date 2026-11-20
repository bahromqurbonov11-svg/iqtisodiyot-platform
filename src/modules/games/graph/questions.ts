/**
 * "Grafikni boshqar" o‘yini savollar banki (30 ta).
 * Javob vektori: [talab, taklif, narx]
 *  - talab/taklif: -2 keskin chapga, -1 biroz chapga, 0 o‘z joyida, 1 biroz o‘ngga, 2 keskin o‘ngga
 *  - narx: -1 yangi muvozanatdan past, 0 muvozanatda, 1 yangi muvozanatdan yuqori
 * Matnlarda "biroz" = 1 qadam, "keskin" = 2 qadam.
 */
export type Shift = -2 | -1 | 0 | 1 | 2;
export type PriceLevel = -1 | 0 | 1;
export interface GraphQuestion { id: number; prompt: string; answer: [Shift, Shift, PriceLevel] }

export const graphQuestions: GraphQuestion[] = [
  { id: 1, prompt: 'Aholi daromadi biroz oshdi (odatiy tovar), xaridorlar soni ham biroz ko‘paydi. Ikkala omil ham talab chizig‘ini o‘ngga siljitadi, ta’siri bir xil (har biri 1 qadam).', answer: [2, 0, 0] },
  { id: 2, prompt: 'Ish haqi xarajati keskin oshdi: bu taklif chizig‘ini chapga 2 qadam siljitadi. Ishlab chiqarishning yangi usuli xarajatni biroz kamaytirdi: bu taklif chizig‘ini o‘ngga 1 qadam siljitadi.', answer: [0, -1, 0] },
  { id: 3, prompt: 'Sotuvchilarga solinadigan soliq biroz oshdi (taklif chizig‘i 1 qadam chapga). Davlat har bir sotilgan birlik uchun ishlab chiqaruvchiga biroz yordam to‘laydi (taklif chizig‘i 1 qadam o‘ngga). Ikki ta’sir teng va qarama-qarshi.', answer: [0, 0, 0] },
  { id: 4, prompt: 'Almashtiriladigan tovar narxi biroz oshdi (bu tovarga talab 1 qadam o‘ngga). Birga ishlatiladigan tovar narxi ham biroz oshdi (bu tovarga talab 1 qadam chapga).', answer: [0, 0, 0] },
  { id: 5, prompt: 'Xaridorlar soni keskin kamaydi (talab 2 qadam chapga), aholi daromadi esa biroz oshdi (odatiy tovar, talab 1 qadam o‘ngga).', answer: [-1, 0, 0] },
  { id: 6, prompt: 'Narx pasayishi kutilib, xaridorlar xaridni biroz kechiktirdi; shu paytda xom ashyo biroz qimmatlashdi.', answer: [-1, -1, 0] },
  { id: 7, prompt: 'Aholi daromadi biroz oshdi. Bu tovar daromad oshganda talabi kamayadigan (past toifali) tovar, shu sababli daromadning oshishi talabni biroz (1 qadam) kamaytiradi.', answer: [-1, 0, 0] },
  { id: 8, prompt: 'Talab keskin oshdi. Narx talab oshishidan oldingi darajada qotirib qo‘yildi.', answer: [2, 0, -1] },
  { id: 9, prompt: 'Qurg‘oqchilikdan taklif keskin kamaydi. Narx qurg‘oqchilikdan oldingi darajada qotirib qo‘yildi.', answer: [0, -2, -1] },
  { id: 10, prompt: 'Talab keskin pasaydi. Narx pasayishdan oldingi darajada qotirib qo‘yildi.', answer: [-2, 0, 1] },
  { id: 11, prompt: 'Yangi korxonalar kirib, taklif keskin ortdi. Narx avvalgi darajada ushlab turilibdi.', answer: [0, 2, 1] },
  { id: 12, prompt: 'Talab biroz oshdi, taklif esa xuddi shuncha kamaydi. Narx yangi muvozanatda.', answer: [1, -1, 0] },
  { id: 13, prompt: 'Talab keskin oshdi, taklif esa biroz kamaydi. Narx yangi muvozanatda.', answer: [2, -1, 0] },
  { id: 14, prompt: 'Talab biroz kamaydi, taklif esa keskin ortdi. Narx yangi muvozanatda.', answer: [-1, 2, 0] },
  { id: 15, prompt: 'Talab biroz oshdi. Davlat narxning eng yuqori chegarasini yangi muvozanat narxidan yuqori qilib belgiladi.', answer: [1, 0, 0] },
  { id: 16, prompt: 'Aholi daromadi keskin oshdi (odatiy tovar, talab 2 qadam o‘ngga), xaridorlar soni biroz kamaydi (talab 1 qadam chapga); ishlab chiqarish xarajati biroz oshdi (taklif 1 qadam chapga).', answer: [1, -1, 0] },
  { id: 17, prompt: 'Talab biroz oshdi, taklif biroz kamaydi. Davlat narxni yangi muvozanatdan past qilib belgiladi.', answer: [1, -1, -1] },
  { id: 18, prompt: 'Talab keskin kamaydi. Davlat narxning eng past chegarasini yangi muvozanatdan yuqori qilib belgiladi.', answer: [-2, 0, 1] },
  { id: 19, prompt: 'Ishlab chiqaruvchiga solinadigan soliq keskin oshdi (taklif chizig‘i 2 qadam chapga), davlat yordamni biroz oshirdi (taklif chizig‘i 1 qadam o‘ngga).', answer: [0, -1, 0] },
  { id: 20, prompt: 'Yangi korxonalar kirdi (taklif 1 qadam o‘ngga), xom ashyo qimmatlashdi (taklif 1 qadam chapga), daromad keskin oshdi (odatiy tovar, talab 2 qadam o‘ngga).', answer: [2, 0, 0] },
  { id: 21, prompt: 'Bayram arafasida talab keskin oshdi. Ishlab chiqaruvchilar har bir narx darajasida avvalgidan keskin ko‘proq mahsulot taklif qila boshladi.', answer: [2, 2, 0] },
  { id: 22, prompt: 'Mahsulot sifatsiz deb e’lon qilinib talab keskin tushdi. Ishlab chiqaruvchilar har bir narx darajasida avvalgidan biroz kamroq mahsulot taklif qila boshladi.', answer: [-2, -1, 0] },
  { id: 23, prompt: 'Daromad keskin tushdi (odatiy tovar), yangi usul xarajatni biroz kamaytirdi. Davlat narxni yangi muvozanatdan yuqori ushlab turibdi.', answer: [-2, 1, 1] },
  { id: 24, prompt: 'Almashtiriladigan tovar narxi keskin oshdi; shu tovarning o‘ziga solinadigan soliq esa biroz oshdi.', answer: [2, -1, 0] },
  { id: 25, prompt: 'Qurg‘oqchilikdan taklif keskin kamaydi, talab esa biroz kamaydi. Narx yangi muvozanatda.', answer: [-1, -2, 0] },
  { id: 26, prompt: 'Talab ham, taklif ham biroz ortdi: ikkala chiziq ham bir xil miqdorda (1 qadam) o‘ngga siljidi. Narx yangi muvozanatdan past ushlab turilibdi.', answer: [1, 1, -1] },
  { id: 27, prompt: 'Narx oshishi kutilib xaridorlar oldindan xarid qildi (talab biroz oshdi), sotuvchilar esa mahsulotni ushlab qoldi (taklif biroz kamaydi). Davlat narxni yangi muvozanatdan yuqori qotirdi.', answer: [1, -1, 1] },
  { id: 28, prompt: 'Ish haqi keskin oshdi: xaridorlar daromadi biroz oshdi (odatiy tovar), ishlab chiqarish xarajati esa keskin oshdi. Narx yangi muvozanatda.', answer: [1, -2, 0] },
  { id: 29, prompt: 'Aholi soni keskin ortdi, ishlab chiqaruvchilarga beriladigan yordam ham keskin oshirildi. Narx yangi muvozanatda.', answer: [2, 2, 0] },
  { id: 30, prompt: 'Talab keskin oshdi, taklif keskin kamaydi. Narx yangi muvozanatdan past qilib ushlab turilibdi.', answer: [2, -2, -1] },
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
