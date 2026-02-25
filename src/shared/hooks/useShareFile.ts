import { useEffect } from 'react';

export function useShareFile(handleShare: (files: File[]) => void): void {
  useEffect(() => {
    if ('serviceWorker' in window.navigator) {
      const handler = (e: MessageEvent) => {
        const { data } = e;

        if (
          data &&
          typeof data === 'object' &&
          typeof data.freemap === 'object'
        ) {
          if (data.freemap.action === 'shareFile') {
            handleShare(data.freemap.payload);
          }
        }
      };

      window.navigator.serviceWorker.addEventListener('message', handler);

      return () => {
        window.navigator.serviceWorker.removeEventListener('message', handler);
      };
    }
  }, [handleShare]);
}
