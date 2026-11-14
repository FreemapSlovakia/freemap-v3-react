import type { ReactNode } from 'react';

export type TerrainModelMessages = {
  area: string;
  /** The label of the preview's map picker. */
  texture: string;
  /** Its option following the base map on the map. */
  /** Its untextured option, beside the map names. */
  texturePlain: string;
  textureFailed: string;
  previewUnavailable: string;
  viewArea: string;
  viewModel: string;
  modelTooLargeToShow: string;
  build: string;
  dimensions: string;
  scale: string;
  /** `detail`: the grid step on the ground, metres. */
  detail: (p: { detail: string }) => string;
  /** For a free account, where premium's limits would make this model finer. */
  premiumFiner: (
    premiumLink: (label: ReactNode) => ReactNode,
    p: { detail: string; premiumDetail: string },
  ) => ReactNode;
  progressTiles: (p: { done: string; total: string }) => string;
  progressMesh: string;
  exaggeration: string;
  exaggerationHint: string;
  base: string;
  simplification: string;
  simplificationOff: string;
  areaTooLarge: string;
  acrossAntimeridian: string;
  download: string;
  result: (p: { height: string; triangles: string; size: string }) => string;
  premiumRefused: (p: { m: string }) => string;
  partialData: (p: { percent: string }) => string;
  noData: string;
  error: (p: { err: string }) => string;
  /** Above the elevation sources of a built model, as the map export puts it. */
  shareCredits: string;
  /** The elevation tiles named no datasets at all. */
  creditsNone: string;
  unknownSources: string;
};
