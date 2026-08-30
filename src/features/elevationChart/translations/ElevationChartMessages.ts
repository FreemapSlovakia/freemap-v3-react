import type { ReactNode } from 'react';

export type ElevationChartMessages = {
  uphill: string;
  downhill: string;
  downloadAsSvg: string;
  showWaypoints: string;
  elevationSource: string;
  fetchError: string;
  /** A function, not a string: it names a key, which is written as one. */
  rangeHint: () => ReactNode;
  /** The same, for a screen that is touched rather than pointed at. */
  rangeHintTouch: string;
};
