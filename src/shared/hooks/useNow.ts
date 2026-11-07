import { useEffect, useState } from 'react';

/**
 * The time, in ms, updated every `everyMs`: state, as a bare `Date.now()` in
 * render is one the React Compiler caches once per mount.
 */
export function useNow(everyMs = 60_000): number {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), everyMs);

    return () => window.clearInterval(id);
  }, [everyMs]);

  return now;
}
