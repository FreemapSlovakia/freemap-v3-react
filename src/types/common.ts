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
    : T[K] extends Date | null | undefined
    ? string | null | undefined
    : StringDates<T[K]>;
};

// type Entries<T> = {
//   [K in keyof T]: [K, T[K] extends Record<string, unknown> ? Entries<T[K]> : 0];
// }[keyof T];

// // type Flatten<T> = {
// //   [K in keyof T]: T[K] extends [string, 0] ? T[K][0] : Flatten<T[K]>;
// // };

// type Trim0<T> = T extends [string, 0]
//   ? [T[0]]
//   : T extends [string, any]
//   ? [T[0], Trim0<T[1]>]
//   : never;

// type Flatten<T> = T extends [string]
//   ? [T[0]]
//   : T extends [string, [string] | any]
//   ? [T[0], T[1][0]]
//   : T extends [string, [string, [string] | any] | any]
//   ? [T[0], T[1][0], T[1][1][0]]
//   : never;

// // type NeededUnionType<T extends any[]> = T[number];

// // type Flatten<T extends any[]> = T extends [string, 0]
// //   ? ['T', T[0]]
// //   : [
// //       ...{
// //         [K in keyof T]: T[K] extends any[] ? NeededUnionType<T[K]> : T[K];
// //       }
// //     ];

// // type ConcatX<T extends any[][]> = [...T[0], ...T[1]];
// // type Flatten<T extends any[]> = [
// //   ...{ [K in keyof T]: T[K] extends any[] ? [T[K]] : [T[K]] }
// // ];

// // [T[0], T[1][0]]
// // : T extends [string, [string, [string, 0]]]
// // ? [T[0], T[1][0], T[1][1][0]]
// // : 666;

// // export type MessageKey1 = Messages[keyof Messages];

// type Ens = Trim0<Entries<Foo>>;
// // type Ens = Entries<Foo>;

// export const e1: Ens = ['a'];
// export const e2: Ens = ['b', ['c']];

// export type MM = Flatten<Ens>;

// export type MMM = Flatten<Entries<Messages>>;

// export const mm1: MM = ['a'];
// export const mm2: MM = ['b', 'c'];
// export const mm3: MM = ['b', 'd', 'e', 0];

// // export type MessageKey<T> = Partial<
// //   {
// //     [K in keyof T]: T[K] extends Record<string, unknown> ? MessageKey<T[K]> : 0;
// //   }
// // >;

// // export type TT = MessageKey<Messages>;

// export const tt: MMM = ['gallery', 'viewer', 'title', 0];

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

type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends Record<string, unknown>
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never;
    }[keyof T]
  : '';

// type Leaves<T, D extends number = 10> = [D] extends [never]
//   ? never
//   : T extends Record<string, unknown>
//   ? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
//   : '';

// type Foo = {
//   a: string;
//   b: {
//     c: 2;
//     d: {
//       e: 3;
//       f: ['4'];
//     };
//   };
// };

// export type Messages1 = {
//   tools: {
//     none: string;
//   };
// };

// export type PTHS = Leaves<Foo>;

export type MessagePaths = Paths<Messages>;
