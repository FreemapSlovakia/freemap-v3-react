import { MapStateBase } from 'fm3/actions/mapActions';
import { RoutePlannerState } from 'fm3/reducers/routePlannerReducer';
import { TrackViewerState } from 'fm3/reducers/trackViewerReducer';
import { MainState } from 'fm3/reducers/mainReducer';
import { Messages } from 'fm3/translations/messagesInterface';

export interface LatLon {
  lat: number;
  lon: number;
}

export interface User {
  name: string;
  email: string | null;
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
    translations?: Messages;
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

interface OverpassElementBase {
  id: number;
  tags: {
    [key: string]: string;
  };
}

interface OverpassNodeElement extends OverpassElementBase, LatLon {
  type: 'node';
}

interface OverpassWayOrRelationElement extends OverpassElementBase {
  type: 'way' | 'relation';
  center: LatLon;
}

export type OverpassElement =
  | OverpassNodeElement
  | OverpassWayOrRelationElement;

export interface OverpassResult {
  elements: OverpassElement[];
}
