import type { RootState } from '@app/store/store.js';
import type { Bbox } from '@features/mapArea/model/actions.js';
import { toAttributionCountries } from '@shared/components/Attribution.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffect, useState } from 'react';
import { useStore } from 'react-redux';
import { fetchCoveredCountries } from './model/fetchCoveredCountries.js';

const DEBOUNCE_MS = 500;

/**
 * The countries an area covers, as the credits' country filter takes them
 * (`undefined` = credit all). The viewport's are tracked already; another area
 * is looked up, the view's standing in until it answers.
 */
export function useAreaCountries(
  bbox: Bbox | null | undefined,
  /** The area is the viewport itself. */
  isViewport: boolean,
): string[] | undefined {
  const store = useStore<RootState>();

  const viewCountries = useAppSelector((state) => state.map.countries);

  const key = isViewport ? '' : (bbox?.join() ?? '');

  // `null` for a failed lookup.
  const [found, setFound] = useState<{
    key: string;
    countries: string[] | null;
  } | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` is `bbox`
  useEffect(() => {
    if (!key || !bbox) {
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(() => {
      fetchCoveredCountries(store.getState, bbox).then(
        (countries) => {
          if (!cancelled) {
            setFound({ key, countries });
          }
        },
        () => {
          if (!cancelled) {
            setFound({ key, countries: null });
          }
        },
      );
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;

      window.clearTimeout(timer);
    };
  }, [store, key]);

  return toAttributionCountries(
    key && found?.key === key ? found.countries : viewCountries,
  );
}
