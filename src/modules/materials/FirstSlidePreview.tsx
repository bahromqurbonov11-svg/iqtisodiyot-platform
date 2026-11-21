import { useEffect, useRef, useState } from "react";
import { Presentation } from "lucide-react";
import { supabase } from "@/services/supabase";

export function FirstSlidePreview({ filePath, publicUrl, floating = false, fallbackTopic }: {
  filePath?: string; publicUrl?: string; floating?: boolean; fallbackTopic?: number;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if ((!filePath && !publicUrl) || !frame.current) return;
    let active = true;
    let previewUrl: string | undefined;

    async function load() {
      try {
        const bytes = filePath
          ? supabase.storage.from('learning-resources').download(filePath).then(({ data, error }) => {
              if (error || !data) throw new Error('Presentation unavailable');
              return data.arrayBuffer();
            })
          : fetch(publicUrl!).then((response) => {
              if (!response.ok) throw new Error('Presentation unavailable');
              return response.arrayBuffer();
            });
        const [buffer, { parse }, { renderSlide }] = await Promise.all([
          bytes, import('@pagus-kit/core'), import('@pagus-kit/renderer'),
        ]);
        if (!active) return;
        const deck = await parse(buffer);
        if (!active) return;
        if (!deck.slides[0]) throw new Error('No first slide');
        const { svg } = renderSlide(deck.slides[0], deck.slideSize);
        previewUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        setImageUrl(previewUrl);
      } catch {
        if (active) setFailed(true);
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void load();
    }, { rootMargin: '160px' });
    observer.observe(frame.current);
    return () => {
      active = false;
      observer.disconnect();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [filePath, publicUrl]);

  return (
    <div ref={frame} className={floating ? "topic-slide-preview" : undefined} style={{ aspectRatio: '16 / 9', display: 'grid', placeItems: 'center', overflow: 'hidden', background: 'var(--c-surface)', border: '1px solid var(--c-line)', borderRadius: 10 }}>
      {imageUrl && !failed ? (
        <img src={imageUrl} alt="Taqdimotning birinchi slaydi" onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      ) : fallbackTopic ? (
        <img src={import.meta.env.BASE_URL + 'slide-covers/' + fallbackTopic + '.svg'}
          alt={fallbackTopic + '-mavzu taqdimotining birinchi slaydi'} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      ) : <Presentation size={27} aria-label={failed ? 'Oldindan ko‘rish mavjud emas' : 'Taqdimot'} />}
    </div>
  );
}
