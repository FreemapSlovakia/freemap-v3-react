import { createAction } from '@reduxjs/toolkit';

export type Exportable =
  | 'plannedRoute'
  | 'plannedRouteWithStops'
  | 'objects'
  | 'pictures'
  | 'drawingLines'
  | 'drawingAreas'
  | 'drawingPoints'
  | 'tracking'
  | 'gpx'
  | 'search';

export const exportTargets = [
  'download',
  'gdrive',
  'dropbox',
  'garmin',
] as const;

export type ExportTarget = (typeof exportTargets)[number];

export const exportTypes = ['gpx', 'geojson'] as const;

export type ExportType = (typeof exportTypes)[number];

export const exportMapFeatures = createAction<{
  exportables: Exportable[];
  type: ExportType;
  target: ExportTarget;
  name?: string;
  description?: string;
  activity?: string;
}>('EXPORT_MAP_FEATURES');
