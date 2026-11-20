-- Test bank tuzatishlari, 2-qism (2026-11-20 mazmun auditi asosida).
-- Faqat bank = 'iqtisodiyot-2026' (asosiy bank). Supabase SQL Editor'da bo'limlarni ketma-ket ishga tushiring.
-- Oldingi docs/test-bank-fixes.sql avval ishga tushirilgan bo'lishi kerak.
-- A: bahsli savollar o'chiriladi. B: "hamma javoblar to'g'ri" kabi variantli savollar o'chiriladi.
-- C: mazmunan takrorlangan savollarning ikkinchisi o'chiriladi. D: matn va variant tuzatishlari. E: mavzu bog'lanishi.
-- Eslatma: "eng uzun variant to'g'ri" qonuniyatiga tegilmadi (so'rovga ko'ra).

-- ===================== A: bahsli savollarni o'chirish =====================
begin;
delete from public.econ_test_questions
where bank = 'iqtisodiyot-2026' and source_number in (
  17,   -- klassik maktab asoschisi (Petti/Smit darslikka bog'liq)
  34,   -- nomoddiy xizmat / nomoddiy ishlab chiqarish: ikkala variant mumkin
  152,  -- qiyosiy narxlar: kalit va distraktor ma'nodosh
  237,  -- barqarorlashtirish maqsadi: bir nechta javob to'g'ri
  238,  -- qiyosiy narxlar (152 bilan bir xil muammo)
  246,  -- "sof daromad" atamasi 397 ("ixtiyordagi daromad") bilan zid
  255,  -- aylanma ta'rif
  282,  -- "sof daromad" (246 bilan bir xil)
  285,  -- "70 miqdor qoidasi": nostandart nom, to'qima variantlar
  315,  -- barqarorlashtirish maqsadi (237 bilan bir xil)
  357,  -- budjet "nechta qism": bo'linish noaniq
  384,  -- tartibga solish shakllari: noaniq
  387,  -- "birinchi bo'lib" Smit: Kene va Gurne oldin aytgan
  421, 422, 423, -- qat'iy va moslashuvchan integratsiya: umumiy manbalarda tasdiqlanmagan
  459   -- Ibn Xaldun "birinchi bo'lib": tarixan bahsli
);
commit;

-- ===================== B: "hamma javoblar to'g'ri" / "to'g'ri javob yo'q" turidagi savollar =====================
begin;
delete from public.econ_test_questions
where bank = 'iqtisodiyot-2026' and source_number in (4, 15, 43, 59, 60, 61, 74, 87, 134, 135, 193, 222);
commit;

-- ===================== C: mazmunan takrorlangan savollarning ikkinchisi =====================
begin;
delete from public.econ_test_questions
where bank = 'iqtisodiyot-2026' and source_number in (
  89,   -- 73 bilan bir xil
  127,  -- 126 bilan bir xil
  180,  -- 41 bilan bir xil
  189,  -- 177 bilan bir xil
  256,  -- 248 bilan bir xil
  259,  -- 242 bilan bir xil
  303,  -- 290 bilan bir xil
  306,  -- 289 bilan bir xil
  321,  -- 308 bilan bir xil
  323,  -- 10 bilan bir xil
  335,  -- 334 bilan bir xil
  336,  -- 328 bilan bir xil
  385,  -- 138 bilan bir xil
  420,  -- 419 bilan bir xil
  426,  -- 11 bilan bir xil
  460,  -- 179 bilan bir xil
  463   -- 6 bilan bir xil
);
commit;

-- ===================== D: matn va variant tuzatishlari =====================
begin;

-- №450: float ko'rinishi
update public.econ_test_questions set options = array_replace(options, '16.666666666666668%', '16,7%')
where bank = 'iqtisodiyot-2026' and source_number = 450;

-- №71: variant ichida vergul tushib qolgan
update public.econ_test_questions set options[1] = regexp_replace(options[1], '^ishlab chiqarish taqsimlash', 'ishlab chiqarish, taqsimlash')
where bank = 'iqtisodiyot-2026' and source_number = 71;

-- №340: ortiqcha ";;"
update public.econ_test_questions set options[1] = replace(options[1], ';;', '')
where bank = 'iqtisodiyot-2026' and source_number = 340;

-- №38: mazmunsiz variant
update public.econ_test_questions set options = array_replace(options, 'hufyona mahsulot', 'yalpi mahsulot')
where bank = 'iqtisodiyot-2026' and source_number = 38;

-- №345: "Irrigasiya" (migrasiya bilan bog'liq emas) -> mantiqiy distraktor
update public.econ_test_questions set options = array_replace(options, 'Irrigasiya', 'Repatriasiya')
where bank = 'iqtisodiyot-2026' and source_number = 345;

-- №365: to'qima variant
update public.econ_test_questions set options = array_replace(options, 'avtomobil', 'xorijiy grantlar')
where bank = 'iqtisodiyot-2026' and source_number = 365;

-- №464: "baho" ehtiyojga aloqasiz
update public.econ_test_questions set options = array_replace(options, 'baho', 'daromad')
where bank = 'iqtisodiyot-2026' and source_number = 464;

-- №326: to'qima nomlar o'rniga haqiqiy sikl turlari (kalit 1-variantda qoladi)
update public.econ_test_questions set
  options[2] = $q$“Juglar sikli”, asoschisi Klement Juglar$q$,
  options[3] = $q$“Kondratev sikli”, asoschisi Nikolay Kondratev$q$,
  options[4] = $q$“Kuznes sikli”, asoschisi Saymon Kuznes$q$
where bank = 'iqtisodiyot-2026' and source_number = 326;

-- №218, №219: mazmunsiz distraktorlar o'rniga yer huquqlariga oid variantlar
update public.econ_test_questions set
  options[2] = $q$yerni o‘z xohishicha sotish, garovga qo‘yish va ijaraga berish huquqi$q$,
  options[3] = $q$yerga mulkchilik huquqini rasmiylashtirish$q$,
  options[4] = $q$yerdan olinadigan rentani to‘liq davlatga topshirish majburiyati$q$
where bank = 'iqtisodiyot-2026' and source_number = 218;
update public.econ_test_questions set
  options[2] = $q$yerdan faqat vaqtincha foydalanish huquqi$q$,
  options[3] = $q$yerni o‘z xohishicha sotish va garovga qo‘yish huquqi$q$,
  options[4] = $q$yerga nisbatan faqat soliq to‘lash majburiyati$q$
where bank = 'iqtisodiyot-2026' and source_number = 219;

-- №455: D varianti A bilan deyarli bir xil edi
update public.econ_test_questions set
  options[4] = $q$talab miqdorini narxga ko‘paytirish orqali$q$
where bank = 'iqtisodiyot-2026' and source_number = 455;

-- №457: B varianti ham to'g'ri edi (normal tovarlar)
update public.econ_test_questions set
  options[2] = $q$Daromadga bog‘liq bo‘lmagan tovarlarga$q$
where bank = 'iqtisodiyot-2026' and source_number = 457;

commit;

-- ===================== E: mavzu bog'lanishi =====================
begin;

-- Noto'g'ri bog'langan: №128 (talab chizig'i -> 6), №220 (renta -> 12)
update public.econ_test_questions set topic = 6  where bank = 'iqtisodiyot-2026' and source_number = 128;
update public.econ_test_questions set topic = 12 where bank = 'iqtisodiyot-2026' and source_number = 220;

-- Mavzusi bo'sh savollarga mavzu beriladi (faqat topic is null bo'lganlar)
update public.econ_test_questions q set topic = v.t
from (values
  -- 1-mavzu: fan predmeti, ehtiyoj, cheklanganlik, maktablar, qonunlar
  (10,1),(11,1),(13,1),(14,1),(16,1),(19,1),(20,1),(21,1),(24,1),(26,1),(27,1),(28,1),(29,1),(390,1),(427,1),(464,1),
  (438,1),(449,1),(440,1),(441,1),(446,1),(447,1),(481,1),(482,1),
  -- 2-mavzu: ishlab chiqarish natijalari
  (36,2),(37,2),(40,2),(42,2),
  -- 5-mavzu: bozor
  (68,5),(70,5),(72,5),(73,5),(75,5),(76,5),(79,5),(81,5),(82,5),(83,5),(84,5),(85,5),(88,5),
  (91,5),(92,5),(93,5),(94,5),(95,5),(96,5),(108,5),(117,5),
  -- 6-mavzu: talab, taklif, elastiklik
  (436,6),(448,6),(483,6),(451,6),(490,6),(458,6),(456,6),(457,6),
  -- 11-mavzu: xarajat va foyda
  (176,11),(178,11),(179,11),(181,11),(182,11),(185,11),(186,11),(190,11),(191,11),
  (443,11),(450,11),(477,11),(478,11),(479,11),
  -- 12-mavzu: agrar munosabatlar va renta
  (217,12),(223,12),(225,12),
  -- 13, 14, 15, 16-mavzular
  (254,13),(253,14),(274,15),
  (288,16),(300,16),(445,16),(465,16),(466,16),(467,16),(468,16),(469,16),(470,16),(480,16),
  -- 18-mavzu: sikl, inqiroz, inflyatsiya
  (326,18),(327,18),(328,18),(339,18),(344,18),(354,18),(372,18),
  -- 23, 24-mavzular
  (410,23),(418,24)
) as v(n, t)
where q.bank = 'iqtisodiyot-2026' and q.source_number = v.n and q.topic is null;

commit;

-- Tekshirish (ixtiyoriy): bankda qolgan savollar soni va mavzusizlari
-- select count(*) as jami, count(*) filter (where topic is null) as mavzusiz from public.econ_test_questions;
