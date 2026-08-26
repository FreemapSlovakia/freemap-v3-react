import type { RootState } from '@app/store/store.js';
import { fetchCoveredCountries } from '@features/map/model/fetchCoveredCountries.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffect, useState } from 'react';
import { useStore } from 'react-redux';

/** Half-side of the box standing for the place, in degrees — about 11 m. */
const EPS = 0.0001;

/**
 * Country codes covering what the menu shares, for the targets that only have
 * data in some. A menu about the whole visible map goes by the viewport the
 * store already tracks — its centre may well sit in a different country from
 * the one the user is looking at. A menu about one place looks that place up.
 *
 * The lookup answers into an empty list rather than replacing a guess, so the
 * national targets — which stand last — only ever appear. Seeding them from the
 * viewport would take rows away again under a pointer already on its way down.
 */
export function usePlaceCountries(
  lat: number,
  lon: number,
  /** Off where the menu shares the visible map rather than the point. */
  atPoint: boolean,
): string[] {
  const visible = useAppSelector((state) => state.map.countries);

  const store = useStore<RootState>();

  const [countries, setCountries] = useState<string[] | null>(null);

  useEffect(() => {
    // Another place answers differently, and until it has, it has answered nothing.
    setCountries(null);

    if (!atPoint) {
      return;
    }

    let cancelled = false;

    fetchCoveredCountries(store.getState, [
      lon - EPS,
      lat - EPS,
      lon + EPS,
      lat + EPS,
    ])
      .then((res) => {
        if (!cancelled) {
          setCountries(res);
        }
      })
      // Nothing national, rather than something wrong.
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [store, lat, lon, atPoint]);

  return (atPoint ? countries : visible) ?? [];
}
