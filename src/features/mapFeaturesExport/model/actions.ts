import { createAction } from '@reduxjs/toolkit';
import z from 'zod';

export type Exportable =
  | 'plannedRoute'
  | 'plannedRouteWithStops'
  | 'objects'
  | 'pictures'
  | 'drawingLines'
  | 'drawingAreas'
  | 'drawingPoints'
  | 'tracking'
  | 'import'
  | 'search';

export const ExportTargetSchema = z.enum([
  'download',
  'gdrive',
  'dropbox',
  'garmin',
]);

export type ExportTarget = z.infer<typeof ExportTargetSchema>;

export const ExportTypeSchema = z.enum(['gpx', 'geojson', 'kml']);

export type ExportType = z.infer<typeof ExportTypeSchema>;

// Button labels per format. Typed as a full record so adding a member to
// ExportTypeSchema without a label is a compile error.
export const EXPORT_FORMAT_LABELS: Record<ExportType, string> = {
  gpx: 'GPX',
  geojson: 'GeoJSON',
  kml: 'KML',
};

/**
 * Whether to fill elevation into exported features: `none` leaves coordinates
 * as-is, `missing` fills only those lacking elevation, `all` overwrites every
 * elevation from the elevation API.
 */
export const ExportElevationSchema = z.enum(['none', 'missing', 'all']);

export type ExportElevation = z.infer<typeof ExportElevationSchema>;

export const exportMapFeatures = createAction<{
  exportables: Exportable[];
  type: ExportType;
  target: ExportTarget;
  name?: string;
  description?: string;
  activity?: string;
  /**
   * Fill elevation into exported points, lines and the planned route. `none`
   * (or absent) leaves coordinates untouched; polygons are always skipped
   * (elevation has no meaning for an area outline).
   */
  elevation?: ExportElevation;
}>('EXPORT_MAP_FEATURES');
