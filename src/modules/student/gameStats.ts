/**
 * O‘yin natijalarining qurilmadagi qaydi (nishonlar uchun).
 * Eslatma: bu ma’lumot faqat shu brauzerda saqlanadi; server reytingi va hisobotlariga ta’sir qilmaydi.
 */
export type GameKey = 'runner' | 'target' | 'matching' | 'situation' | 'graph' | 'graphwin';
export interface GameRecord { game: GameKey; score: number; total: number; at: string }

const keyFor = (userId: string) => 'econ-games-' + userId;

export function loadGameRecords(userId: string): GameRecord[] {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as GameRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveGameRecord(userId: string, record: Omit<GameRecord, 'at'>) {
  try {
    const list = loadGameRecords(userId);
    list.push({ ...record, at: new Date().toISOString() });
    localStorage.setItem(keyFor(userId), JSON.stringify(list.slice(-200)));
  } catch {
    /* brauzer xotirasi yopiq bo‘lsa, nishon hisoblanmaydi — o‘yin buzilmasin */
  }
}
