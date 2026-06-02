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

export const ExportTypeSchema = z.enum(['gpx', 'geojson']);

export type ExportType = z.infer<typeof ExportTypeSchema>;

export const exportMapFeatures = createAction<{
  exportables: Exportable[];
  type: ExportType;
  target: ExportTarget;
  name?: string;
  description?: string;
  activity?: string;
}>('EXPORT_MAP_FEATURES');
