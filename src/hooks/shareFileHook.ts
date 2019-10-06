import { useEffect } from 'react';

export function useShareFile(handleShare) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
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

      navigator.serviceWorker.addEventListener('message', handler);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handler);
      };
    }
  }, [handleShare]);
}
