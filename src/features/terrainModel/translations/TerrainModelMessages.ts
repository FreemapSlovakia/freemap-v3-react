import type { ReactNode } from 'react';
import type { LandcoverClass } from '../model/landcover.js';

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
  build: string;
  sizeAndShape: string;
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
  /** A coloured model's 3MF being written. */
  progressFile: string;
  exaggeration: string;
  exaggerationHint: string;
  base: string;
  simplification: string;
  simplificationOff: string;
  areaTooLarge: string;
  acrossAntimeridian: string;
  download: string;
  result: (p: { height: string; triangles: string; size: string }) => string;
  /** The heading of the map features coloured on the model. */
  colourFeatures: string;
  colourFeaturesHint: string;
  lineWidth: string;
  pointSize: string;
  /** The toggle colouring the model by OpenStreetMap landcover. */
  landcover: string;
  landcoverFailed: string;
  /** Landcover narrower than this is smoothed away, mm. */
  landcoverDetail: string;
  landcoverClasses: Record<LandcoverClass, string>;
  colours: string;
  /** The colour of everything but the coloured features. */
  ground: string;
  download3mf: string;
  premiumRefused: (p: { m: string }) => string;
  partialData: (p: { percent: string }) => string;
  noData: string;
  error: (p: { err: string }) => string;
  /** Above the elevation sources of a built model, as the map export puts it. */
  shareCredits: string;
  /** The elevation tiles named no datasets at all. */
  creditsNone: string;
  unknownSources: string;
  /** A request to credit Freemap too, before its name and link. */
  mentionFreemap: string;
  discardModelTitle: string;
  discardModelQuestion: string;
};
