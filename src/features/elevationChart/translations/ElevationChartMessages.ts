import type { AttributionDef } from '@shared/mapDefinitions.js';
import type { JSX, ReactNode } from 'react';

export type ElevationChartMessages = {
  uphill: string;
  downhill: string;
  downloadAsSvg: string;
  showWaypoints: string;
  elevationSource: string;
  /** Opens the credit list; the count rides beside it, so no plural agreement. */
  showAllSources: string;
  /** The whole credit list, for the toast that opens when it won't fit inline. */
  elevationSourceList: (props: { sources: AttributionDef[] }) => JSX.Element;
  fetchError: string;
  /** A function, not a string: it names a key, which is written as one. */
  rangeHint: () => ReactNode;
  /** The same, for a screen that is touched rather than pointed at. */
  rangeHintTouch: string;
};
