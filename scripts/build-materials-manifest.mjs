#!/usr/bin/env node
/**
 * MATERIALLAR RO‘YXATINI YARATISH (manifest)
 * ------------------------------------------------------------
 * public/materials/<mavzu-id>/<turkum>/ papkalarini ko‘rib chiqadi va
 * src/data/generated/materials.manifest.json faylini yozadi.
 *
 * O‘qituvchi faqat faylni papkaga tashlaydi — ro‘yxatni qo‘lda tahrirlash shart emas.
 * Bu skript `npm run dev`, `npm run build` va `npm run typecheck` dan oldin avtomatik ishlaydi.
 */
import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MATERIALS = join(root, 'public', 'materials');
const OUT = join(root, 'src', 'data', 'generated', 'materials.manifest.json');

/** Turkum papkasi nomi → turkum identifikatori. Yangi tur qo‘shish uchun shu yerga yozing. */
const CATEGORIES = {
  taqdimotlar: { id: 'slides', extensions: ['.pptx', '.ppt', '.ppsx', '.pdf'] },
};
const TOPIC_RE = /^in[12]-t\d{2}$/;
const IGNORED = /^(readme\.md|\.gitkeep|\.ds_store|thumbs\.db)$/i;

function gitDate(file) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { cwd: root, encoding: 'utf8' }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function detectLang(name) {
  if (/(^|[\s_.()-])(ru|rus)([\s_.()-]|$)/i.test(name) || /[а-яё]/i.test(name)) return 'ru';
  return 'uz';
}

const files = [];
const warnings = [];

if (existsSync(MATERIALS)) {
  for (const topicId of readdirSync(MATERIALS).sort()) {
    const topicDir = join(MATERIALS, topicId);
    if (!statSync(topicDir).isDirectory()) continue;
    if (!TOPIC_RE.test(topicId)) {
      warnings.push(`Noma’lum mavzu papkasi: ${topicId}`);
      continue;
    }
    for (const folder of readdirSync(topicDir).sort()) {
      const catDir = join(topicDir, folder);
      if (!statSync(catDir).isDirectory()) continue;
      const cat = CATEGORIES[folder];
      if (!cat) {
        warnings.push(`Noma’lum turkum: ${topicId}/${folder}`);
        continue;
      }
      for (const fileName of readdirSync(catDir).sort((a, b) => a.localeCompare(b, 'uz', { numeric: true }))) {
        if (IGNORED.test(fileName) || fileName.startsWith('.')) continue;
        const full = join(catDir, fileName);
        if (!statSync(full).isFile()) continue;
        const ext = extname(fileName).toLowerCase();
        if (!cat.extensions.includes(ext)) {
          warnings.push(`Qo‘llab-quvvatlanmaydigan fayl turi o‘tkazib yuborildi: ${topicId}/${folder}/${fileName}`);
          continue;
        }
        const stat = statSync(full);
        const title = basename(fileName, extname(fileName)).replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
        files.push({
          topicId,
          category: cat.id,
          fileName,
          title,
          ext: ext.slice(1),
          lang: detectLang(title),
          size: stat.size,
          // public/ ichidagi nisbiy manzil (sayt ildiziga nisbatan)
          path: ['materials', topicId, folder, fileName].map(encodeURIComponent).join('/'),
          updatedAt: gitDate(full) ?? stat.mtime.toISOString(),
        });
      }
    }
  }
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2) + '\n');
console.log(`[materials] ${files.length} ta fayl ro‘yxatga olindi → src/data/generated/materials.manifest.json`);
warnings.forEach((w) => console.warn(`[materials] ogohlantirish: ${w}`));
