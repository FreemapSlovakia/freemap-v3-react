import type { JSX, ReactElement } from 'react';
import type { CustomLayerOrder, ExportableLayer } from '../model/types.js';

export type MapToDocumentExportMessages = {
  exportError: (props: { err: unknown }) => string;
  cancelExportTitle: string;
  cancelExportQuestion: string;
  area: string;
  format: string;
  layersTitle: string;
  mapDataTitle: string;
  layers: Record<ExportableLayer, string>;
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
  alert: (licence?: ReactElement[]) => JSX.Element;
};
