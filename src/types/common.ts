import type * as Sentry from '@sentry/browser';
import type { PathOptions } from 'leaflet';
import type { Messages } from '../translations/messagesInterface.js';

export interface LatLon {
  lat: number;
  lon: number;
}

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    preventMapClick?: boolean;
    translations?: Messages;
    fmEmbedded: boolean;
    isRobot: boolean;
    fmHeadless?: {
      searchResultStyle?: PathOptions;
    };
    Sentry?: typeof Sentry;
  }

  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: { revision: string; url: string }[];
  }

  interface Window {
    _paq: {
      push: (
        args:
          | [
              'trackEvent',
              category: string,
              action: string,
              name?: string | number,
              value?: string | number,
            ]
          | ['setCookieConsentGiven']
          | ['setUserId', userId: string]
          | ['resetUserId']
          | ['trackPageView']
          | ['appendToTrackingUrl', appendToUrl: string],
      ) => void;
    };
  }
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
  ...0[],
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

export interface OffscreenCanvas extends EventTarget {
  getContext: (contextId: '2d') => CanvasRenderingContext2D;
}

export type CacheMode =
  | 'networkOnly'
  | 'networkFirst'
  | 'cacheFirst'
  | 'cacheOnly';

export type SwCacheAction =
  | {
      type: 'setCacheMode';
      payload: CacheMode;
    }
  | { type: 'clearCache' }
  | { type: 'setCachingActive'; payload: boolean };
