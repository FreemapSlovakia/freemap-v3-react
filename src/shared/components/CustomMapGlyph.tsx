import { IconSpecGlyph } from '@shared/components/IconGlyph.js';
import type { IsCustomLayerTechnologiesDef } from '@shared/mapDefinitions.js';
import type { ReactElement, ReactNode } from 'react';
import { FaServer, FaTh } from 'react-icons/fa';
import { GiHills } from 'react-icons/gi';
import { MdFormatColorFill, MdOfflinePin } from 'react-icons/md';
import { TbStack2, TbVector } from 'react-icons/tb';

export type CustomMapKind =
  | IsCustomLayerTechnologiesDef['technology']
  | 'combination';

export const CUSTOM_MAP_ICONS: Record<CustomMapKind, ReactElement> = {
  tile: <FaTh />,
  maplibre: <TbVector />,
  wms: <FaServer />,
  parametricShading: <GiHills />,
  color: <MdFormatColorFill />,
  combination: <TbStack2 />,
};

type GlyphKind = CustomMapKind | 'cached';

const FALLBACKS: Record<GlyphKind, ReactElement> = {
  ...CUSTOM_MAP_ICONS,
  cached: <MdOfflinePin />,
};

/** What a custom or cached map falls back on; a built-in layer has no kind. */
export function customMapKind(def: {
  technology?: string;
  sourceType?: string;
}): GlyphKind | undefined {
  if (def.sourceType !== undefined) {
    return 'cached';
  }

  return def.technology && Object.hasOwn(CUSTOM_MAP_ICONS, def.technology)
    ? (def.technology as CustomMapKind)
    : undefined;
}

/** A custom, cached or combined map's picked icon, else its kind's. */
export function CustomMapGlyph({
  spec,
  kind,
}: {
  spec?: string;
  kind?: GlyphKind;
}): ReactNode {
  return <IconSpecGlyph spec={spec} fallback={kind ? FALLBACKS[kind] : null} />;
}
