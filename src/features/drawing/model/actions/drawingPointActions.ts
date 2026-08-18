import {
  type MarkerType,
  MarkerTypeSchema,
} from '@features/objects/model/actions.js';
import { createAction } from '@reduxjs/toolkit';
import { type LatLon, LatLonSchema } from '@shared/types/common.js';
import z from 'zod';

/**
 * Free-form data about the thing drawn, kept apart from how it is drawn: the
 * OSM tags a converted object arrived with, or whatever the user typed into the
 * properties table. Exported as GeoJSON `properties`, and a `{key}` in the
 * label draws the matching value — which is what lets a label say `{name}`
 * rather than a copy of it.
 *
 * Empty is written as absent, so a feature with no properties costs nothing in
 * the URL or in a saved map.
 */
export const DrawingPropsSchema = z.record(z.string(), z.string());

export type DrawingProps = z.infer<typeof DrawingPropsSchema>;

/** An empty table is stored as none, so it costs nothing downstream. */
export function normalizeProps(
  props: DrawingProps | undefined,
): DrawingProps | undefined {
  return props && Object.keys(props).length > 0 ? props : undefined;
}

export const DrawingPointSchema = z.object({
  coords: LatLonSchema,
  label: z.string().optional(),
  color: z.string().optional(),
  markerType: MarkerTypeSchema.optional(),
  // Prefixed icon spec rendered inside the marker: `fa:flag` (Font Awesome
  // solid `iconName`) or `poi:church` (bundled OSM poi icon). Any other value
  // is shown as literal text (first 2 chars). See `parseIconSpec`.
  icon: z.string().optional(),
  props: DrawingPropsSchema.optional(),
});

export type DrawingPoint = z.infer<typeof DrawingPointSchema>;

// Wire form for persisted maps: legacy flat `{lat,lon,label,color}` is
// reshaped to the current `{coords:{lat,lon},label,color}` form.
export const DrawingPointCompatSchema = z.preprocess((v) => {
  if (
    typeof v === 'object' &&
    v !== null &&
    !('coords' in v) &&
    'lat' in v &&
    'lon' in v
  ) {
    const { lat, lon, ...rest } = v as {
      lat: number;
      lon: number;
      [k: string]: unknown;
    };

    return { ...rest, coords: { lat, lon } };
  }

  return v;
}, DrawingPointSchema);

export const drawingPointAdd = createAction<DrawingPoint & { id: number }>(
  'DRAWING_POINT_ADD',
);

export const drawingPointChangePosition = createAction<{
  index: number;
  coords: LatLon;
}>('DRAWING_POINT_CHANGE_POSITION');

export const drawingPointChangeProperties = createAction<{
  index: number;
  properties: {
    label: string | undefined;
    color: string | undefined;
    markerType: MarkerType | undefined;
    icon: string | undefined;
    /** Empty clears the data table. */
    props: DrawingProps | undefined;
  };
}>('DRAWING_POINT_CHANGE_PROPERTIES');

export const drawingPointSetAll = createAction<DrawingPoint[]>(
  'DRAWING_POINT_SET_ALL',
);

// NOTE used also for lines and polygons

export const drawingMeasure = createAction<{
  elevation?: boolean;
  position?: LatLon;
}>('DRAWING_MEASURE');

export const drawingPointDelete = createAction<{
  index: number;
}>('DRAWING_POINT_DELETE');

/**
 * The OSM tags worth carrying onto a drawn feature. An allowlist rather than
 * everything: a well-mapped POI has dozens of tags, all of them go into the URL
 * behind the feature, and bulk-converting a screenful of objects with the lot
 * would produce a link too long to send. What's dropped is what a label or a
 * reader is unlikely to want; the properties table takes anything by hand.
 */
const CARRIED_TAGS = [
  'name',
  'ele',
  'description',
  'operator',
  'website',
  'phone',
  'opening_hours',
  'wikipedia',
  'wikidata',
  'ref',
] as const;

export function pickDrawingProps(
  tags: Record<string, string> | undefined,
): DrawingProps | undefined {
  if (!tags) {
    return undefined;
  }

  const props: DrawingProps = {};

  for (const tag of CARRIED_TAGS) {
    const value = tags[tag];

    if (value) {
      props[tag] = value;
    }
  }

  return normalizeProps(props);
}
