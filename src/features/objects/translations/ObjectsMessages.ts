import type { SearchResult } from '@features/search/model/actions.js';
import type { JSX } from 'react';

export type ObjectsMessages = {
  source: string;
  detail: (props: { result: SearchResult }) => JSX.Element;
  type: string;
  lowZoomAlert: {
    message: (props: { minZoom: number }) => string;
    zoom: string;
  };
  tooManyPoints: (props: { limit: number }) => string;
  fetchingError: (props: { err: unknown }) => string;
  icon: {
    pin: string;
    ring: string;
    square: string;
  };
  convertAsPoint: string;
  convertWithGeometry: string;
  showAsLookup: string;
  convertAll: string;
};
