import type { TransportTypeMsgKey } from '@shared/transportTypeDefs.js';
import type { JSX, ReactNode } from 'react';
import type { RoutingMode } from '../model/actions.js';

type Err = { err: string };

export type RoutePlannerMessages = {
  default: string;
  leg: string;
  manualTooltip: string;
  ghParams: {
    tripParameters: string;
    seed: string;
    distance: string;
    isochroneParameters: string;
    buckets: string;
    timeLimit: string;
    distanceLimit: string;
  };
  milestones: string;
  start: string;
  stop: string;
  finish: string;
  swap: string;
  point: {
    point: string;
    pick: string;
    current: string;
    home: string;
  };
  transportType: Record<TransportTypeMsgKey, string>;
  development: string;
  mode: Record<RoutingMode | 'routndtrip-gh', string>;
  alternative: string;
  distance: ({ value, diff }: { value: string; diff?: string }) => JSX.Element;
  duration: ({
    h,
    m,
    diff,
  }: {
    h: number;
    m: number;
    diff?: {
      h: number;
      m: number;
    };
  }) => JSX.Element;
  summary: ({
    distance,
    h,
    m,
  }: {
    distance: ReactNode;
    h: ReactNode;
    m: ReactNode;
  }) => JSX.Element;
  noHomeAlert: {
    msg: string;
    setHome: string;
  };
  showMidpointHint: string;
  gpsError: string;
  routeNotFound: string;
  fetchingError: (props: Err) => string;
};
