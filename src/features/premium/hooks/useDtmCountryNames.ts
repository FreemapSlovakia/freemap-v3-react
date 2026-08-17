import { ELEVATION_API_DTM_COUNTRIES } from '@shared/elevationSources.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { makeLabelComparator } from '@shared/stringUtils.js';
import { useMemo } from 'react';
import { usePremiumMessages } from '../translations/usePremiumMessages.js';

/**
 * The areas of the high-resolution elevation data, localized, sorted and joined
 * into a single sentence — the tooltip behind the premium offer's elevation
 * bullet. A country whose model covers only part of it is named by
 * `dtmAreaNames` instead of by the country itself, so the offer doesn't promise
 * more than it holds.
 */
export function useDtmCountryNames(): string {
  const language = useAppSelector((state) => state.l10n.language);

  const areaNames = usePremiumMessages()?.dtmAreaNames;

  return useMemo(() => {
    const regionNames = new Intl.DisplayNames(language, { type: 'region' });

    const names = ELEVATION_API_DTM_COUNTRIES.map(
      (country) =>
        areaNames?.[country as keyof typeof areaNames] ??
        regionNames.of(country.toUpperCase()) ??
        country,
    ).sort(makeLabelComparator(language));

    return new Intl.ListFormat(language, { type: 'conjunction' }).format(names);
  }, [language, areaNames]);
}
