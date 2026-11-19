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
          <address className="small" style={{ fontStyle: 'normal', marginTop: 12, lineHeight: 1.65 }}>
            <div>Muallif: <strong>Qurbonov Baxromjon</strong></div>
            <div>Telefon: <a href="tel:+998938636355" className="link">+998 93 863 63 55</a></div>
            <div>Telegram: <a href="https://t.me/BaxromjonQurbonov" className="link">@BaxromjonQurbonov</a></div>
          </address>
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
        <div>
          <p>© 2026 Qurbonov Baxromjon. Barcha huquqlar himoyalangan.</p>
          <p>Sayt materiallaridan foydalanganda «Iqtisodiyot nazariyasi — ta’lim va analitika» saytini manba sifatida ko‘rsating.</p>
        </div>
        <span>v{appConfig.version}</span>
      </div>
    </footer>
  );
}
