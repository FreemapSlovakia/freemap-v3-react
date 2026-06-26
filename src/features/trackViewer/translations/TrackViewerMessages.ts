import type { JSX } from 'react';

export type TrackViewerMessages = {
  info: () => JSX.Element;
  upload: string;
  moreInfo: string;
  share: string;
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
    source: string;
    sourceOriginal: string;
    sourcePartial: string;
    sourceFilledGaps: string;
    sourceFilled: string;
  };
  uploadModal: {
    title: string;
    drop: string;
    mergeTitle: string;
    mergeMessage: string;
    append: string;
    replace: string;
  };
  elevationFill: {
    title: string;
    introNone: string;
    introPartial: string;
    introFull: string;
    question: string;
    overrideAll: string;
    overrideAllDesc: string;
    fillMissing: string;
    fillMissingDesc: string;
    keep: string;
    keepDesc: string;
    add: string;
    update: string;
    updateConfirm: string;
    updatedToast: (props: { mode: 'missing' | 'all' }) => string;
  };
  shareToast: string;
  fetchingError: (props: { err: unknown }) => string;
  savingError: (props: { err: unknown }) => string;
  loadingError: string;
  onlyOne: string;
  invalidFormat: string;
  someFilesFailed: (props: { names: string }) => string;
  tooBigError: string;
};
