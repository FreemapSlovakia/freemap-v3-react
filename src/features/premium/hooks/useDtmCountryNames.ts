import { useDtmCountries } from '@shared/elevationSources.js';
import { useCountryList } from '@shared/hooks/useCountryList.js';
import { usePremiumMessages } from '../translations/usePremiumMessages.js';

/**
 * The national models' areas, localized and joined — `undefined` until the API
 * has listed them. `dtmAreaNames` names an area that is only part of a country.
 */
export function useDtmCountryNames(): string | undefined {
  const areaNames = usePremiumMessages()?.dtmAreaNames;

  return useCountryList(useDtmCountries() ?? undefined, areaNames);
}
