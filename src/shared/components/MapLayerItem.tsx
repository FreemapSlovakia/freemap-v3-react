import { useMessages } from '@features/l10n/l10nInjector.js';
import { countryCodeToFlag, Emoji } from '@shared/components/Emoji.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { IconSpecGlyph } from '@shared/components/IconGlyph.js';
import type { ReactElement } from 'react';
import { FaHistory } from 'react-icons/fa';
import { TbLayersSelected, TbLayersSelectedBottom } from 'react-icons/tb';

type MapLayerItemDef = {
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
export function MapLayerItem({ def }: { def: MapLayerItemDef }): ReactElement {
  const m = useMessages();

  return (
    <span className="d-inline-flex flex-wrap align-items-center gap-1">
      {def.layer === 'base' ? (
        <TbLayersSelected className="opacity-50" />
      ) : (
        <TbLayersSelectedBottom className="opacity-50" />
      )}

      {def.icon ?? <IconSpecGlyph spec={def.iconSpec} />}

      {m?.mapLayers.letters[def.type] ?? def.name ?? def.type}

      {def.type !== 'X' &&
        def.countries?.map((country) => (
          <Emoji key={country}>{countryCodeToFlag(country)}</Emoji>
        ))}

      {def.superseededBy && (
        <FaHistory className="text-warning" title={m?.mapLayers.legacy} />
      )}

      {def.experimental && <ExperimentalFunction />}
    </span>
  );
}
