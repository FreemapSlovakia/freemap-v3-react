import {
  type MarkerType,
  MarkerTypeSchema,
} from '@features/objects/model/actions.js';
import { createAction } from '@reduxjs/toolkit';
import { type LatLon, LatLonSchema } from '@shared/types/common.js';
import z from 'zod';

export const DrawingPointSchema = z.object({
  coords: LatLonSchema,
  label: z.string().optional(),
  color: z.string().optional(),
  markerType: MarkerTypeSchema.optional(),
  // Prefixed icon spec rendered inside the marker: `fa:flag` (Font Awesome
  // solid `iconName`) or `poi:church` (bundled OSM poi icon). Any other value
  // is shown as literal text (first 2 chars). See `parseIconSpec`.
  icon: z.string().optional(),
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
