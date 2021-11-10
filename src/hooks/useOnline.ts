import { get } from 'idb-keyval';
import { useEffect, useState } from 'react';

export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);

  function offlineHandler() {
    setOnline(false);
  }

  function onlineHandler() {
    setOnline(true);
  }

  const [cacheOnly, setCacheOnly] = useState(false);

  // TODO make event based somehow
  useEffect(() => {
    get('cacheMode').then((cm) => {
      setCacheOnly(cm === 'cacheOnly');
    });
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }, []);

  return online && !cacheOnly;
}
