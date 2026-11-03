import { useMessages } from '@features/l10n/l10nInjector.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { TruncatedText } from '@shared/components/TruncatedText.js';
import type { ReactElement } from 'react';
import { FaHistory } from 'react-icons/fa';

type Props = {
  name: string;
  legacy?: boolean;
  countries?: readonly string[];
};

/** A map's name on one line, cut short with the full name on long press. */
export function MapNameLine({ name, legacy, countries }: Props): ReactElement {
  const m = useMessages();

  return (
    <div className="d-flex align-items-center gap-1">
      <TruncatedText>{name}</TruncatedText>

      {legacy && (
        <GlyphMarker hint={m?.mapLayers.legacy}>
          <FaHistory />
        </GlyphMarker>
      )}

      {countries?.map((country) => (
        <CountryFlag key={country} country={country} />
      ))}
    </div>
  );
}
