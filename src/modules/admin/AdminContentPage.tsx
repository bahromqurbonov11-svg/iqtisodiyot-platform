import { Link } from 'react-router-dom';
import { BookOpen, ClipboardCheck, Gamepad2, Upload, Presentation, FolderOpen, ExternalLink } from 'lucide-react';
import { PageHeader, Card, Badge, Notice, Button } from '@/components/ui';
import { catalogService } from '@/services/catalog.service';
import { materialsService, resolveRepo } from '@/services/materials.service';
import { appConfig } from '@/config/app.config';
import { games } from '@/data/games';
import { paths } from '@/navigation/paths';

export function AdminContentPage() {
  const topics = catalogService.getTopics().data;
  const counts = materialsService.countByTopic('slides');
  const total = materialsService.total('slides');
  const repo = resolveRepo();
  const withSlides = Object.keys(counts).length;

  return (
    <>
      <PageHeader
        eyebrow="Administrator paneli"
        title="Kontent boshqaruvi"
        description="Mavzular, taqdimotlar, test savollari va o‘yinlar holati."
        actions={
          repo ? (
            <a className="btn btn--secondary btn--md" href={`${repo.url}/tree/${repo.branch}/${appConfig.repository.materialsDir}`} target="_blank" rel="noreferrer">
              <FolderOpen size={16} /> <span>Barcha materiallar (GitHub)</span>
            </a>
          ) : undefined
        }
      />

      <Card title="Taqdimotni qanday yuklash mumkin" actions={<Presentation size={18} className="muted" />}>
        <ol className="plan plan--sm">
          <li><span>1</span>Quyidagi jadvalda kerakli mavzu qatoridagi <b>“Yuklash”</b> tugmasini bosing — GitHub’ning shu mavzu papkasi ochiladi.</li>
          <li><span>2</span>Faylni (.pptx, .ppt yoki .pdf) sahifaga sudrab tashlang. Fayl nomi saytda sarlavha bo‘ladi; ruscha bo‘lsa nomiga <code>RU</code> qo‘shing.</li>
          <li><span>3</span>Pastdagi yashil <b>“Commit changes”</b> tugmasini bosing.</li>
          <li><span>4</span>1–2 daqiqadan so‘ng sayt avtomatik yangilanadi va taqdimot mavzu sahifasida paydo bo‘ladi.</li>
        </ol>
        <p className="xs muted mt-3">
          Yuklash uchun GitHub hisobingizga kirgan va repozitoriyga yozish huquqiga ega bo‘lishingiz kerak — talabalar fayl qo‘sha olmaydi. O‘chirish yoki nomini o‘zgartirish: “Papka” tugmasi → faylni oching → ⋯ menyusidan “Delete file”. Bitta faylning hajmi 25 MB dan oshmasin.
          Katta taqdimotni PDF ko‘rinishida saqlash hajmni kamaytiradi va brauzerda ochilishini tezlashtiradi.
        </p>
        {!repo && (
          <Notice kind="info" title="Yuklash tugmalari GitHub Pages’da ishlaydi">
            Sayt hozir GitHub Pages’dan tashqarida ochilgan, shuning uchun repozitoriy manzili noma’lum. Fayllarni repozitoriyning{' '}
            <code>{appConfig.repository.materialsDir}/&lt;mavzu&gt;/taqdimotlar</code> papkasiga qo‘shing yoki{' '}
            <code>src/config/app.config.ts</code> faylida <code>repository.owner</code> ni to‘ldiring.
          </Notice>
        )}
      </Card>

      <div className="stats mt-5">
        <div className="stat"><div className="stat__top"><span className="stat__label">Mavzular</span><BookOpen size={18} /></div><div className="stat__value">25</div><div className="stat__hint">Sillabusdan yuklangan</div></div>
        <div className="stat stat--success"><div className="stat__top"><span className="stat__label">Taqdimotlar</span><Presentation size={18} /></div><div className="stat__value">{total}</div><div className="stat__hint">{withSlides}/25 mavzuda bor</div></div>
        <div className="stat stat--neutral"><div className="stat__top"><span className="stat__label">Test savollari</span><ClipboardCheck size={18} /></div><div className="stat__value">0</div><div className="stat__hint">4-bosqichda</div></div>
        <div className="stat stat--neutral"><div className="stat__top"><span className="stat__label">Faol o‘yinlar</span><Gamepad2 size={18} /></div><div className="stat__value">0/{games.length}</div><div className="stat__hint">5-bosqichdan</div></div>
      </div>

      <Card padded={false} className="mt-5">
        <div className="table-wrap table-wrap--flush">
          <table className="table">
            <thead>
              <tr><th>№</th><th>Mavzu</th><th>Taqdimotlar</th><th>Boshqa materiallar</th><th>Test</th><th className="right">Taqdimot yuklash</th></tr>
            </thead>
            <tbody>
              {topics.map((t) => {
                const n = counts[t.id] ?? 0;
                const up = materialsService.uploadUrl(t.id);
                const folder = materialsService.folderUrl(t.id);
                return (
                  <tr key={t.id}>
                    <td className="muted">{t.globalOrder}</td>
                    <td><Link to={paths.topic(t.id)} className="link">{t.title}</Link></td>
                    <td>{n ? <Badge tone="success">{n} ta</Badge> : <Badge>Yo‘q</Badge>}</td>
                    <td><Badge>2-bosqichda</Badge></td>
                    <td><Badge>4-bosqichda</Badge></td>
                    <td className="right">
                      {up ? (
                        <div className="row-actions">
                          <a className="chip-btn chip-btn--success" href={up} target="_blank" rel="noreferrer"><Upload size={14} /> Yuklash</a>
                          {folder && <a className="chip-btn" href={folder} target="_blank" rel="noreferrer" title="GitHub’dagi papka"><ExternalLink size={14} /> Papka</a>}
                        </div>
                      ) : (
                        <code className="xs muted">{t.id}/taqdimotlar</code>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Button to={paths.materials} variant="ghost" className="mt-4">Materiallar sahifasi</Button>
    </>
  );
}
