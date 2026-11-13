import { Link } from 'react-router-dom';
import { Brand } from '@/components/Brand';
import { paths } from '@/navigation/paths';
import { appConfig } from '@/config/app.config';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__about">
          <Brand />
          <p className="muted small">
            {appConfig.organization.name}. Fan kodi {appConfig.subject.code}. Platforma talabalar bilimidagi bo‘shliqlarni aniqlash
            va o‘qituvchiga tahliliy ma’lumot berish uchun ishlab chiqilmoqda.
          </p>
        </div>
        <div>
          <h4>O‘qish</h4>
          <ul>
            <li><Link to={paths.topics}>Mavzular katalogi</Link></li>
            <li><Link to={paths.materials}>O‘quv materiallari</Link></li>
            <li><Link to={paths.about}>Fan haqida</Link></li>
          </ul>
        </div>
        <div>
          <h4>Tekshirish</h4>
          <ul>
            <li><Link to={paths.tests}>Diagnostik testlar</Link></li>
            <li><Link to={paths.games}>Interaktiv o‘yinlar</Link></li>
          </ul>
        </div>
        <div>
          <h4>Kabinetlar</h4>
          <ul>
            <li><Link to={paths.cabinet}>Talaba kabineti</Link></li>
            <li><Link to={paths.admin}>Administrator paneli</Link></li>
            <li><Link to={paths.analytics}>Analitika</Link></li>
          </ul>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>© 2026 Iqtisodiyot nazariyasi — ta’lim va analitika platformasi</span>
        <span>v{appConfig.version} · {appConfig.stage}-bosqich</span>
      </div>
    </footer>
  );
}
