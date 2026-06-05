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

/** Glow/shadow drawn around all custom-layer markers and lines, or `null` to omit it. */
export interface Glow {
  /** `#rrggbbaa` color (including alpha). */
  color: string;
  /** Glow width in pixels. */
  width: number;
}

/** Styling of custom-layer feature labels. */
export interface Label {
  /** `#rrggbb` color (no alpha). */
  color: string;
  /** Font weight. */
  weight: number;
  /** Font size in pixels. */
  size: number;
}

export interface ExportOptions {
  layers: ExportableLayer[];
  exportables: Exportable[];
  customLayerOrder: CustomLayerOrder;
  scale: number;
  area: 'visible' | 'area';
  format: Format;
  decorations: Decorations;
  glow: Glow | null;
  /** Styling of custom-layer feature labels. */
  label: Label;
}

export const exportMapToDocument = createAction<ExportOptions>(
  'EXPORT_MAP_TO_DOCUMENT',
);
