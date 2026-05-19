import { createAction } from '@reduxjs/toolkit';
import z from 'zod';

export const EXPORTABLE_LAYERS = [
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

export const ExportableLayerSchema = z.enum(EXPORTABLE_LAYERS);

export type ExportableLayer = z.infer<typeof ExportableLayerSchema>;

export const ExportFormatSchema = z.enum(['jpeg', 'png', 'pdf', 'svg']);

export type ExportFormat = z.infer<typeof ExportFormatSchema>;

export const CustomLayerOrderSchema = z.enum(['topmost', 'natural']);

export type CustomLayerOrder = 'topmost' | 'natural';

export interface MapExportOptions {
  layers: ExportableLayer[];
  customLayerOrder: CustomLayerOrder;
  scale: number;
  area: 'visible' | 'selected';
  format: ExportFormat;
}

export const exportMap = createAction<MapExportOptions>('EXPORT_MAP');
