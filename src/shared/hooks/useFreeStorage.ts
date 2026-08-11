import { useEffect, useState } from 'react';

/**
 * Bytes still available to this origin, or `undefined` where the browser can't
 * tell (no Storage API, or an estimate without a quota).
 */
export function useFreeStorage(): number | undefined {
  const [freeBytes, setFreeBytes] = useState<number>();

  useEffect(() => {
    navigator.storage
      ?.estimate?.()
      .then(({ quota, usage }) => {
        if (quota !== undefined) {
          setFreeBytes(Math.max(0, quota - (usage ?? 0)));
        }
      })
      .catch(() => {
        // leave it unknown; the caller just skips the warning
      });
  }, []);

  return freeBytes;
}
