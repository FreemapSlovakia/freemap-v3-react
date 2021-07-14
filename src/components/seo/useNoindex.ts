import { useEffect } from 'react';

export function useNoindex(): void {
  useEffect(() => {
    const orig = document.querySelector('meta[name="robots"]');

    const meta = orig || document.createElement('meta');

    if (!orig) {
      meta.setAttribute('name', 'robots');
    }

    meta.setAttribute('content', 'noindex, noarchive, nosnippet');

    let head: HTMLHeadElement | undefined;

    if (!orig) {
      head = document.getElementsByTagName('head')[0];

      head.appendChild(meta);
    }

    return () => {
      if (!orig && head) {
        head.removeChild(meta);
      }
    };
  }, []);
}
