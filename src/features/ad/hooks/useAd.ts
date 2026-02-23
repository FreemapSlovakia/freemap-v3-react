import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffect, useRef, useState } from 'react';

type AdId = 'tShirt' | 'rovas' | 'self';

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

    const totalWeight = availableAds.reduce((sum, ad) => sum + ad.chance, 0);

    const pickAd = () => {
      let chosenAdId: AdId | undefined;

      while (!chosenAdId || chosenAdId === lastAdId.current) {
        let r = Math.random() * totalWeight;

        for (const ad of availableAds) {
          if (r < ad.chance) {
            chosenAdId = ad.id;
            break;
          }

          r -= ad.chance;
        }
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
