import { countryCodeToFlag, Emoji } from '@shared/components/Emoji.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { regionName, useRegionNames } from '@shared/hooks/useRegionNames.js';
import type { ReactElement } from 'react';

type Props = {
  /** ISO 3166-1 alpha-2 code, in either case. */
  country: string;
  /** Class for the flag image itself — its width comes from here. */
  className?: string;
};

/**
 * A flag standing for a country, naming it on hover or long press. A flag
 * standing for a *language* must not use this — it would name the country the
 * flag is borrowed from, not the language.
 */
export function CountryFlag({ country, className }: Props): ReactElement {
  const name = regionName(useRegionNames(), country);

  return (
    <GlyphMarker hint={name} color={null}>
      <Emoji className={className}>{countryCodeToFlag(country)}</Emoji>
    </GlyphMarker>
  );
}
