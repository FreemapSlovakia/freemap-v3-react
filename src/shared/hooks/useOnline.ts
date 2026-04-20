import { useEffect, useState } from 'react';

export function useOnline() {
  const [online, setOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    function offlineHandler() {
      setOnline(false);
    }

    function onlineHandler() {
      setOnline(true);
    }

    setOnline(window.navigator.onLine);

    window.addEventListener('online', onlineHandler);

    window.addEventListener('offline', offlineHandler);

    return () => {
      window.removeEventListener('online', onlineHandler);

      window.removeEventListener('offline', offlineHandler);
    };
  }, []);

  return online;
}
