import type * as Sentry from '@sentry/browser';
import type { PathOptions } from 'leaflet';
import type { Messages } from '../../translations/messagesInterface.js';

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
    applyTheme: (theme?: 'dark' | 'light' | 'auto') => void;
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

type IsTuple<T extends unknown[]> = number extends T['length'] ? false : true;

export type StringDates<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? IsTuple<T> extends true
      ? { [K in keyof T]: StringDates<T[K]> } // tuple: preserve shape
      : StringDates<U>[] //  array
    : T extends (infer U)[]
      ? StringDates<U>[] // mutable array
      : T extends object
        ? { [K in keyof T]: StringDates<T[K]> } // plain object
        : T;

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

export type Shortcut = {
  code: string; // event.code of main key
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

export type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

export type DistributivePick<T, K extends keyof T> = T extends unknown
  ? Pick<T, K>
  : never;
