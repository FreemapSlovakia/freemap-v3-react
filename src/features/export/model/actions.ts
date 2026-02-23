import { createAction } from '@reduxjs/toolkit';

export const LAYERS = [
  'contours',
  'shading',
  'hikingTrails',
  'bicycleTrails',
  'skiTrails',
  'horseTrails',
  'drawing',
  'plannedRoute',
  'track',
] as const;

export type ExportableLayer = (typeof LAYERS)[number];

export type ExportFormat = 'jpeg' | 'png' | 'pdf' | 'svg';

export interface MapExportOptions {
  layers: ExportableLayer[];
  scale: number;
  area: 'visible' | 'selected';
  format: ExportFormat;
}

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

export const exportMap = createAction<MapExportOptions>('EXPORT_MAP');
