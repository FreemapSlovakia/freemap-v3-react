import z from 'zod';

// Server-rendered layers added on top of the base map (or drawn alone without
// it). The vector feature sources (drawing, route, objects, …) are selected
// separately via the shared `Exportable` vocabulary.
export const EXTRA_LAYERS = [
  'contours',
  'shading',
  'hikingTrails',
  'bicycleTrails',
  'skiTrails',
  'horseTrails',
  'sacScale',
  'smoothness',
  'waymarking',
] as const;

export const ExtraLayerSchema = z.enum(EXTRA_LAYERS);

export type ExtraLayer = z.infer<typeof ExtraLayerSchema>;

// What the outdoor map itself shows; the rest is opt-in.
export const DEFAULT_EXTRA_LAYERS: ExtraLayer[] = EXTRA_LAYERS.filter(
  (layer) =>
    layer !== 'sacScale' && layer !== 'smoothness' && layer !== 'waymarking',
);

// Base-map layers an export can leave out.
export const OMITTABLE_LAYERS = ['groundCover', 'buildings'] as const;

export const OmittableLayerSchema = z.enum(OMITTABLE_LAYERS);

export type OmittableLayer = z.infer<typeof OmittableLayerSchema>;

export const FormatSchema = z.enum(['jpeg', 'png', 'webp', 'pdf', 'svg']);

export type Format = z.infer<typeof FormatSchema>;

// Anything short of the whole map is partly transparent, which these can't carry.
export const OPAQUE_FORMATS: readonly Format[] = ['jpeg', 'pdf'];

export const CustomLayerOrderSchema = z.enum(['topmost', 'natural']);

export type CustomLayerOrder = 'topmost' | 'natural';
