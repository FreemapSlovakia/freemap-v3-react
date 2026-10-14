import type { ElevationReading } from '@features/elevationChart/components/ElevationValue.js';
import type { SearchResult } from '@features/search/model/actions.js';
import type { JSX } from 'react';
import type { TerrainFacts } from '../model/terrainFacts.js';

export type ObjectsMessages = {
  source: string;
  detail: (props: {
    result: SearchResult;
    elevation: ElevationReading;
    terrain: TerrainFacts | null;
  }) => JSX.Element;
  elevation: string;
  terrain: {
    prominence: string;
    /** The lowest point on the way to higher ground. */
    keyCol: string;
    isolation: string;
    showRoute: string;
    hideRoute: string;
    /** Of a saddle, below the lower of the two areas it joins. */
    depth: string;
    /** The peak whose key col this saddle is. */
    keyColOf: string;
    showOnMap: string;
    /** Names the route once it is copied off the map. */
    route: string;
  };
  routeFetchError: (props: { err: unknown }) => string;
  showDetails: string;
  moreGeneralTypes: string;
  openInOsm: string;
  osmHistory: string;
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
  showAsLookup: string;
  showAllAsLookup: string;
  tooManyForLookup: (props: { count: number; limit: number }) => string;
  style: {
    button: string;
    title: string;
  };
};
