import type { JSX } from 'react';
import type {
  CustomLayerOrder,
  ExtraLayer,
  OmittableLayer,
} from '../model/types.js';

export type MapToDocumentExportMessages = {
  exportError: (props: { err: unknown }) => string;
  cancelExportTitle: string;
  cancelExportQuestion: string;
  discardExportTitle: string;
  discardExportQuestion: string;
  area: string;
  format: string;
  layersTitle: string;
  mapDataTitle: string;
  mapTitle: string;
  layers: Record<ExtraLayer, string>;
  baseMap: string;
  noBaseMapHint: string;
  omitTitle: string;
  omit: Record<OmittableLayer, string>;
  omitHint: string;
  lossless: string;
  lossy: string;
  quality: string;
  mapScale: string;
  customLayerOrder: string;
  orders: Record<CustomLayerOrder, string>;
  decorations: string;
  scaleBar: string;
  northArrow: string;
  attribution: string;
  northArrowLetter: string;
  glow: string;
  labelTitle: string;
  alert: () => JSX.Element;
  ready: string;
  readyCredits: string;
  readyCreditsNone: string;
  readyUnknownSources: string;
  copyCredits: string;
  openInNewTab: string;
  savedCredits: (props: { credits: string }) => string;
};
