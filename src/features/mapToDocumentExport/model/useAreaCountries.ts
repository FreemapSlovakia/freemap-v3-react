import type { RootState } from '@app/store/store.js';
import { fetchCoveredCountries } from '@features/map/model/fetchCoveredCountries.js';
import type { Bbox } from '@features/mapArea/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useEffect, useState } from 'react';
import { useDispatch, useStore } from 'react-redux';

/**
 * Resolves the attribution countries covered by the drawn export rectangle.
 * Returns `undefined` for the whole visible map (or before the lookup
 * resolves); the caller falls back to the map's currently visible countries.
 */
export function useAreaCountries(
  area: { type: 'visible' } | { type: 'selected'; bbox: Bbox },
): string[] | undefined {
  const dispatch = useDispatch();

  const store = useStore<RootState>();

  const [areaCountries, setAreaCountries] = useState<string[] | undefined>();

  const bbox = area.type === 'selected' ? area.bbox : undefined;

  useEffect(() => {
    if (!bbox) {
      setAreaCountries(undefined);

      return;
    }

    let cancelled = false;

    fetchCoveredCountries(store.getState, bbox)
      .then((countries) => {
        if (!cancelled) {
          setAreaCountries(countries);
        }
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        dispatch(
          toastsAdd({
            // Coalesce repeats while the export bbox is being adjusted.
            id: 'mapAreaCountries',
            style: 'danger',
            messageKey: 'general.loadError',
            messageParams: { err },
          }),
        );
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, store, bbox]);

  return areaCountries;
}
