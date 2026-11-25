import { useEffect, useRef } from 'react';

export const AWAY_LIMIT_MS = 3000;

export function useAwayReset(active: boolean, reset: () => void, onHidden?: (at: number | null) => void) {
  const callbacks = useRef({ reset, onHidden });
  callbacks.current = { reset, onHidden };
  useEffect(() => {
    if (!active) return;
    let hiddenAt: number | null = null;
    let timer: number | undefined;
    function check() {
      if (hiddenAt === null || Date.now() - hiddenAt < AWAY_LIMIT_MS) return;
      hiddenAt = null;
      callbacks.current.reset();
    }
    function markHidden() {
      if (hiddenAt !== null) return;
      hiddenAt = Date.now();
      callbacks.current.onHidden?.(hiddenAt);
      timer = window.setTimeout(check, AWAY_LIMIT_MS);
    }
    function visibility() {
      if (document.hidden) markHidden();
      else {
        window.clearTimeout(timer);
        check();
        hiddenAt = null;
        callbacks.current.onHidden?.(null);
      }
    }
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', markHidden);
    window.addEventListener('pageshow', visibility);
    visibility();
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', markHidden);
      window.removeEventListener('pageshow', visibility);
      window.clearTimeout(timer);
    };
  }, [active]);
}
