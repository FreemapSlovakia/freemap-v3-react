import { MapStateBase } from 'fm3/actions/mapActions';
import { RoutePlannerState } from 'fm3/reducers/routePlannerReducer';
import { TrackViewerState } from 'fm3/reducers/trackViewerReducer';
import { MainState } from 'fm3/reducers/mainReducer';
import { Translations } from 'fm3/stringUtils';

export interface LatLon {
  lat: number;
  lon: number;
}

export interface User {
  name: string;
  email: string;
  id: number;
  authToken: string;
  isAdmin: boolean;
  settings?: {
    expertMode?: boolean;
    trackViewerEleSmoothingFactor?: number;
    overlayOpacity?: { [type: string]: number };
    overlayPaneOpacity?: number;
  };
  preventTips?: boolean;
  lat?: number | null;
  lon?: number | null;
  notValidated?: boolean;
}

declare global {
  interface Window {
    ga: UniversalAnalytics.ga;
    FB: fb.FacebookStatic;
    fbAsyncInit?: () => void;
    handleGoogleAuthApiLoad?: () => void;
    preventMapClick?: boolean;
    translations?: Translations;
  }
}

export interface AppState {
  main: Pick<MainState, 'homeLocation' | 'expertMode'>;
  map: MapStateBase;
  trackViewer: Pick<TrackViewerState, 'eleSmoothingFactor'>;
  language: string | null;
  routePlanner: Pick<RoutePlannerState, 'transportType'>;
}

export type StringDates<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
    ? string | null
    : T[K] extends Date | undefined
    ? string | undefined
    : StringDates<T[K]>;
};

export interface OverpassElement extends LatLon {
  id: number;
  tags: {
    [key: string]: string;
  };
  type: 'way' | 'node' | 'relation';
  geometry?: any; // TODO per type
  center?: LatLon;
}

export interface OverpassResult {
  elements?: OverpassElement[];
}

interface OsmElement {
  id: number;
}

export interface OsmNode extends OsmElement, LatLon {
  type: 'node';
}

export interface OsmWay extends OsmElement {
  type: 'way';
  nodes: number[];
}

export interface OsmRelation extends OsmElement {
  type: 'relation';
  members: { type: 'node' | 'way' | 'relation'; ref: number }[];
}

export interface OsmResult {
  elements: (OsmNode | OsmWay | OsmRelation)[];
}
