import { useMessages } from '@features/l10n/l10nInjector.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { IconSpecGlyph } from '@shared/components/IconGlyph.js';
import type { ReactElement, ReactNode } from 'react';
import { FaHistory } from 'react-icons/fa';
import { TbLayersSelected, TbLayersSelectedBottom } from 'react-icons/tb';

export type MapLayerItemDef = {
  type: string;
  layer: 'base' | 'overlay';
  icon?: ReactElement;
  /** A custom layer's picked icon, used when there is no built-in `icon`. */
  iconSpec?: string;
  name?: string;
  countries?: string[];
  superseededBy?: string;
  experimental?: boolean;
};

/**
 * A layer's name with the marks that go with it, laid out as a row of its own —
 * it appears in a menu item, in a `<select>`-like toggle and in plain form text,
 * so the spacing can't be left to whichever of those it lands in.
 */
export function MapLayerItem({
  def,
  label,
}: {
  def: MapLayerItemDef;
  /** Stands in for the resolved name — a search hit shows its matched letters in bold. */
  label?: ReactNode;
}): ReactElement {
  const m = useMessages();

  return (
    <span className="d-inline-flex flex-wrap align-items-center gap-1">
      {def.layer === 'base' ? (
        <TbLayersSelected className="opacity-50" />
      ) : (
        <TbLayersSelectedBottom className="opacity-50" />
      )}

      {def.icon ?? <IconSpecGlyph spec={def.iconSpec} />}

      {label ?? m?.mapLayers.letters[def.type] ?? def.name ?? def.type}

      {def.type !== 'X' &&
        def.countries?.map((country) => (
          <CountryFlag key={country} country={country} />
        ))}

      {def.superseededBy && (
        <GlyphMarker hint={m?.mapLayers.legacy}>
          <FaHistory />
        </GlyphMarker>
      )}

      {def.experimental && <ExperimentalFunction />}
    </span>
  );
}
