import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { countryCodeToFlag } from '@shared/flags.js';
import { regionName, useRegionNames } from '@shared/hooks/useRegionNames.js';
import clsx from 'clsx';
import type { ReactElement } from 'react';

type Props = {
  /** ISO 3166-1 alpha-2 code, in either case. */
  country: string;
  /** Class for the flag itself — a font-size class sizes it. */
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
      {/* `.fm-glyph` zeroes the line height, which suits only an icon. */}
      <span className={clsx('lh-1', className)}>
        {countryCodeToFlag(country)}
      </span>
    </GlyphMarker>
  );
}
