import { sectors as baseSectors, type Sector } from './scenarios';
import { extraSectors, extraStages } from './extra';

/** Barcha sohalar: asosiy + qo‘shimcha bosqichlar + yangi sohalar. Har jamoa uchun 6 ta bosqich tasodifiy tanlanadi. */
export const allSectors: Sector[] = [
  ...baseSectors.map(s => ({ ...s, stages: [...s.stages, ...(extraStages[s.id] ?? [])] })),
  ...extraSectors,
  {
    id: 'repair', name: 'Elektronika ta’mirlash', emoji: '🔧', blurb: 'Telefon va kompyuterlar servisi.', overhead: 3,
    stages: [
      { title: 'Ehtiyot qismlar', concept: 'Zaxira', problem: 'Yangi modelning ekraniga talab noma’lum.', options: [
        ['Faqat buyurtma tushganda sotib olish', 3, 8, 'Omborda sotilmay qoladigan zaxira yo‘q.'],
        ['Katta partiyani oldindan olish', 24, 36, 'Talab sust bo‘lsa, qimmat zaxiraning katta qismi sotilmaydi.', 3],
        ['Ikki model uchun kichik partiya olish', 8, 15, 'Talab bir necha modelga bo‘linadi.'],
      ] },
      { title: 'Kafolat', concept: 'Sifat', problem: 'Bir necha qayta murojaat bo‘ldi.', options: [
        ['Sinov uskunasini ijaraga olish', 5, 13, 'Nosozlik topshirishdan oldin aniqlanadi.'],
        ['Kafolatli ishni mutaxassisga topshirish', 8, 14, 'Xatolar kamayadi, xizmat haqi to‘lanadi.'],
        ['Tekshiruvsiz arzon xizmat taklif qilish', 2, 3, 'Takroriy murojaatlar daromadni kamaytiradi.'],
      ] },
      { title: 'Reklama', concept: 'Mijoz jalb qilish', problem: 'Yangi filialga mijoz kerak.', options: [
        ['Mahalliy reklama', 4, 10, 'Yaqin atrofdagi mijozlar keladi.'],
        ['Keng reklama kampaniyasi', 23, 34, 'Reklama buyurtmaga aylanmasa, sarf qoplanmaydi.', 2],
        ['Tavsiya uchun chegirma', 5, 13, 'Mavjud mijozlar yangi buyurtma olib keladi.'],
      ] },
      { title: 'Yetkazish', concept: 'Operatsion xarajat', problem: 'Mijozlar qurilmani uydan olib ketishni so‘ramoqda.', options: [
        ['Hamkor kuryerga buyurtma berish', 5, 12, 'Xarajat buyurtmalar soniga bog‘liq.'],
        ['Alohida transport ijarasi', 12, 19, 'Buyurtma kam bo‘lsa, ijara qoplanmaydi.', 5],
        ['Haftada ikki kun olib ketish', 4, 9, 'Safarlar birlashtiriladi.'],
      ] },
      { title: 'Kadrlar', concept: 'Mehnat unumdorligi', problem: 'Ta’mirlash navbati uzaydi.', options: [
        ['Buyurtma asosida usta jalb qilish', 7, 15, 'Quvvat tez oshadi.'],
        ['Xodimni yangi texnikaga o‘rgatish', 6, 12, 'Ta’mirlash tezlashadi.'],
        ['Mavsumga qimmat shartnoma tuzish', 17, 24, 'Navbat qisqarsa, shartnoma xarajati qoladi.', 8],
      ] },
      { title: 'Korporativ buyurtma', concept: 'Shartnoma', problem: 'Korxona o‘nlab qurilmani ta’mirlashni so‘radi.', options: [
        ['Avval kichik partiyada sinash', 5, 11, 'Ish hajmi aniqroq baholanadi.'],
        ['Hammasini qat’iy narxda olish', 18, 32, 'Yashirin nosozliklar marjani yo‘qqa chiqarishi mumkin.', 12],
        ['Ehtiyot qismlarni alohida hisoblash', 9, 19, 'Xarajat oshishi bo‘yicha xavf kamayadi.'],
      ] },
    ],
  },
  {
    id: 'logistics', name: 'Yetkazib berish xizmati', emoji: '🚚', blurb: 'Mahalliy yuk va buyurtmalar tashuvi.', overhead: 4,
    stages: [
      { title: 'Transport', concept: 'Ijara va doimiy xarajat', problem: 'Buyurtmalar soni mavsumga bog‘liq.', options: [
        ['Safar bo‘yicha transport yollash', 6, 14, 'Talab pasaysa, transport uchun ortiqcha to‘lov bo‘lmaydi.'],
        ['Oylik ijara olish', 24, 36, 'Buyurtmalar kamayganda ijara xarajati qoplanmaydi.', 4],
        ['Yetkazish kunlarini birlashtirish', 5, 12, 'Safar xarajati bir nechta buyurtmaga taqsimlanadi.'],
      ] },
      { title: 'Yo‘nalish', concept: 'Unumdorlik', problem: 'Yoqilg‘i narxi oshdi.', options: [
        ['Yo‘nalishlarni dastur bilan rejalash', 7, 16, 'Bo‘sh qatnovlar kamayadi.'],
        ['Tarifni keskin oshirish', 3, 13, 'Mijozlar ketib qolsa, tushum kamayadi.', 4],
        ['Hududlarni navbat bilan qamrash', 4, 11, 'Yoqilg‘i tejaladi, mijoz uzoqroq kutadi.'],
      ] },
      { title: 'Qadoqlash', concept: 'Sifat xarajati', problem: 'Mo‘rt yuk shikastlanmoqda.', options: [
        ['Himoyalovchi qadoq ishlatish', 6, 14, 'Qaytarish va shikoyatlar kamayadi.'],
        ['Eng arzon qadoqni tanlash', 2, 5, 'Shikastlanishdan yo‘qotishlar qoladi.'],
        ['Mo‘rt yukni hamkorga topshirish', 7, 13, 'Xizmat sifati hamkor ishiga bog‘liq.'],
      ] },
      { title: 'Katta mijoz', concept: 'Konsentratsiya xavfi', problem: 'Bitta do‘kon barcha quvvatni band qilmoqchi.', options: [
        ['Minimal hajm kafolati bilan kelishish', 8, 18, 'Eng kam tushum shartnomada belgilandi.'],
        ['Kafolatsiz kengayish', 16, 30, 'Do‘kon hajmni qisqartirishi mumkin.', 9],
        ['Bir nechta kichik do‘kon bilan ishlash', 6, 15, 'Tushum manbalari bir nechta bo‘ladi.'],
      ] },
      { title: 'Ta’mirlash', concept: 'Oldini olish xarajati', problem: 'Avtomobil tez-tez to‘xtab qolmoqda.', options: [
        ['Rejali texnik xizmat', 7, 15, 'Yetkazishdagi uzilishlar kamayadi.'],
        ['Ta’mirni kechiktirish', 1, 10, 'Nosozlik ortsa, buyurtmalar bekor bo‘ladi.', 0],
        ['Vaqtincha zaxira transport yollash', 9, 16, 'Buyurtmalar muddatida yetadi.'],
      ] },
      { title: 'Bayram mavsumi', concept: 'Talabni prognozlash', problem: 'Kelasi haftada buyurtma ko‘payishi kutilmoqda.', options: [
        ['Faqat oldindan buyurtma bo‘yicha quvvat oshirish', 6, 13, 'Xarajat tasdiqlangan hajmga mos.'],
        ['Katta jamoani oldindan yollash', 28, 41, 'Talab kelmasa, ish haqi xarajati qoplanmaydi.', 5],
        ['Hamkorlar bilan zaxira quvvat kelishuvi', 8, 17, 'Buyurtma oshganda qo‘shimcha quvvat ishga tushadi.'],
      ] },
    ],
  },
];
