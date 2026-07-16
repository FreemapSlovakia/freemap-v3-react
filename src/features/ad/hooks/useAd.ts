import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffect, useRef, useState } from 'react';

type AdId = 'tShirt' | 'rovas' | 'self' | 'zdilaAuthorship' | 'zdilaMapNative';

export type AdItem = {
  id: AdId;
  chance: number;
  countries?: string[];
};

export function useAd(ads: AdItem[], timeout = 30_000): AdId | null {
  const [adId, setAdId] = useState<AdId | null>(null);

  const lastAdId = useRef<AdId | null>(null);

  const countryCode = useAppSelector((state) => state.geoip.countryCode);

  const [availableAds, setAvailableAds] = useState<AdItem[]>([]);

  useEffect(() => {
    setAvailableAds(
      ads.filter(
        (ad) =>
          !ad.countries || !countryCode || ad.countries.includes(countryCode),
      ),
    );

    setAdId(null);

    lastAdId.current = null;
  }, [countryCode, ads]);

  useEffect(() => {
    if (!availableAds.length) {
      return;
    }

    const pickAd = () => {
      // Avoid repeating the previous ad, but only when another one exists;
      // with a single available ad there's nothing else to pick.
      const candidates =
        availableAds.length > 1
          ? availableAds.filter((ad) => ad.id !== lastAdId.current)
          : availableAds;

      const totalWeight = candidates.reduce((sum, ad) => sum + ad.chance, 0);

      let r = Math.random() * totalWeight;

      let chosenAdId = candidates[candidates.length - 1].id;

      for (const ad of candidates) {
        if (r < ad.chance) {
          chosenAdId = ad.id;
          break;
        }

        r -= ad.chance;
      }

      lastAdId.current = chosenAdId;

      setAdId(chosenAdId);
    };

    pickAd(); // initial

    const interval = setInterval(pickAd, timeout);

    return () => clearInterval(interval);
  }, [availableAds, timeout]);

  return adId;
}
