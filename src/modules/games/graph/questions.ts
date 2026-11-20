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
  { id: 1, prompt: 'Aholi daromadi biroz oshdi. Mahsulot odatiy tovar. Bozor muvozanatda.', answer: [1, 0, 0] },
  { id: 2, prompt: 'Ishlab chiqarishda ish haqi xarajati keskin oshdi. Narx muvozanatda.', answer: [0, -2, 0] },
  { id: 3, prompt: 'Yangi texnologiya ishlab chiqarishni biroz arzonlashtirdi. Narx muvozanatda.', answer: [0, 1, 0] },
  { id: 4, prompt: 'Moda o‘zgarib, xaridorlar qiziqishi keskin pasaydi. Narx muvozanatda.', answer: [-2, 0, 0] },
  { id: 5, prompt: 'Muqobil (o‘rnini bosuvchi) tovar narxi biroz oshdi. Shu tovarga talab o‘zgaradi. Narx muvozanatda.', answer: [1, 0, 0] },
  { id: 6, prompt: 'To‘ldiruvchi (komplementar) tovar narxi biroz oshdi. Shu tovarga talab o‘zgaradi. Narx muvozanatda.', answer: [-1, 0, 0] },
  { id: 7, prompt: 'Sotuvchilarga birlik solig‘i biroz oshirildi. Narx muvozanatda.', answer: [0, -1, 0] },
  { id: 8, prompt: 'Ishlab chiqaruvchilarga davlat subsidiyasi biroz berildi. Narx muvozanatda.', answer: [0, 1, 0] },
  { id: 9, prompt: 'Bozordagi xaridorlar soni keskin ortdi. Narx muvozanatda.', answer: [2, 0, 0] },
  { id: 10, prompt: 'Davlat narx shipini muvozanat narxidan past belgiladi. Talab va taklif o‘zgarmagan.', answer: [0, 0, -1] },
  { id: 11, prompt: 'Davlat narx poligini muvozanat narxidan yuqori belgiladi. Talab va taklif o‘zgarmagan.', answer: [0, 0, 1] },
  { id: 12, prompt: 'Talab ham, taklif ham biroz, bir xil kattalikda ortdi. Narx yangi muvozanatda.', answer: [1, 1, 0] },
  { id: 13, prompt: 'Talab keskin oshdi, taklif esa biroz oshdi. Narx yangi muvozanatda.', answer: [2, 1, 0] },
  { id: 14, prompt: 'Talab biroz kamaydi, taklif keskin kamaydi. Narx yangi muvozanatda.', answer: [-1, -2, 0] },
  { id: 15, prompt: 'Talab biroz oshdi, taklif esa xuddi shuncha kamaydi. Miqdor o‘zgarmadi. Narx yangi muvozanatda.', answer: [1, -1, 0] },
  { id: 16, prompt: 'Talab biroz kamaydi, taklif esa xuddi shuncha oshdi. Miqdor o‘zgarmadi. Narx yangi muvozanatda.', answer: [-1, 1, 0] },
  { id: 17, prompt: 'Yangi firmalar kirib, taklif keskin ortdi. Sotuvchilar narxni yangi muvozanatdan yuqori ushlab turibdi.', answer: [0, 2, 1] },
  { id: 18, prompt: 'Talab keskin oshdi, ammo narx yangi muvozanatdan past darajada qotirib qo‘yildi.', answer: [2, 0, -1] },
  { id: 19, prompt: 'Daromad keskin tushdi (odatiy tovar), texnologiya esa ishlab chiqarishni biroz arzonlashtirdi. Narx yangi muvozanatda.', answer: [-2, 1, 0] },
  { id: 20, prompt: 'Talab keskin pasaydi, davlat narxni yangi muvozanatdan yuqori saqlab turibdi.', answer: [-2, 0, 1] },
  { id: 21, prompt: 'Xarajatlar biroz oshdi (taklif kamaydi), davlat esa narxni yangi muvozanatdan past ushlab turishni talab qildi.', answer: [0, -1, -1] },
  { id: 22, prompt: 'Qurg‘oqchilikdan taklif keskin kamaydi, talab esa biroz oshdi. Narx yangi muvozanatda.', answer: [1, -2, 0] },
  { id: 23, prompt: 'Mavsum davomida talab ham, taklif ham keskin ortdi. Narx yangi muvozanatda.', answer: [2, 2, 0] },
  { id: 24, prompt: 'Daromad biroz kamaydi (odatiy tovar), import ko‘payib ichki taklif keskin ortdi. Narx yangi muvozanatda.', answer: [-1, 2, 0] },
  { id: 25, prompt: 'Narx oshishi kutilib talab keskin oshdi, sotuvchilar mahsulotni ushlab qolib taklifni biroz kamaytirdi. Narx yangi muvozanatda.', answer: [2, -1, 0] },
  { id: 26, prompt: 'Talab biroz oshdi, sotuvchilar esa narxni yangi muvozanatdan yuqori belgiladi.', answer: [1, 0, 1] },
  { id: 27, prompt: 'Taklif keskin kamaydi, davlat narxni yangi muvozanatdan past darajada ushlab turibdi.', answer: [0, -2, -1] },
  { id: 28, prompt: 'Iqtisodiy sustlashuvda talab ham, taklif ham biroz kamaydi. Narx yangi muvozanatda.', answer: [-1, -1, 0] },
  { id: 29, prompt: 'Taklif keskin ortdi, talab esa biroz oshdi. Narx yangi muvozanatda.', answer: [1, 2, 0] },
  { id: 30, prompt: 'Talab keskin oshdi, taklif esa xuddi shunchalik keskin kamaydi. Narx yangi muvozanatda.', answer: [2, -2, 0] },
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
