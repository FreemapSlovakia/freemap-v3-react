import z from 'zod';

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
