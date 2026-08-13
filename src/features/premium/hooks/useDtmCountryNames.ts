import { ELEVATION_API_DTM_COUNTRIES } from '@shared/elevationSources.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { makeLabelComparator } from '@shared/stringUtils.js';
import { useMemo } from 'react';

/**
 * The countries of the high-resolution elevation data, localized, sorted and
 * joined into a single sentence — the tooltip behind the premium offer's
 * elevation bullet.
 */
export function useDtmCountryNames(): string {
  const language = useAppSelector((state) => state.l10n.language);

  return useMemo(() => {
    const regionNames = new Intl.DisplayNames(language, { type: 'region' });

    const names = ELEVATION_API_DTM_COUNTRIES.map(
      (country) => regionNames.of(country.toUpperCase()) ?? country,
    ).sort(makeLabelComparator(language));

    return new Intl.ListFormat(language, { type: 'conjunction' }).format(names);
  }, [language]);
}
