import { useState } from 'react';
import { X, Construction } from 'lucide-react';
import { appConfig } from '@/config/app.config';

/** Sayt tepasidagi ingichka ogohlantirish: loyiha qaysi bosqichda ekanini ochiq aytadi */
export function StageStrip() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="stage-strip" role="status">
      <div className="container stage-strip__inner">
        <Construction size={15} aria-hidden />
        <span>
          <strong>{appConfig.stage}-bosqich — sayt skeleti.</strong> Kirish, testlarni baholash va o‘yinlar hali ishlamaydi.
          Namunaviy raqamlar <b>DEMO</b> deb belgilangan.
        </span>
        <button className="stage-strip__close" aria-label="Yopish" onClick={() => setHidden(true)}>
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
