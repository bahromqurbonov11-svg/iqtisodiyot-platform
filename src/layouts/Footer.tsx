import { Link } from 'react-router-dom';
import { Brand } from '@/components/Brand';
import { paths } from '@/navigation/paths';
import { appConfig } from '@/config/app.config';
import { useI18n } from '@/i18n';

export function Footer() {
  const { t } = useI18n();
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
          <h4>{t.nav.study}</h4>
          <ul>
            <li><Link to={paths.topics}>{t.nav.topics}</Link></li>
            <li><Link to={paths.materials}>{t.nav.materials}</Link></li>
            <li><Link to={paths.about}>{t.nav.about}</Link></li>
          </ul>
        </div>
        <div>
          <h4>{t.nav.tests}</h4>
          <ul>
            <li><Link to={paths.tests}>{t.nav.tests}</Link></li>
            <li><Link to={paths.games}>{t.nav.games}</Link></li>
            <li><Link to={paths.simulator}>{t.nav.simulator}</Link></li>
          </ul>
        </div>
        <div>
          <h4>{t.nav.cabinet}</h4>
          <ul>
            <li><Link to={paths.cabinet}>{t.nav.cabinet}</Link></li>
            <li><Link to={paths.admin}>{t.nav.admin}</Link></li>
            <li><Link to={paths.analytics}>{t.nav.analytics}</Link></li>
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
