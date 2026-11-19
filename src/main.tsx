import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { SiteStatsProvider } from '@/layouts/VisitReport';
import { I18nProvider } from '@/i18n';
import { AuthProviderRoot } from '@/services/auth/AuthContext';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/components.css';
import '@/styles/layout.css';
import '@/styles/pages.css';
import '@/styles/motion.css';
import '@/styles/v2.css';
import '@/styles/v3.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProviderRoot>
        <SiteStatsProvider><RouterProvider router={router} /></SiteStatsProvider>
      </AuthProviderRoot>
    </I18nProvider>
  </StrictMode>,
);
