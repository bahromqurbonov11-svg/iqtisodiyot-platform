import { Presentation, FileText, Download, Eye, Upload, FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui';
import { materialsService, formatSize, formatDate } from '@/services/materials.service';
import { useAuth } from '@/services/auth/AuthContext';
import type { TopicId } from '@/models';

/**
 * Mavzu taqdimotlari ro‘yxati.
 * Fayllar haqiqiy (repozitoriydan) — DEMO emas.
 */
export function SlidesList({ topicId }: { topicId: TopicId }) {
  const { user } = useAuth();
  const files = materialsService.list(topicId).data;
  const isAdmin = user?.role === 'admin';
  const uploadUrl = materialsService.uploadUrl(topicId);

  if (!files.length) {
    return (
      <div className="slides-empty">
        <Presentation size={22} aria-hidden />
        <div>
          <strong>Hali taqdimot yuklanmagan</strong>
          <p className="small muted">O‘qituvchi taqdimot yuklagach, shu yerda ko‘rish va yuklab olish mumkin bo‘ladi.</p>
          {isAdmin && <AdminUploadHint topicId={topicId} uploadUrl={uploadUrl} />}
        </div>
      </div>
    );
  }

  return (
    <div className="stack stack--sm">
      <ul className="files">
        {files.map((f) => {
          const view = materialsService.viewUrl(f);
          const Icon = f.ext === 'pdf' ? FileText : Presentation;
          return (
            <li key={f.path} className="file">
              <span className={`file__icon file__icon--${f.ext}`}><Icon size={20} aria-hidden /></span>
              <div className="file__main">
                <strong>{f.title}</strong>
                <small className="muted">
                  {f.ext.toUpperCase()} · {formatSize(f.size)} · {formatDate(f.updatedAt)}
                </small>
              </div>
              {f.lang === 'ru' && <Badge tone="info">RU</Badge>}
              <div className="file__actions">
                {view && (
                  <a className="btn btn--secondary btn--sm" href={view} target="_blank" rel="noreferrer">
                    <Eye size={15} /> <span>Ko‘rish</span>
                  </a>
                )}
                <a className="btn btn--primary btn--sm" href={materialsService.fileUrl(f)} download={f.fileName}>
                  <Download size={15} /> <span>Yuklab olish</span>
                </a>
              </div>
            </li>
          );
        })}
      </ul>
      {isAdmin && <AdminUploadHint topicId={topicId} uploadUrl={uploadUrl} compact />}
    </div>
  );
}

function AdminUploadHint({ topicId, uploadUrl, compact }: { topicId: TopicId; uploadUrl: string | null; compact?: boolean }) {
  const folderUrl = materialsService.folderUrl(topicId);
  if (!uploadUrl) {
    return (
      <p className="xs muted mt-3">
        Administrator uchun: faylni repozitoriyning <code>{materialsService.folderPath(topicId)}</code> papkasiga qo‘shing.
        Sayt GitHub Pages’da ochilganda bu yerda to‘g‘ridan-to‘g‘ri “Yuklash” tugmasi paydo bo‘ladi.
      </p>
    );
  }
  return (
    <div className={`upload-actions${compact ? ' upload-actions--compact' : ''}`}>
      <a className="btn btn--accent btn--sm" href={uploadUrl} target="_blank" rel="noreferrer">
        <Upload size={15} /> <span>Taqdimot yuklash (GitHub)</span>
      </a>
      {folderUrl && (
        <a className="btn btn--ghost btn--sm" href={folderUrl} target="_blank" rel="noreferrer">
          <FolderOpen size={15} /> <span>Papkani ochish</span>
        </a>
      )}
    </div>
  );
}
