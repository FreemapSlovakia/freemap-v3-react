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

export const exportMap = createAction<MapExportOptions>('EXPORT_MAP');
