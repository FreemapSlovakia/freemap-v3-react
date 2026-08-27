import type { JSX, ReactNode } from 'react';

export type DataViewerMessages = {
  info: () => JSX.Element;
  upload: string;
  /** Name for a line the file didn't name, by its position among the lines. */
  unnamedTrack: (props: { n: number }) => string;
  convertLossWarning: string;
  /** The tool menu's conversion, which takes every loaded feature. */
  convertAllToDrawing: string;
  moreInfo: string;
  saveAsMap: string;
  unsaved: string;
  unsavedTooltip: string;
  loginToSaveMap: string;
  style: {
    title: string;
  };
  /** Snapping a recorded track onto the routing graph. */
  match: {
    menuItem: string;
    title: string;
    help: string;
    transport: string;
    dataLoss: string;
    run: string;
    tooLong: string;
    tooShort: string;
    brokenSequence: string;
    offNetwork: string;
    partial: string;
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
    premiumHiRes: (premiumLink: (label: ReactNode) => ReactNode) => ReactNode;
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
  fetchingError: (props: { err: unknown }) => string;
  /** Matching a track to the routing graph failed for a reason worth showing. */
  matchingError: (props: { err: unknown }) => string;
  loadingError: string;
  onlyOne: string;
  invalidFormat: string;
  someFilesFailed: (props: { names: string }) => string;
};
