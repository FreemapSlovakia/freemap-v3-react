import type { LineKind } from '@shared/components/FeaturePropertiesModal.js';
import type { JSX, ReactNode } from 'react';
import type { OsmGpxVisibility } from '../model/actions.js';

export type DataViewerMessages = {
  info: () => JSX.Element;
  upload: string;
  /** Label for a selected line without one: its kind, numbered among its kind. */
  unnamedTrack: (props: { n: number; kind: LineKind }) => string;
  /** The tool menu's simplification, which takes every loaded feature. */
  simplifyAll: string;
  moreInfo: string;
  /** Splits a multi-point, multi-polygon or collection into its members. */
  breakApart: string;
  saveAsMap: string;
  unsaved: string;
  unsavedTooltip: string;
  loginToSaveMap: string;
  /** A history step whose data this browser no longer keeps. */
  snapshotGone: string;
  /** This browser refused to keep the data, so a reload will not find it. */
  snapshotFailed: string;
  /** The dialog of one vertex's position and recorded values. */
  vertex: {
    menuItem: string;
    latitude: string;
    longitude: string;
    elevation: string;
    time: string;
    /** How many of a line's points have a value of a channel. */
    filled: (props: { filled: number; total: number }) => string;
    /** Under the fields: what clearing one does. */
    emptyHint: string;
    notANumber: string;
    outOfRange: string;
    /** A time before the previous point's or after the next one's. */
    timeOrder: string;
    /** Names of the per-point channels, by their key in the data. */
    channels: {
      heart: string;
      cads: string;
      atemps: string;
      wtemps: string;
      depths: string;
      speeds: string;
      courses: string;
      bearings: string;
      powers: string;
      accuracies: string;
      battery: string;
      gsmSignal: string;
    };
  };
  /** Cutting a track in two, or into the segments a paused recording left. */
  split: {
    action: string;
    /** Stands in for the track's name while the cut is being aimed. */
    pick: string;
    here: string;
  };
  /** Joining the selected track with another loaded one. */
  join: {
    action: string;
    asLine: string;
    asSegments: string;
    /** Stands in for the track's name while the other one is being picked. */
    pick: string;
    /** The same, armed from an end point: the other line's end is picked. */
    pickEnd: string;
  };
  /** Uploading the loaded data as a GPS trace to the user's OSM account. */
  osmUpload: {
    menuItem: string;
    title: string;
    help: string;
    description: string;
    tags: string;
    tagsHint: string;
    tagsInvalid: string;
    visibility: string;
    visibilities: Record<OsmGpxVisibility, string>;
    visibilityHints: Record<OsmGpxVisibility, string>;
    upload: string;
    loginPrompt: string;
    connectPrompt: string;
    authorizePrompt: string;
    /** The permission was withdrawn between the modal's check and the upload. */
    reauthorize: string;
    success: (props: { url: string }) => JSX.Element;
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
    existingData: string;
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
    clear: string;
    clearDesc: string;
    update: string;
    updatedToast: (props: { mode: 'missing' | 'all' | 'clear' }) => string;
  };
  fetchingError: (props: { err: unknown }) => string;
  /** Matching a track to the routing graph failed for a reason worth showing. */
  matchingError: (props: { err: unknown }) => string;
  osmUploadError: (props: { err: unknown }) => string;
  loadingError: string;
  onlyOne: string;
  invalidFormat: string;
  someFilesFailed: (props: { names: string }) => string;
};
