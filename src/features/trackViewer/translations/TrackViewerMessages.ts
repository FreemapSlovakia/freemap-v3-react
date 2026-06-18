import type { JSX } from 'react';

export type TrackViewerMessages = {
  info: () => JSX.Element;
  upload: string;
  moreInfo: string;
  share: string;
  colorizingMode: {
    none: string;
    elevation: string;
    steepness: string;
    speed: string;
    heartRate: string;
    cadence: string;
    power: string;
    temperature: string;
    time: string;
    heading: string;
  };
  details: {
    startTime: string;
    finishTime: string;
    duration: string;
    distance: string;
    avgSpeed: string;
    minEle: string;
    maxEle: string;
    uphill: string;
    downhill: string;
    durationValue: (props: { h: number; m: number }) => string;
  };
  uploadModal: {
    title: string;
    drop: string;
  };
  shareToast: string;
  fetchingError: (props: { err: unknown }) => string;
  savingError: (props: { err: unknown }) => string;
  loadingError: string;
  onlyOne: string;
  invalidFormat: string;
  tooBigError: string;
};
