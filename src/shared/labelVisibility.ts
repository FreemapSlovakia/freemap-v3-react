import z from 'zod';

export const LabelVisibilitySchema = z.enum([
  'always',
  'hover',
  'selected',
  'hover-selected',
]);

export type LabelVisibility = z.infer<typeof LabelVisibilitySchema>;

/** The lowest zoom offered; the highest is the map's own `maxZoom`. */
export const LABEL_MIN_ZOOM_FLOOR = 8;

/**
 * The zoom from which every label shows, whatever the visibility; `null` for
 * never. A bad stored value is dropped rather than failing its slice.
 */
export const LabelMinZoomSchema = z
  .number()
  .int()
  .min(LABEL_MIN_ZOOM_FLOOR)
  .nullable()
  .catch(null);

export type LabelSettings = {
  visibility: LabelVisibility;
  minZoom: number | null;
};

export function labelSettingsEqual(a: LabelSettings, b: LabelSettings) {
  return a.visibility === b.visibility && a.minZoom === b.minZoom;
}

export type LabelTooltipMode = 'permanent' | 'hover';

/**
 * How a feature's label tooltip is mounted, or `undefined` for none. A Leaflet
 * tooltip can't switch `permanent` in place, so the caller keys it on this.
 */
export function labelTooltipMode(
  visibility: LabelVisibility,
  selected: boolean,
  zoomedIn: boolean,
): LabelTooltipMode | undefined {
  if (
    zoomedIn ||
    visibility === 'always' ||
    (selected && visibility !== 'hover')
  ) {
    return 'permanent';
  }

  return visibility === 'hover' || visibility === 'hover-selected'
    ? 'hover'
    : undefined;
}
