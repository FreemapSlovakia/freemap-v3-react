import { ELEVATION_API_DTM_COUNTRIES } from '@shared/elevationSources.js';
import { useCountryList } from '@shared/hooks/useCountryList.js';
import { usePremiumMessages } from '../translations/usePremiumMessages.js';

/**
 * The areas of the high-resolution elevation data, localized, sorted and joined
 * into a single sentence — the tooltip behind the premium offer's elevation
 * bullet. A country whose model covers only part of it is named by
 * `dtmAreaNames` instead of by the country itself, so the offer doesn't promise
 * more than it holds.
 */
export function useDtmCountryNames(): string {
  const areaNames = usePremiumMessages()?.dtmAreaNames;

  return useCountryList(ELEVATION_API_DTM_COUNTRIES, areaNames) ?? '';
}
