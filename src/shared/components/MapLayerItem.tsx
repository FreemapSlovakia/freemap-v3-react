import { useMessages } from '@features/l10n/l10nInjector.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import {
  CustomMapGlyph,
  customMapKind,
} from '@shared/components/CustomMapGlyph.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { flaggedCountries } from '@shared/mapDefinitions.js';
import clsx from 'clsx';
import type { ReactElement, ReactNode } from 'react';
import { FaHistory } from 'react-icons/fa';
import { TbLayersSelected, TbLayersSelectedBottom } from 'react-icons/tb';
import { layerName } from '../layerName.js';

export type MapLayerItemDef = {
  type: string;
  layer: 'base' | 'overlay';
  icon?: ReactElement;
  /** A custom layer's picked icon, used when there is no built-in `icon`. */
  iconSpec?: string;
  /** Without a picked icon, a custom map shows its technology's. */
  technology?: string;
  /** Only a cached map has one. */
  sourceType?: string;
  name?: string;
  countries?: string[];
  superseededBy?: string;
  experimental?: boolean;
};

/** A base map's and an overlay's glyph, wherever the kind is shown or picked. */
export const LAYER_KIND_ICONS: Record<'base' | 'overlay', ReactElement> = {
  base: <TbLayersSelected />,
  overlay: <TbLayersSelectedBottom />,
};

/** Whether a layer is a base map or an overlay, named in a tooltip. */
export function LayerKindMark({
  kind,
}: {
  kind: 'base' | 'overlay';
}): ReactElement {
  const m = useMessages();

  return (
    <GlyphMarker
      hint={m?.mapLayers.layer[kind]}
      color={null}
      className="opacity-50 flex-shrink-0"
    >
      {LAYER_KIND_ICONS[kind]}
    </GlyphMarker>
  );
}

/**
 * A layer's name with the marks that go with it, laid out as a row of its own —
 * it appears in a menu item, in a `<select>`-like toggle and in plain form text,
 * so the spacing can't be left to whichever of those it lands in.
 */
export function MapLayerItem({
  def,
  label,
  truncate,
  noKindMark,
}: {
  def: MapLayerItemDef;
  /** Stands in for the resolved name — a search hit shows its matched letters in bold. */
  label?: ReactNode;
  /** One line, the name cut with an ellipsis, rather than wrapping. */
  truncate?: boolean;
  /** Where the row shows the kind elsewhere, as a control. */
  noKindMark?: boolean;
}): ReactElement {
  const m = useMessages();

  const name = label ?? layerName(def, m) ?? def.type;

  return (
    <span
      className={clsx(
        'd-inline-flex align-items-center gap-1',
        truncate ? 'mw-100 flex-nowrap' : 'flex-wrap',
      )}
    >
      {!noKindMark && <LayerKindMark kind={def.layer} />}

      {def.icon ?? (
        <CustomMapGlyph spec={def.iconSpec} kind={customMapKind(def)} />
      )}

      {truncate ? (
        // The full name of one cut short.
        <LongPressTooltip label={name}>
          {({ props }) => (
            <span className="text-truncate" {...props}>
              {name}
            </span>
          )}
        </LongPressTooltip>
      ) : (
        name
      )}

      {flaggedCountries(def)?.map((country) => (
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
