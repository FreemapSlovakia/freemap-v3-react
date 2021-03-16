import { MapStateBase } from 'fm3/actions/mapActions';
import { MainState } from 'fm3/reducers/mainReducer';
import { RoutePlannerState } from 'fm3/reducers/routePlannerReducer';
import { TrackViewerState } from 'fm3/reducers/trackViewerReducer';
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
  version?: number;
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
    : T[K] extends Date | null | undefined
    ? string | null | undefined
    : StringDates<T[K]>;
};

interface OsmElement {
  id: number;
  tags?: Record<string, string>;
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

// see https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object/58436959#58436959

type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  ...0[]
];

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

type Leaves<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends Record<string, unknown>
  ? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
  : '';

export type MessagePaths = Leaves<Messages>;
