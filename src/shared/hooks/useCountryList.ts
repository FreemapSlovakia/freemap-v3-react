import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useRegionNames } from '@shared/hooks/useRegionNames.js';
import { makeLabelComparator } from '@shared/stringUtils.js';
import { useMemo } from 'react';

/**
 * Countries named in the UI language, sorted and joined into one list. A code
 * in `names` is named by it instead of by the country.
 */
export function useCountryList(
  codes: readonly string[] | undefined,
  names?: Readonly<Partial<Record<string, string>>>,
): string | undefined {
  const language = useAppSelector((state) => state.l10n.language);

  const regionNames = useRegionNames();

  return useMemo(() => {
    if (!codes) {
      return undefined;
    }

    const labels = codes
      .map((code) => {
        try {
          return names?.[code] ?? regionNames.of(code.toUpperCase()) ?? code;
        } catch {
          return code;
        }
      })
      .sort(makeLabelComparator(language));

    return new Intl.ListFormat(language, { type: 'conjunction' }).format(
      labels,
    );
  }, [codes, names, language, regionNames]);
}
