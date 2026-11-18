
import { useEffect, useState, type FormEvent } from 'react';
import {
  BookOpen,
  Upload,
  FileText,
  RefreshCw,
  Trash2,
  Download,
} from 'lucide-react';
import { PageHeader, Card, Button } from '@/components/ui';
import { catalogService } from '@/services/catalog.service';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/services/auth/AuthContext';
import { paths } from '@/navigation/paths';

type Resource = {
  id: string;
  title: string;
  description: string | null;
  topic_name: string | null;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
};

const BUCKET = 'learning-resources';
const MAX_SIZE = 25 * 1024 * 1024;

export function AdminContentPage() {
  const { user } = useAuth();
  const topics = catalogService.getTopics().data;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topicName, setTopicName] = useState('');
  const [kind, setKind] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadResources() {
    setLoading(true);

    const { data, error: loadError } = await supabase
      .from('learning_resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (loadError) {
      setError(loadError.message);
    } else {
      setResources((data ?? []) as Resource[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadResources();
  }, []);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!user || user.role !== 'admin') {
      setError('Faqat administrator resurs yuklay oladi.');
      return;
    }

    if (!title.trim() || !topicName || !kind || !file) {
      setError('Resurs nomi, mavzu, turi va faylni kiriting.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('Fayl hajmi 25 MB dan oshmasligi kerak.');
      return;
    }

    setUploading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error('Qayta tizimga kiring.');
      }

      const extension =
        file.name.split('.').pop()?.toLowerCase() || 'bin';

      const filePath =
        `${topicName}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('learning_resources')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          topic_name: topicName,
          material_kind: kind,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type || null,
          file_size: file.size,
          uploaded_by: authData.user.id,
        });

      if (insertError) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove([filePath]);

        if (cleanupError) {
          console.error('Faylni tozalashda xatolik:', cleanupError);
        }

        throw insertError;
      }

      setTitle('');
      setKind('');
      setDescription('');
      setTopicName('');
      setFile(null);
      setFileInputKey((value) => value + 1);
      setMessage('Resurs muvaffaqiyatli yuklandi.');

      await loadResources();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Resursni yuklashda xatolik yuz berdi.'
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(resource: Resource) {
    setError('');

    const { data, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(resource.file_path, 60, {
        download: resource.file_name,
      });

    if (downloadError || !data?.signedUrl) {
      setError(downloadError?.message || 'Faylni ochib bo‘lmadi.');
      return;
    }

    const link = document.createElement('a');
    link.href = data.signedUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function handleDelete(resource: Resource) {
    if (user?.role !== 'admin') {
      setError('Faqat administrator resurs o‘chira oladi.');
      return;
    }

    if (!window.confirm(`"${resource.title}" resursi o‘chirilsinmi?`)) {
      return;
    }

    setError('');
    setMessage('');

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([resource.file_path]);

    if (storageError) {
      setError(storageError.message);
      return;
    }

    const { error: deleteError } = await supabase
      .from('learning_resources')
      .delete()
      .eq('id', resource.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage('Resurs o‘chirildi.');
    await loadResources();
  }

  function formatSize(size: number | null) {
    if (size === null) return '—';
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }

  return (
    <>
      <PageHeader
        eyebrow="Administrator paneli"
        title="Kontent boshqaruvi"
        description="O‘quv resurslarini yuklash va boshqarish."
      />

      <Card title="Yangi resurs yuklash" className="mt-5">
        <form onSubmit={handleUpload}>
          <div className="mt-3">
            <label htmlFor="resource-title">
              Resurs nomi
            </label>
            <input
              id="resource-title"
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Masalan: Talab va taklif mavzusi"
              required
            />
          </div>

          <div className="mt-3">
            <label htmlFor="resource-topic">
              Mavzu
            </label>
            <select
              id="resource-topic"
              className="input"
              value={topicName}
              onChange={(event) => setTopicName(event.target.value)}
              required
            >
              <option value="">Mavzuni tanlang</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.globalOrder}. {topic.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3">
            <label htmlFor="resource-kind">Material turi</label>
            <select id="resource-kind" className="input" value={kind} onChange={(event) => setKind(event.target.value)} required>
              <option value="">Turini tanlang</option>
              <option value="slides">Taqdimot</option>
              <option value="lecture">Ma’ruza</option>
              <option value="glossary">Glossariy</option>
              <option value="case">Keys / amaliy topshiriq</option>
            </select>
          </div>

          <div className="mt-3">
            <label htmlFor="resource-description">
              Tavsif
            </label>
            <textarea
              id="resource-description"
              className="input"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Resurs haqida qisqacha ma’lumot"
              rows={3}
            />
          </div>

          <div className="mt-3">
            <label htmlFor="resource-file">
              Fayl tanlash
            </label>
            <input
              key={fileInputKey}
              id="resource-file"
              type="file"
              className="input"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
              onChange={(event) =>
                setFile(event.target.files?.[0] ?? null)
              }
              required
            />
            <p className="small muted">
              Maksimal hajm: 25 MB.
            </p>
          </div>

          {error && (
            <p className="text-danger mt-3" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="text-success mt-3" role="status">
              {message}
            </p>
          )}

          <div className="mt-4">
            <button
              type="submit"
              className="btn btn--primary btn--md"
              disabled={uploading}
            >
              <Upload size={16} />
              {uploading ? 'Yuklanmoqda...' : 'Resursni yuklash'}
            </button>
          </div>
        </form>
      </Card>

      <div className="stats mt-5">
        <div className="stat">
          <div className="stat__top">
            <span className="stat__label">
              Mavzular
            </span>
            <BookOpen size={18} />
          </div>
          <div className="stat__value">
            {topics.length}
          </div>
        </div>

        <div className="stat stat--success">
          <div className="stat__top">
            <span className="stat__label">
              Yuklangan resurslar
            </span>
            <FileText size={18} />
          </div>
          <div className="stat__value">
            {resources.length}
          </div>
        </div>
      </div>

      <Card title="Yuklangan resurslar" className="mt-5">
        <button
          type="button"
          className="btn btn--secondary btn--md"
          onClick={() => void loadResources()}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Yangilash
        </button>

        {loading ? (
          <p className="muted mt-3">
            Resurslar yuklanmoqda...
          </p>
        ) : resources.length === 0 ? (
          <p className="muted mt-3">
            Hozircha resurs yuklanmagan.
          </p>
        ) : (
          <div className="table-wrap mt-3">
            <table className="table">
              <thead>
                <tr>
                  <th>Resurs nomi</th>
                  <th>Mavzu</th>
                  <th>Hajmi</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => {
                  const topic = topics.find(
                    (item) => item.id === resource.topic_name
                  );

                  return (
                    <tr key={resource.id}>
                      <td>
                        <strong>{resource.title}</strong>
                        <div className="small muted">
                          {resource.file_name}
                        </div>
                      </td>
                      <td>
                        {topic?.title || resource.topic_name || '—'}
                      </td>
                      <td>
                        {formatSize(resource.file_size)}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="chip-btn"
                            onClick={() =>
                              void handleDownload(resource)
                            }
                          >
                            <Download size={14} />
                            Yuklab olish
                          </button>

                          <button
                            type="button"
                            className="chip-btn"
                            onClick={() =>
                              void handleDelete(resource)
                            }
                          >
                            <Trash2 size={14} />
                            O‘chirish
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Button
        to={paths.materials}
        variant="ghost"
        className="mt-4"
      >
        Materiallar sahifasi
      </Button>
    </>
  );
}
