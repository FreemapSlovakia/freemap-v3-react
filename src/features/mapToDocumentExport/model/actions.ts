import { createAction } from '@reduxjs/toolkit';
import z from 'zod';
import type { Exportable } from '@/features/mapFeaturesExport/model/actions.js';

// Server-rendered raster overlays. The vector feature sources (drawing, route,
// objects, …) are selected separately via the shared `Exportable` vocabulary.
export const EXPORTABLE_LAYERS = [
  'contours',
  'shading',
  'hikingTrails',
  'bicycleTrails',
  'skiTrails',
  'horseTrails',
] as const;

export const ExportableLayerSchema = z.enum(EXPORTABLE_LAYERS);

export type ExportableLayer = z.infer<typeof ExportableLayerSchema>;

export const FormatSchema = z.enum(['jpeg', 'png', 'pdf', 'svg']);

export type Format = z.infer<typeof FormatSchema>;

export const CustomLayerOrderSchema = z.enum(['topmost', 'natural']);

export type CustomLayerOrder = 'topmost' | 'natural';

export interface Decorations {
  scaleBar: boolean;
  /** Localized cardinal letter to draw next to the north arrow, or `false` to omit it. */
  northArrow: string | false;
  /** Resolved attribution text to render, or `false` to omit it. */
  attribution: string | false;
}

export interface ExportOptions {
  layers: ExportableLayer[];
  exportables: Exportable[];
  customLayerOrder: CustomLayerOrder;
  scale: number;
  area: 'visible' | 'area';
  format: Format;
  decorations: Decorations;
}

export const exportMapToDocument = createAction<ExportOptions>(
  'EXPORT_MAP_TO_DOCUMENT',
);
