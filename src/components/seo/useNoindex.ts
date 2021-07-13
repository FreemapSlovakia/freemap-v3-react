import { useEffect } from 'react';

export function useNoindex(): void {
  useEffect(() => {
    const meta = document.createElement('meta');

    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex');

    const head = document.getElementsByTagName('head')[0];

    head.appendChild(meta);

    return () => {
      head.removeChild(meta);
    };
  }, []);
}
