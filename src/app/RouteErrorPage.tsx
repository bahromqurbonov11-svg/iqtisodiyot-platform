import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui';
import { paths } from '@/navigation/paths';

const reloadKey = 'platform:route-reload';

export function RouteErrorPage() {
  const error = useRouteError();
  const failedImport = error instanceof Error &&
    /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|unable to preload css/i.test(error.message);

  useEffect(() => {
    if (!failedImport || !navigator.onLine) return;

    try {
      const lastReload = Number(sessionStorage.getItem(reloadKey));
      if (Date.now() - lastReload < 60_000) return;
      sessionStorage.setItem(reloadKey, String(Date.now()));
    } catch {
      // Without session storage, a manual retry avoids a reload loop.
      return;
    }

    window.location.reload();
  }, [failedImport]);

  return (
    <main className="container page empty-page">
      <h1>Sahifani yuklab bo‘lmadi</h1>
      <p className="muted">Internet aloqasini tekshiring va qayta urinib ko‘ring.</p>
      <div>
        <Button onClick={() => window.location.reload()}>Qayta yuklash</Button>{' '}
        <Button to={paths.home}>Bosh sahifaga qaytish</Button>
      </div>
    </main>
  );
}
