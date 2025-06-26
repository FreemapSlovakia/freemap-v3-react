import { useEffect, useRef, useState } from 'react';

export function useAd<T extends Record<string, number>>(
  ads: T,
  timeout = 30_000,
): keyof T | null {
  type K = keyof T;

  const [ad, setAd] = useState<K | null>(null);

  const lastAdId = useRef<K | null>(null);

  useEffect(() => {
    if (!Object.keys(ads).length) {
      return;
    }

    const totalWeight = (Object.values(ads) as number[]).reduce(
      (sum, priority) => sum + priority,
      0,
    );

    const pickAd = () => {
      let chosen: K | undefined;

      while (!chosen || chosen === lastAdId.current) {
        let r = Math.random() * totalWeight;

        for (const [key, priority] of Object.entries(ads) as [K, number][]) {
          if (r < priority) {
            chosen = key;
            break;
          }

          r -= priority;
        }
      }

      lastAdId.current = chosen;

      setAd(chosen);
    };

    pickAd(); // initial

    const interval = setInterval(pickAd, timeout);

    return () => clearInterval(interval);
  }, [ads, timeout]);

  return ad;
}
