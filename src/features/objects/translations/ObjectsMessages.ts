import type { ElevationReading } from '@features/elevationChart/components/ElevationValue.js';
import type { SearchResult } from '@features/search/model/actions.js';
import type { JSX, ReactNode } from 'react';

export type ObjectsMessages = {
  source: string;
  detail: (props: {
    result: SearchResult;
    elevation: ElevationReading;
  }) => JSX.Element;
  elevation: string;
  showDetails: string;
  openInOsm: string;
  osmHistory: string;
  type: string;
  lowZoomAlert: {
    message: (props: { minZoom: number }) => string;
    zoom: string;
  };
  tooManyPoints: (props: { limit: number }) => string;
  fetchingError: (props: { err: unknown }) => string;
  markerShape: string;
  icon: {
    pin: string;
    ring: string;
    square: string;
  };
  convertWithGeometry: string;
  /** The same, where the destination has to be named — two such items in one menu. */
  convertWithGeometryTo: (props: { tool: ReactNode }) => JSX.Element;
  showAsLookup: string;
  tooManyForLookup: (props: { count: number; limit: number }) => string;
  style: {
    button: string;
    title: string;
  };
};
