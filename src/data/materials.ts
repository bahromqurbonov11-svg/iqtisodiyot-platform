/**
 * O‘quv materiallari turlari.
 * Fayllar 2-bosqichda ulanadi. Bu yerda faqat turlar va ularning holati.
 * "knownInProject" — Claude loyihasida mavjudligi aniqlangan, lekin hali
 * saytga ulanmagan materiallar soni (taxminiy hisob emas, aniq fayllar).
 */
export interface MaterialCategory {
  id: string;
  title: string;
  description: string;
  icon: 'BookOpen' | 'Presentation' | 'FileQuestion' | 'Briefcase' | 'BookA' | 'Languages' | 'ScrollText' | 'TrendingUp';
  knownInProject?: string;
}

export const materialCategories: MaterialCategory[] = [
  { id: 'literature', title: 'Adabiyotlar', description: 'Soliq oliy maktabi kutubxonasidagi darsliklar va qo‘shimcha adabiyotlar.', icon: 'BookA' },
  { id: 'syllabus', title: 'Sillabuslar', description: 'IN-1 va IN-2 fan dasturlari (o‘zbek va rus tillarida).', icon: 'ScrollText', knownInProject: '4 ta fayl (UZ/RU)' },
  { id: 'lectures', title: 'Ma’ruza matnlari', description: 'Har bir mavzu bo‘yicha asosiy nazariy material.', icon: 'BookOpen', knownInProject: 'RU: 12 ta mavzu matni' },
  { id: 'slides', title: 'Taqdimotlar', description: 'Ma’ruza slaydlari (PPTX).', icon: 'Presentation', knownInProject: 'RU: 12 ta, UZ: alohida mavzular' },
  { id: 'cases', title: 'Keyslar', description: 'Amaliy vaziyatlar va infografikalar.', icon: 'Briefcase', knownInProject: '1-keys (matn + infografika)' },
  { id: 'tests', title: 'Test to‘plamlari', description: 'Diagnostik testlar uchun asos bo‘ladigan savollar banki.', icon: 'FileQuestion', knownInProject: '4 ta to‘plam + kalitlar' },
  { id: 'glossary', title: 'Glossariy', description: 'Asosiy iqtisodiy tushunchalar lug‘ati.', icon: 'BookA' },
  { id: 'research', title: 'Zamonaviy tadqiqotlar', description: 'Iqtisodiyotga oid zamonaviy tadqiqotlar va ilmiy maqolalar.', icon: 'TrendingUp' },
];
