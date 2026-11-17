import type { MaterialCategoryId, MaterialFile, Sourced, TopicId } from '@/models';
import { appConfig } from '@/config/app.config';
import manifest from '@/data/generated/materials.manifest.json';

/**
 * O‘QUV MATERIALLARI SERVISI
 * Fayllar repozitoriyning public/materials/ papkasida saqlanadi.
 * Ro‘yxat build paytida scripts/build-materials-manifest.mjs tomonidan yaratiladi.
 * Server (3+ bosqich) paydo bo‘lganda faqat shu fayl ichi o‘zgaradi.
 */
const files = manifest.files as MaterialFile[];

/** Turkum → repozitoriydagi papka nomi */
const folderOf: Record<MaterialCategoryId, string> = { slides: 'taqdimotlar' };

export interface RepoInfo {
  owner: string;
  name: string;
  branch: string;
  url: string;
}

/** Repozitoriy manzilini aniqlash: konfiguratsiyadan yoki GitHub Pages manzilidan */
export function resolveRepo(): RepoInfo | null {
  const cfg = appConfig.repository;
  let owner = cfg.owner;
  let name = cfg.name;
  if (!owner && typeof location !== 'undefined' && location.hostname.endsWith('.github.io')) {
    owner = location.hostname.split('.')[0];
    const seg = location.pathname.split('/').filter(Boolean)[0];
    if (seg && seg !== 'index.html') name = seg;
  }
  if (!owner) return null;
  return { owner, name, branch: cfg.branch, url: `https://github.com/${owner}/${name}` };
}

function isPubliclyHosted() {
  if (typeof location === 'undefined') return false;
  const h = location.hostname;
  return location.protocol === 'https:' && !['localhost', '127.0.0.1'].includes(h) && !h.endsWith('.claudeusercontent.com');
}

export const materialsService = {
  list(topicId: TopicId, category: MaterialCategoryId = 'slides'): Sourced<MaterialFile[]> {
    return { data: files.filter((f) => f.topicId === topicId && f.category === category), origin: 'repository' };
  },

  countByTopic(category: MaterialCategoryId = 'slides'): Record<string, number> {
    const out: Record<string, number> = {};
    files.filter((f) => f.category === category).forEach((f) => (out[f.topicId] = (out[f.topicId] ?? 0) + 1));
    return out;
  },

  total(category: MaterialCategoryId = 'slides') {
    return files.filter((f) => f.category === category).length;
  },

  /** Faylni yuklab olish / ochish manzili */
  fileUrl(f: MaterialFile) {
    return `${import.meta.env.BASE_URL}${f.path}`;
  },

  /** Brauzerda ko‘rish manzili: PDF — to‘g‘ridan-to‘g‘ri; PPTX — Microsoft Office Online orqali (faqat ochiq saytda) */
  viewUrl(f: MaterialFile): string | null {
    if (f.ext === 'pdf') return this.fileUrl(f);
    if (!isPubliclyHosted()) return null;
    const abs = new URL(this.fileUrl(f), location.href.split('#')[0]).href;
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(abs)}`;
  },

  folderPath(topicId: TopicId, category: MaterialCategoryId = 'slides') {
    return `${appConfig.repository.materialsDir}/${topicId}/${folderOf[category]}`;
  },

  /** GitHub'dagi "fayl yuklash" sahifasi — shu mavzu papkasiga */
  uploadUrl(topicId: TopicId, category: MaterialCategoryId = 'slides'): string | null {
    const r = resolveRepo();
    return r ? `${r.url}/upload/${r.branch}/${this.folderPath(topicId, category)}` : null;
  },

  /** GitHub'dagi papka (fayllarni ko‘rish, o‘chirish, nomini o‘zgartirish) */
  folderUrl(topicId: TopicId, category: MaterialCategoryId = 'slides'): string | null {
    const r = resolveRepo();
    return r ? `${r.url}/tree/${r.branch}/${this.folderPath(topicId, category)}` : null;
  },
};

export function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}
